'use client'

import { useCallback, useEffect, useRef } from 'react'
import { useResumeStore } from '@/store/useResumeStore'
import EditorPanel from './EditorPanel'
import ResumePreview from '../preview/ResumePreview'
import { Button } from '@/components/ui/button'

interface EditorLayoutProps {
  resumeId: string
}

export default function EditorLayout({ resumeId }: EditorLayoutProps) {
  const { isDirty, saveResume, data } = useResumeStore()
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // 修改即自动保存（1秒防抖）
  useEffect(() => {
    if (!isDirty) return
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    saveTimerRef.current = setTimeout(() => {
      saveResume()
    }, 1000)
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    }
  }, [isDirty, saveResume, data])

  const handleManualSave = useCallback(async () => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    await saveResume()
  }, [saveResume])

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* 左侧表单区 */}
      <div className="w-[420px] shrink-0 bg-white border-r border-gray-200 overflow-y-auto flex flex-col">
        {/* 工具栏 */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            {isDirty ? (
              <span className="text-xs text-amber-500">● 保存中...</span>
            ) : (
              <span className="text-xs text-gray-400">✓ 已保存</span>
            )}
          </div>
          <Button
            size="sm"
            onClick={handleManualSave}
            disabled={!isDirty}
            className="text-xs bg-gray-900 hover:bg-gray-700 text-white h-7 px-4"
          >
            保存简历内容
          </Button>
        </div>

        {/* 表单内容 */}
        <div className="flex-1 p-4">
          <EditorPanel />
        </div>
      </div>

      {/* 右侧预览区 */}
      <div className="flex-1 overflow-auto bg-gray-100 flex flex-col items-center py-6 px-4">
        <ResumePreview resumeId={resumeId} />
      </div>
    </div>
  )
}
