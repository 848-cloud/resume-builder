'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getAllResumes, createResume, deleteResume, copyResume } from '@/lib/db'
import type { ResumeRecord } from '@/types/resume'
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
            <p className="text-gray-400 text-sm mb-7">在上方新建一份简历，开始编辑</p>
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
