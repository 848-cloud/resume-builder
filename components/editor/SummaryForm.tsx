'use client'

import { useResumeStore } from '@/store/useResumeStore'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

export default function SummaryForm() {
  const { data, setSummary } = useResumeStore()

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold text-gray-700">个人总结</h2>
      <p className="text-xs text-gray-400">概括你的工作经验和核心优势，建议 3-5 句话</p>
      <div className="space-y-1.5">
        <Label htmlFor="summary" className="text-xs text-gray-500">内容</Label>
        <Textarea
          id="summary"
          placeholder="例如：5年互联网产品经验，曾主导多个百万级用户产品从0到1的完整周期，擅长用户研究与数据驱动决策，对ToC场景有深刻理解..."
          value={data.summary}
          onChange={(e) => setSummary(e.target.value)}
          className="text-sm min-h-[150px] resize-none leading-relaxed"
        />
        <p className="text-xs text-gray-400 text-right">{data.summary.length} 字</p>
      </div>
    </div>
  )
}
