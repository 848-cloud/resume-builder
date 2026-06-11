'use client'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { getResume, updateResumeTitle } from '@/lib/db'
import { useResumeStore } from '@/store/useResumeStore'
import EditorLayout from '@/components/editor/EditorLayout'

interface EditorPageProps {
  params: Promise<{ id: string }>
}

export default function EditorPage({ params }: EditorPageProps) {
  const { id } = use(params)
  const router = useRouter()
  const { loadResume } = useResumeStore()
  const [loading, setLoading] = useState(true)
  const [title, setTitle] = useState('')
  const [editingTitle, setEditingTitle] = useState(false)
  const [tempTitle, setTempTitle] = useState('')

  useEffect(() => {
    const load = async () => {
      const record = await getResume(id)
      if (!record) {
        router.push('/')
        return
      }
      setTitle(record.title)
      loadResume(record.id, record.data)
      setLoading(false)
    }
    load()
  }, [id, router, loadResume])

  const handleTitleSave = async () => {
    if (!tempTitle.trim()) return
    await updateResumeTitle(id, tempTitle.trim())
    setTitle(tempTitle.trim())
    setEditingTitle(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <p className="text-gray-400">加载中...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-50">
      {/* 顶部栏 */}
      <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shrink-0 z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/')}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          {editingTitle ? (
            <input
              autoFocus
              className="text-base font-semibold text-gray-900 border-b border-gray-300 outline-none bg-transparent min-w-[200px]"
              value={tempTitle}
              onChange={(e) => setTempTitle(e.target.value)}
              onBlur={handleTitleSave}
              onKeyDown={(e) => e.key === 'Enter' && handleTitleSave()}
            />
          ) : (
            <button
              className="text-base font-semibold text-gray-900 hover:text-gray-600 transition-colors"
              onClick={() => {
                setTempTitle(title)
                setEditingTitle(true)
              }}
            >
              {title}
              <span className="ml-2 text-gray-300 text-xs font-normal">点击修改</span>
            </button>
          )}
        </div>
      </header>

      {/* 编辑器主体 */}
      <EditorLayout resumeId={id} />
    </div>
  )
}
