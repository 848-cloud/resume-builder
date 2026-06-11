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
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航 */}
      <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">简历排版工具</h1>
          <p className="text-sm text-gray-500 mt-0.5">专为互联网产品经理设计</p>
        </div>
        <Button
          onClick={() => setShowCreate(true)}
          className="bg-gray-900 hover:bg-gray-700 text-white"
        >
          + 新建简历
        </Button>
      </header>

      {/* 内容区 */}
      <main className="max-w-5xl mx-auto px-8 py-10">
        {loading ? (
          <div className="flex items-center justify-center py-24 text-gray-400">加载中...</div>
        ) : resumes.length === 0 ? (
          /* 空状态 */
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">还没有简历</h2>
            <p className="text-gray-400 mb-8">创建你的第一份简历，开启求职之旅</p>
            <Button
              onClick={() => setShowCreate(true)}
              className="bg-gray-900 hover:bg-gray-700 text-white px-8"
            >
              + 新建简历
            </Button>
          </div>
        ) : (
          <div>
            <p className="text-sm text-gray-500 mb-6">共 {resumes.length} 份简历</p>
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

      {/* 新建简历弹窗 */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>新建简历</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <Label htmlFor="title" className="text-sm text-gray-600 mb-2 block">
              简历名称
            </Label>
            <Input
              id="title"
              placeholder="例如：张三·产品经理·2024"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>
              取消
            </Button>
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
      className="bg-white border border-gray-200 rounded-xl overflow-hidden cursor-pointer hover:shadow-md hover:border-gray-300 transition-all group"
      onClick={onEdit}
    >
      {/* 预览缩略图 */}
      <div className="w-full h-40 bg-gray-50 border-b border-gray-100 relative overflow-hidden px-4 py-3">
        {/* 模拟简历内容预览 */}
        <div className="scale-[0.45] origin-top-left w-[222%]">
          <div style={{ fontFamily: 'sans-serif' }}>
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {basicInfo.name || '未填写姓名'}
            </div>
            {basicInfo.position && (
              <div className="text-sm text-gray-600 mb-1">{basicInfo.position}</div>
            )}
            {(basicInfo.phone || basicInfo.email) && (
              <div className="text-xs text-gray-400 flex gap-4 mb-2">
                {basicInfo.phone && <span>{basicInfo.phone}</span>}
                {basicInfo.email && <span>{basicInfo.email}</span>}
              </div>
            )}
            <div className="border-t border-gray-300 pt-2 mt-1">
              <div className="text-sm font-bold text-gray-800 mb-1">工作经历</div>
              {resume.data.workExperience.slice(0, 2).map((w) => (
                <div key={w.id} className="text-xs text-gray-500 mb-0.5">
                  {w.company} · {w.position}
                </div>
              ))}
              {resume.data.workExperience.length === 0 && (
                <div className="text-xs text-gray-300">暂无工作经历</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 信息 + 操作按钮 */}
      <div className="px-4 py-3">
        <h3 className="font-semibold text-gray-900 mb-0.5 truncate text-sm">{resume.title}</h3>
        <p className="text-xs text-gray-400 mb-3">最后编辑：{formatDate(resume.updatedAt)}</p>
        {/* 操作按钮 */}
        <div className="flex gap-2">
          <button
            onClick={onEdit}
            className="flex-1 text-xs py-1.5 border border-gray-200 rounded text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-colors"
          >
            编辑
          </button>
          <button
            onClick={onCopy}
            className="flex-1 text-xs py-1.5 border border-gray-200 rounded text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-colors"
          >
            复制
          </button>
          <button
            onClick={onDelete}
            className="flex-1 text-xs py-1.5 border border-gray-200 rounded text-red-400 hover:bg-red-50 hover:border-red-200 transition-colors"
          >
            删除
          </button>
        </div>
      </div>
    </div>
  )
}
