import type { ResumeData } from '@/types/resume'
import { renderInlineMarkdown } from './renderUtils'

/**
 * 排版设计系统
 *
 * 字号层级：
 *   姓名         30px / 800 / #111 / 字间距3px
 *   章节标题     14px / 700 / #111 / 字间距1px  + 下边框
 *   公司名       13px / 700 / #111
 *   项目标题     12.5px / 600 / #111
 *   正文（职责） 12px / 400 / #222 / 楷体 / 行高1.85  ← 主角
 *   项目描述     12px / 400 / #333 / 无衬线 / 行高1.8
 *   次要信息     11.5px / 400 / #999  （职位、日期、联系方式）
 *
 * 颜色层级：
 *   #111  最重：姓名、章节标题、公司名、项目标题
 *   #222  次重：岗位职责正文
 *   #333  正文：项目描述
 *   #999  弱化：职位、日期、联系方式、工作年限
 */

interface CompactThemeProps {
  data: ResumeData
}

const SANS = "-apple-system, 'PingFang SC', 'Microsoft YaHei', sans-serif"
const KAITI = "'KaitiSC', 'Kaiti SC', 'STKaiti', serif"

export default function CompactTheme({ data }: CompactThemeProps) {
  const { basicInfo, summary, workExperience, education, extraModules } = data
  const hasExtra =
    extraModules.certificates.length > 0 ||
    extraModules.languages.length > 0 ||
    extraModules.portfolioLinks.length > 0

  return (
    <div
      style={{
        fontFamily: SANS,
        padding: '40px 52px',
        fontSize: '12px',
        lineHeight: '1.75',
        color: '#222',
        background: '#fff',
      }}
    >
      {/* ── 基本信息 ── */}
      <div style={{ marginBottom: '22px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '20px' }}>
        <div style={{ flex: 1 }}>
          {/* 姓名 */}
          <h1 style={{ fontSize: '30px', fontWeight: '800', letterSpacing: '3px', color: '#111', marginBottom: '6px', lineHeight: 1.2 }}>
            {basicInfo.name || '姓名'}
          </h1>
          {/* 岗位 + 年限 */}
          <div style={{ fontSize: '14px', color: '#555', fontWeight: '400', marginBottom: '8px', letterSpacing: '0.3px' }}>
            {basicInfo.position || '求职意向'}
            {basicInfo.yearsOfExperience && (
              <span style={{ marginLeft: '12px' }}>{basicInfo.yearsOfExperience}</span>
            )}
          </div>
          {/* 联系方式 */}
          <div style={{ display: 'flex', gap: '24px', fontSize: '13px', color: '#555' }}>
            {basicInfo.phone && <span>{basicInfo.phone}</span>}
            {basicInfo.email && <span>{basicInfo.email}</span>}
          </div>
        </div>
        {basicInfo.avatar && (
          <img
            src={basicInfo.avatar}
            alt="证件照"
            style={{ width: '115px', height: '137px', objectFit: 'cover', borderRadius: '2px', flexShrink: 0 }}
          />
        )}
      </div>

      {/* ── 自我描述 ── */}
      {summary && (
        <SectionBlock title="自我描述">
          <p style={{ color: '#333', lineHeight: '1.85', fontSize: '12px' }}>{summary}</p>
        </SectionBlock>
      )}

      {/* ── 工作经历 ── */}
      {workExperience.length > 0 && (
        <SectionBlock title="工作经历">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {workExperience.map((work) => (
              <div key={work.id}>
                {/* 公司行 */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
                    <span style={{ fontWeight: '700', fontSize: '13px', color: '#111' }}>
                      {work.company}
                    </span>
                    {work.position && (
                      <span style={{ color: '#999', fontSize: '11.5px', fontWeight: '400' }}>
                        {work.position}
                      </span>
                    )}
                  </div>
                  <span style={{ color: '#999', fontSize: '11px', flexShrink: 0, marginLeft: '8px' }}>
                    {work.startDate}{work.startDate && (work.endDate || work.isCurrent) ? ' - ' : ''}{work.isCurrent ? '至今' : work.endDate}
                  </span>
                </div>

                {/* 岗位职责 — 楷体，主角，加粗放大 */}
                {work.responsibilities && (
                  <div style={{
                    color: '#111',
                    lineHeight: '1.85',
                    marginTop: '4px',
                    marginBottom: work.projects.length > 0 ? '10px' : '0',
                    whiteSpace: 'pre-wrap',
                    fontSize: '14px',
                    fontWeight: '400',
                    fontFamily: KAITI,
                    letterSpacing: 'normal',
                  }}>
                    {work.responsibilities}
                  </div>
                )}

                {/* 项目经验 */}
                {work.projects.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {work.projects.map((p) => (
                      <div key={p.id}>
                        {/* 项目标题单独一行 */}
                        {p.name && (
                          <div style={{ fontWeight: '600', fontSize: '12.5px', color: '#111', marginBottom: '3px' }}>
                            {p.name}
                          </div>
                        )}
                        {/* 目标 + 描述合为一段，目标加粗在前 */}
                        {(p.goal || p.description) && (
                          <div style={{ color: '#333', lineHeight: '1.8', fontSize: '12px', whiteSpace: 'pre-wrap' }}>
                            {p.goal && (
                              <span style={{ fontWeight: '700', color: '#111' }}>{p.goal}</span>
                            )}
                            {p.goal && p.description && (
                              <span>{'\n'}</span>
                            )}
                            {p.description && renderInlineMarkdown(p.description)}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </SectionBlock>
      )}

      {/* ── 教育经历 ── */}
      {education.length > 0 && (
        <SectionBlock title="教育经历">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {education.map((edu) => (
              <div key={edu.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
                  <span style={{ fontWeight: '700', fontSize: '12px', color: '#111' }}>{edu.school}</span>
                  {edu.major && (
                    <span style={{ color: '#333', fontSize: '12px', fontWeight: '400' }}>{edu.major}</span>
                  )}
                  {edu.degree && (
                    <span style={{ color: '#333', fontSize: '12px', fontWeight: '400' }}>{edu.degree}</span>
                  )}
                </div>
                <span style={{ color: '#999', fontSize: '11px', flexShrink: 0 }}>
                  {edu.startDate}{edu.startDate && edu.endDate ? ' - ' : ''}{edu.endDate}
                </span>
              </div>
            ))}
          </div>
        </SectionBlock>
      )}

      {/* ── 其他 ── */}
      {hasExtra && (
        <SectionBlock title="其他">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            {extraModules.certificates.length > 0 && (
              <div style={{ fontSize: '12px', color: '#333' }}>
                <span style={{ fontWeight: '600', color: '#111', marginRight: '6px' }}>证书：</span>
                {extraModules.certificates.map((c) => c.name).join('  ·  ')}
              </div>
            )}
            {extraModules.languages.length > 0 && (
              <div style={{ fontSize: '12px', color: '#333' }}>
                <span style={{ fontWeight: '600', color: '#111', marginRight: '6px' }}>语言：</span>
                {extraModules.languages.join('  ·  ')}
              </div>
            )}
            {extraModules.portfolioLinks.length > 0 && (
              <div style={{ fontSize: '12px', color: '#333' }}>
                <span style={{ fontWeight: '600', color: '#111', marginRight: '6px' }}>作品：</span>
                {extraModules.portfolioLinks.map((l, i) => (
                  <span key={l.id}>
                    {i > 0 && '  ·  '}
                    <a href={l.url} style={{ color: '#111', textDecoration: 'underline' }}>{l.label}</a>
                  </span>
                ))}
              </div>
            )}
          </div>
        </SectionBlock>
      )}
    </div>
  )
}

function SectionBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '18px' }}>
      <h2 style={{
        fontSize: '14px',
        fontWeight: '700',
        color: '#111',
        letterSpacing: '1px',
        margin: 0,
        padding: 0,
        marginBottom: '10px',
      }}>
        {title}
      </h2>
      {children}
    </div>
  )
}
