'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { getAllResumes, createResume, deleteResume, copyResume } from '@/lib/db'
import { extractTextFromFile, parseResumeText, summarizeParsed } from '@/lib/parseResume'
import type { ResumeRecord, ResumeData } from '@/types/resume'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function HomePage() {
  const router = useRouter()
  const [resumes, setResumes] = useState<ResumeRecord[]>([])
  const [loading, setLoading] = useState(true)

  // 新建弹窗
  const [showCreate, setShowCreate] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [creating, setCreating] = useState(false)

  // 导入弹窗
  const [showImport, setShowImport] = useState(false)
  const [importFile, setImportFile] = useState<File | null>(null)
  const [importTitle, setImportTitle] = useState('')
  const [importing, setImporting] = useState(false)
  const [importPreview, setImportPreview] = useState<string>('')
  const [importError, setImportError] = useState<string>('')
  const [parsedData, setParsedData] = useState<ResumeData | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const loadResumes = async () => {
    try {
      const list = await getAllResumes()
      setResumes(list)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadResumes()
  }, [])

  // ── 新建 ──
  const handleCreate = async () => {
    if (!newTitle.trim()) return
    setCreating(true)
    try {
      const record = await createResume(newTitle.trim())
      router.push(`/editor/${record.id}`)
    } finally {
      setCreating(false)
      setShowCreate(false)
      setNewTitle('')
    }
  }

  // ── 导入文件选择 ──
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setImportFile(file)
    setImportError('')
    setImportPreview('')
    setParsedData(null)

    // 自动填充标题（去掉扩展名）
    const nameWithoutExt = file.name.replace(/\.[^.]+$/, '')
    setImportTitle(nameWithoutExt)

    // 开始解析预览
    setImporting(true)
    try {
      const text = await extractTextFromFile(file)
      const data = parseResumeText(text)
      setParsedData(data)
      setImportPreview(summarizeParsed(data))
    } catch (err) {
      setImportError(err instanceof Error ? err.message : '解析失败，请检查文件格式')
    } finally {
      setImporting(false)
    }
  }

  // ── 确认导入 ──
  const handleImportConfirm = async () => {
    if (!parsedData || !importTitle.trim()) return
    setImporting(true)
    try {
      const { createResumeWithData } = await import('@/lib/db')
      const record = await createResumeWithData(importTitle.trim(), parsedData)
      router.push(`/editor/${record.id}`)
    } finally {
      setImporting(false)
      resetImport()
    }
  }

  const resetImport = () => {
    setShowImport(false)
    setImportFile(null)
    setImportTitle('')
    setImportPreview('')
    setImportError('')
    setParsedData(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  // ── 删除 / 复制 ──
  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm('确定删除这份简历吗？')) return
    await deleteResume(id)
    loadResumes()
  }

  const handleCopy = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const record = await copyResume(id)
    if (record) loadResumes()
  }

  const formatDate = (ts: number) => {
    return new Date(ts).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="min-h-screen bg-[#f7f6f2]">

      {/* ── Hero 区域 ── */}
      <section className="relative h-[480px] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1600&q=80&auto=format&fit=crop')`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/60" />

        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6">
          <p className="text-white/80 text-sm tracking-[0.4em] mb-4 font-semibold">简 · 历</p>
          <h1
            className="text-white font-bold tracking-tight mb-4"
            style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)', letterSpacing: '-0.02em' }}
          >
            Simple Resume
          </h1>
          <p className="text-white/70 text-base md:text-lg font-light tracking-wide mb-10">
            Simple resume, clear story.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setShowCreate(true)}
              className="px-8 py-3 bg-white text-gray-900 font-semibold text-sm rounded-full hover:bg-white/90 transition-all shadow-lg hover:shadow-xl active:scale-95"
            >
              新建简历
            </button>
            <button
              onClick={() => setShowImport(true)}
              className="px-8 py-3 bg-white/20 text-white font-semibold text-sm rounded-full border border-white/40 hover:bg-white/30 transition-all shadow-lg active:scale-95 backdrop-blur-sm"
            >
              导入简历
            </button>
          </div>
        </div>
      </section>

      {/* ── 简历列表 ── */}
      <main className="max-w-5xl mx-auto px-6 py-12">
        {loading ? (
          <div className="flex items-center justify-center py-24 text-gray-400 text-sm">加载中...</div>
        ) : resumes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-white border border-gray-200 rounded-2xl flex items-center justify-center mb-5 shadow-sm">
              <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-600 mb-2">还没有简历</h2>
            <p className="text-gray-400 text-sm mb-7">在上方新建或导入一份简历，开始编辑</p>
          </div>
        ) : (
          <div>
            <div className="mb-7">
              <h2 className="text-xl font-bold text-gray-900">我的简历</h2>
              <p className="text-sm text-gray-400 mt-0.5">共 {resumes.length} 份</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {resumes.map((resume) => (
                <ResumeCard
                  key={resume.id}
                  resume={resume}
                  onEdit={() => router.push(`/editor/${resume.id}`)}
                  onCopy={(e) => handleCopy(resume.id, e)}
                  onDelete={(e) => handleDelete(resume.id, e)}
                  formatDate={formatDate}
                />
              ))}
            </div>
          </div>
        )}
      </main>

      {/* ── 页脚 ── */}
      <footer className="text-center py-8 text-xs text-gray-400 border-t border-gray-200">
        © 2025 Simple Resume · 简·历 &nbsp;·&nbsp; Simple resume, clear story.
      </footer>

      {/* ── 新建简历弹窗 ── */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>新建简历</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <Label htmlFor="title" className="text-sm text-gray-600 mb-2 block">简历名称</Label>
            <Input
              id="title"
              placeholder="例如：张三·产品经理·2025"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>取消</Button>
            <Button
              onClick={handleCreate}
              disabled={!newTitle.trim() || creating}
              className="bg-gray-900 hover:bg-gray-700 text-white"
            >
              {creating ? '创建中...' : '开始编辑'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── 导入简历弹窗 ── */}
      <Dialog open={showImport} onOpenChange={(open) => { if (!open) resetImport() }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>导入简历</DialogTitle>
          </DialogHeader>

          <div className="py-2 space-y-5">
            {/* 文件上传区 */}
            <div>
              <Label className="text-sm text-gray-600 mb-2 block">选择文件</Label>
              <div
                className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center cursor-pointer hover:border-gray-400 hover:bg-gray-50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                {importFile ? (
                  <div className="flex items-center justify-center gap-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-medium text-gray-800">{importFile.name}</p>
                      <p className="text-xs text-gray-400">{(importFile.size / 1024).toFixed(1)} KB</p>
                    </div>
                  </div>
                ) : (
                  <div>
                    <svg className="w-10 h-10 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    <p className="text-sm text-gray-500 mb-1">点击选择文件</p>
                    <p className="text-xs text-gray-400">支持 PDF、Word (.docx)、纯文本 (.txt)</p>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.txt"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            {/* 解析状态 */}
            {importing && (
              <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 rounded-lg px-4 py-3">
                <svg className="w-4 h-4 animate-spin text-gray-400" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                正在识别简历内容...
              </div>
            )}

            {importError && (
              <div className="text-sm text-red-500 bg-red-50 rounded-lg px-4 py-3">
                ⚠️ {importError}
              </div>
            )}

            {importPreview && !importing && (
              <div className="bg-green-50 border border-green-100 rounded-lg px-4 py-3">
                <p className="text-xs font-medium text-green-700 mb-1">✓ 识别成功</p>
                <p className="text-xs text-green-600">{importPreview}</p>
                <p className="text-xs text-gray-400 mt-2">导入后可在编辑页继续完善内容</p>
              </div>
            )}

            {/* 简历名称 */}
            {parsedData && (
              <div>
                <Label className="text-sm text-gray-600 mb-2 block">简历名称</Label>
                <Input
                  placeholder="给这份简历起个名字"
                  value={importTitle}
                  onChange={(e) => setImportTitle(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleImportConfirm()}
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={resetImport}>取消</Button>
            <Button
              onClick={handleImportConfirm}
              disabled={!parsedData || !importTitle.trim() || importing}
              className="bg-gray-900 hover:bg-gray-700 text-white"
            >
              {importing ? '导入中...' : '导入并编辑'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

interface ResumeCardProps {
  resume: ResumeRecord
  onEdit: () => void
  onCopy: (e: React.MouseEvent) => void
  onDelete: (e: React.MouseEvent) => void
  formatDate: (ts: number) => string
}

function ResumeCard({ resume, onEdit, onCopy, onDelete, formatDate }: ResumeCardProps) {
  const { basicInfo } = resume.data

  return (
    <div
      className="bg-white border border-gray-200 rounded-2xl overflow-hidden cursor-pointer hover:shadow-lg hover:border-gray-300 transition-all duration-200 group"
      onClick={onEdit}
    >
      <div className="w-full h-40 bg-gray-50 border-b border-gray-100 relative overflow-hidden px-4 py-3">
        <div className="scale-[0.45] origin-top-left w-[222%]">
          <div style={{ fontFamily: 'sans-serif' }}>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {basicInfo.name || '未填写姓名'}
            </div>
            {basicInfo.position && (
              <div className="text-sm text-gray-500 mb-1">{basicInfo.position}</div>
            )}
            {(basicInfo.phone || basicInfo.email) && (
              <div className="text-xs text-gray-400 flex gap-4 mb-2">
                {basicInfo.phone && <span>{basicInfo.phone}</span>}
                {basicInfo.email && <span>{basicInfo.email}</span>}
              </div>
            )}
            <div className="border-t border-gray-200 pt-2 mt-1">
              <div className="text-sm font-bold text-gray-800 mb-1">工作经历</div>
              {resume.data.workExperience.slice(0, 2).map((w) => (
                <div key={w.id} className="text-xs text-gray-500 mb-0.5">
                  {w.company}{w.position ? ` · ${w.position}` : ''}
                </div>
              ))}
              {resume.data.workExperience.length === 0 && (
                <div className="text-xs text-gray-300">暂无工作经历</div>
              )}
            </div>
          </div>
        </div>
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/[0.03] transition-colors" />
      </div>

      <div className="px-4 py-3.5">
        <h3 className="font-semibold text-gray-900 mb-0.5 truncate text-sm">{resume.title}</h3>
        <p className="text-xs text-gray-400 mb-3.5">最后编辑：{formatDate(resume.updatedAt)}</p>
        <div className="flex gap-2">
          <button onClick={onEdit} className="flex-1 text-xs py-1.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-colors">编辑</button>
          <button onClick={onCopy} className="flex-1 text-xs py-1.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-colors">复制</button>
          <button onClick={onDelete} className="flex-1 text-xs py-1.5 border border-gray-200 rounded-lg text-red-400 hover:bg-red-50 hover:border-red-200 transition-colors">删除</button>
        </div>
      </div>
    </div>
  )
}
