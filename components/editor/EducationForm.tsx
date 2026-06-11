'use client'

import { useResumeStore } from '@/store/useResumeStore'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

const DEGREES = ['本科', '硕士', '博士', '专科', '其他']

export default function EducationForm() {
  const { data, addEducation, updateEducation, removeEducation } = useResumeStore()

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-semibold text-gray-700">教育经历</h2>
        <Button
          size="sm"
          variant="outline"
          onClick={addEducation}
          className="text-xs h-7 px-3 border-gray-200"
        >
          + 添加
        </Button>
      </div>

      {data.education.length === 0 && (
        <div className="text-center py-8 text-gray-400 text-sm border border-dashed border-gray-200 rounded-lg">
          还没有教育经历，点击「添加」开始填写
        </div>
      )}

      <div className="space-y-4">
        {data.education.map((edu, idx) => (
          <div key={edu.id} className="border border-gray-200 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-400 font-medium">#{idx + 1}</span>
              <button
                onClick={() => removeEducation(edu.id)}
                className="text-xs text-red-400 hover:text-red-600 transition-colors"
              >
                删除
              </button>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs text-gray-500">学校名称</Label>
              <Input
                placeholder="例如：北京大学"
                value={edu.school}
                onChange={(e) => updateEducation(edu.id, 'school', e.target.value)}
                className="h-8 text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-gray-500">专业</Label>
                <Input
                  placeholder="计算机科学"
                  value={edu.major}
                  onChange={(e) => updateEducation(edu.id, 'major', e.target.value)}
                  className="h-8 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-gray-500">学历</Label>
                <select
                  value={edu.degree}
                  onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                  className="w-full h-8 text-sm border border-gray-200 rounded-md px-2 bg-white text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-400"
                >
                  <option value="">请选择</option>
                  {DEGREES.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-gray-500">开始时间</Label>
                <Input
                  placeholder="2016.09"
                  value={edu.startDate}
                  onChange={(e) => updateEducation(edu.id, 'startDate', e.target.value)}
                  className="h-8 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-gray-500">结束时间</Label>
                <Input
                  placeholder="2020.06"
                  value={edu.endDate}
                  onChange={(e) => updateEducation(edu.id, 'endDate', e.target.value)}
                  className="h-8 text-sm"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
