/**
 * 简历文件解析工具
 *
 * 支持格式：
 *   - .txt  — 直接读取文本
 *   - .pdf  — 使用 pdfjs-dist 提取文本
 *   - .doc / .docx — 使用 mammoth 提取纯文本
 *
 * 解析策略：
 *   基于常见中文简历的段落结构，通过关键词识别模块边界，
 *   将自由文本映射到 ResumeData 结构体。
 */

import type { ResumeData, WorkExperience, Education, ProjectExperience } from '@/types/resume'
import { DEFAULT_RESUME_DATA } from '@/types/resume'

// ─── 文本提取 ────────────────────────────────────────────────

export async function extractTextFromFile(file: File): Promise<string> {
  const ext = file.name.split('.').pop()?.toLowerCase()

  if (ext === 'txt') {
    return file.text()
  }

  if (ext === 'pdf') {
    return extractFromPDF(file)
  }

  if (ext === 'doc' || ext === 'docx') {
    return extractFromDocx(file)
  }

  throw new Error(`不支持的文件格式：.${ext}`)
}

async function extractFromPDF(file: File): Promise<string> {
  // 动态加载 pdfjs-dist（避免 SSR 问题）
  const pdfjsLib = await import('pdfjs-dist')
  pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`

  const arrayBuffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
  const texts: string[] = []

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    const pageText = content.items
      .map((item: unknown) => {
        const i = item as { str?: string }
        return i.str ?? ''
      })
      .join(' ')
    texts.push(pageText)
  }

  return texts.join('\n')
}

async function extractFromDocx(file: File): Promise<string> {
  const mammoth = await import('mammoth')
  const arrayBuffer = await file.arrayBuffer()
  const result = await mammoth.extractRawText({ arrayBuffer })
  return result.value
}

// ─── 简历文本解析 ─────────────────────────────────────────────

/** 段落归属的模块类型 */
type Section =
  | 'basicInfo'
  | 'summary'
  | 'workExperience'
  | 'education'
  | 'extraModules'
  | 'unknown'

/** 判断一行文字属于哪个模块标题 */
function detectSection(line: string): Section | null {
  const l = line.trim().toLowerCase()
  const cn = line.trim()

  // 工作经历
  if (/工作经历|工作经验|职业经历|employment|work experience/i.test(cn)) return 'workExperience'
  // 教育经历
  if (/教育经历|教育背景|学历|education/i.test(cn)) return 'education'
  // 个人总结 / 自我评价
  if (/个人总结|自我评价|自我介绍|个人简介|summary|profile|objective/i.test(cn)) return 'summary'
  // 其他（证书、技能、语言等）
  if (/证书|奖项|荣誉|技能|语言|其他|certificate|skill|language/i.test(cn)) return 'extraModules'
  // 基本信息兜底
  if (/基本信息|个人信息|联系方式|contact/i.test(cn)) return 'basicInfo'

  // 避免 unused variable warning
  void l
  return null
}

/** 从文本第一部分提取基本信息 */
function parseBasicInfo(lines: string[]) {
  const info: ResumeData['basicInfo'] = {
    name: '',
    phone: '',
    email: '',
    position: '',
    yearsOfExperience: '',
  }

  for (const raw of lines.slice(0, 20)) {
    const line = raw.trim()
    if (!line) continue

    // 手机号
    if (!info.phone && /1[3-9]\d{9}/.test(line)) {
      const m = line.match(/1[3-9]\d{9}/)
      if (m) info.phone = m[0]
    }

    // 邮箱
    if (!info.email && /[\w.+-]+@[\w-]+\.[a-z]{2,}/i.test(line)) {
      const m = line.match(/[\w.+-]+@[\w-]+\.[a-z]{2,}/i)
      if (m) info.email = m[0]
    }

    // 年限
    if (!info.yearsOfExperience && /\d+\s*年.*经验|经验.*\d+\s*年/.test(line)) {
      info.yearsOfExperience = line.replace(/^.*?(\d+\s*年[^，。\s]*).*$/, '$1')
    }

    // 求职意向 / 岗位
    if (!info.position && /(求职意向|应聘岗位|岗位|职位)[：:]\s*(.+)/.test(line)) {
      const m = line.match(/(求职意向|应聘岗位|岗位|职位)[：:]\s*(.+)/)
      if (m) info.position = m[2].trim()
    }
  }

  // 姓名：前几行里第一个短的纯中文行（2-6字）
  for (const raw of lines.slice(0, 8)) {
    const line = raw.trim()
    if (/^[\u4e00-\u9fa5]{2,6}$/.test(line) && !info.name) {
      info.name = line
      break
    }
  }

  return info
}

/** 解析工作经历段落 */
function parseWorkExperiences(lines: string[]): WorkExperience[] {
  const results: WorkExperience[] = []
  let current: WorkExperience | null = null

  // 日期模式：2020.03 - 2022.06 | 2020/03~2022 | 2020年3月-至今
  const dateRangeRe = /(\d{4}[./年]\d{1,2}[月]?)\s*[-–~至~]\s*(\d{4}[./年]\d{1,2}[月]?|至今|present)/i

  for (const raw of lines) {
    const line = raw.trim()
    if (!line) continue

    const dateMatch = line.match(dateRangeRe)

    if (dateMatch) {
      // 遇到日期行，可能是新的公司行
      if (current) results.push(current)

      // 尝试从同一行提取公司名和职位
      const withoutDate = line.replace(dateRangeRe, '').trim()
      const parts = withoutDate.split(/[\s|｜·\-–]+/).filter(Boolean)

      current = {
        id: `w_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        company: parts[0] || '',
        position: parts[1] || '',
        startDate: dateMatch[1].replace(/年|月/g, '.'),
        endDate: /至今|present/i.test(dateMatch[2]) ? '' : dateMatch[2].replace(/年|月/g, '.'),
        isCurrent: /至今|present/i.test(dateMatch[2]),
        responsibilities: '',
        projects: [],
      }
      continue
    }

    if (!current) {
      // 还没遇到日期，可能是公司名行（含"公司"二字）
      if (/公司|集团|科技|网络|有限|inc\.|ltd\.|corp\./i.test(line) && line.length < 40) {
        current = {
          id: `w_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          company: line,
          position: '',
          startDate: '',
          endDate: '',
          isCurrent: false,
          responsibilities: '',
          projects: [],
        }
      }
      continue
    }

    // 职责内容累积
    if (current) {
      current.responsibilities += (current.responsibilities ? '\n' : '') + line
    }
  }

  if (current) results.push(current)
  return results
}

/** 解析教育经历段落 */
function parseEducation(lines: string[]): Education[] {
  const results: Education[] = []
  let current: Education | null = null

  const dateRangeRe = /(\d{4}[./年]\d{1,2}[月]?)\s*[-–~至~]\s*(\d{4}[./年]\d{1,2}[月]?|至今)/i
  const degreeRe = /博士|硕士|学士|本科|专科|MBA|MPA|研究生|undergraduate|master|bachelor|phd/i

  for (const raw of lines) {
    const line = raw.trim()
    if (!line) continue

    const dateMatch = line.match(dateRangeRe)

    if (dateMatch) {
      if (current) results.push(current)
      const withoutDate = line.replace(dateRangeRe, '').trim()
      const parts = withoutDate.split(/[\s|｜·]+/).filter(Boolean)
      current = {
        id: `e_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        school: parts[0] || '',
        major: parts[1] || '',
        degree: parts[2] || '',
        startDate: dateMatch[1].replace(/年|月/g, '.'),
        endDate: dateMatch[2].replace(/年|月/g, '.'),
      }
      continue
    }

    // 含学位关键词的行
    if (degreeRe.test(line) && !current) {
      current = {
        id: `e_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        school: '',
        major: '',
        degree: line.match(degreeRe)?.[0] || '',
        startDate: '',
        endDate: '',
      }
    }

    // 含"大学/学院"的行作为学校名
    if (/大学|学院|university|college/i.test(line) && line.length < 30) {
      if (!current) {
        current = {
          id: `e_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          school: line,
          major: '',
          degree: '',
          startDate: '',
          endDate: '',
        }
      } else if (!current.school) {
        current.school = line
      }
    }
  }

  if (current) results.push(current)
  return results
}

// ─── 主入口 ──────────────────────────────────────────────────

/**
 * 将提取出的纯文本解析为 ResumeData 结构
 */
export function parseResumeText(text: string): ResumeData {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0)

  // 1. 按模块分段
  const sections: Record<Section, string[]> = {
    basicInfo: [],
    summary: [],
    workExperience: [],
    education: [],
    extraModules: [],
    unknown: [],
  }

  let currentSection: Section = 'basicInfo'
  // 前 15 行默认归入 basicInfo
  let basicInfoEnd = Math.min(15, lines.length)

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const detected = detectSection(line)

    if (detected) {
      currentSection = detected
      basicInfoEnd = Math.min(basicInfoEnd, i)
      continue
    }

    sections[currentSection].push(line)
  }

  // basicInfo 区域 = 前几行
  sections.basicInfo = lines.slice(0, basicInfoEnd)

  // 2. 解析各模块
  const basicInfo = parseBasicInfo(lines)
  const workExperience = parseWorkExperiences(sections.workExperience)
  const education = parseEducation(sections.education)
  const summary = sections.summary.join('\n').trim()

  // 3. 组装结果
  return {
    ...JSON.parse(JSON.stringify(DEFAULT_RESUME_DATA)),
    basicInfo,
    summary,
    workExperience,
    education,
  }
}

/** 预览解析结果：返回人类可读的摘要 */
export function summarizeParsed(data: ResumeData): string {
  const parts: string[] = []
  if (data.basicInfo.name) parts.push(`姓名：${data.basicInfo.name}`)
  if (data.basicInfo.position) parts.push(`岗位：${data.basicInfo.position}`)
  if (data.workExperience.length) parts.push(`工作经历：${data.workExperience.length} 段`)
  if (data.education.length) parts.push(`教育经历：${data.education.length} 段`)
  if (data.summary) parts.push('个人总结：已识别')
  return parts.join('  ·  ')
}
