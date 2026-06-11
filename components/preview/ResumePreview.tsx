'use client'

import { useRef } from 'react'
import { useResumeStore } from '@/store/useResumeStore'
import CompactTheme from './CompactTheme'
import { Button } from '@/components/ui/button'

interface ResumePreviewProps {
  resumeId: string
}

export default function ResumePreview({ resumeId: _resumeId }: ResumePreviewProps) {
  const { data } = useResumeStore()
  const printRef = useRef<HTMLDivElement>(null)

  const handlePrint = () => {
    if (!printRef.current) return
    const content = printRef.current.innerHTML
    const win = window.open('', '_blank')
    if (!win) return
    win.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>简历</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: -apple-system, 'PingFang SC', 'Microsoft YaHei', sans-serif; }
            @media print {
              body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            }
          </style>
        </head>
        <body>${content}</body>
      </html>
    `)
    win.document.close()
    setTimeout(() => {
      win.print()
      win.close()
    }, 500)
  }

  return (
    <div className="w-full max-w-[794px] flex flex-col items-center">
      {/* 导出按钮 */}
      <div className="w-full flex justify-end mb-4">
        <Button
          onClick={handlePrint}
          className="bg-gray-900 hover:bg-gray-700 text-white text-sm"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          导出 PDF
        </Button>
      </div>

      {/* 预览纸张 */}
      <div
        ref={printRef}
        className="w-full bg-white shadow-lg"
        style={{ minHeight: '1123px' }}
      >
        <CompactTheme data={data} />
      </div>
    </div>
  )
}
