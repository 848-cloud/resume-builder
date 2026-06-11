'use client'

import { useState, useCallback } from 'react'
import { useResumeStore } from '@/store/useResumeStore'
import BasicInfoForm from './BasicInfoForm'
import SummaryForm from './SummaryForm'
import WorkExperienceForm from './WorkExperienceForm'
import EducationForm from './EducationForm'
import ExtraModulesForm from './ExtraModulesForm'
import { Button } from '@/components/ui/button'

type Section = 'basicInfo' | 'summary' | 'workExperience' | 'education' | 'extraModules'

const SECTIONS: { key: Section; label: string }[] = [
  { key: 'basicInfo', label: '基本信息' },
  { key: 'summary', label: '个人总结' },
  { key: 'workExperience', label: '工作经历' },
  { key: 'education', label: '教育经历' },
  { key: 'extraModules', label: '更多模块' },
]

export default function EditorPanel() {
  const [active, setActive] = useState<Section>('basicInfo')
  const { saveResume } = useResumeStore()
  const [saving, setSaving] = useState(false)
  const [savedSection, setSavedSection] = useState<Section | null>(null)

  const currentIndex = SECTIONS.findIndex((s) => s.key === active)
  const nextSection = SECTIONS[currentIndex + 1]

  const handleSaveAndNext = useCallback(async () => {
    setSaving(true)
    await saveResume()
    setSavedSection(active)
    setTimeout(() => setSavedSection(null), 2000)
    setSaving(false)
    if (nextSection) {
      setActive(nextSection.key)
    }
  }, [saveResume, active, nextSection])

  return (
    <div>
      {/* 模块导航 */}
      <nav className="flex flex-wrap gap-2 mb-6">
        {SECTIONS.map((s) => (
          <button
            key={s.key}
            onClick={() => setActive(s.key)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
              active === s.key
                ? 'bg-gray-900 text-white border-gray-900'
                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
            }`}
          >
            {s.label}
          </button>
        ))}
      </nav>

      {/* 表单内容 */}
      <div>
        {active === 'basicInfo' && <BasicInfoForm />}
        {active === 'summary' && <SummaryForm />}
        {active === 'workExperience' && <WorkExperienceForm />}
        {active === 'education' && <EducationForm />}
        {active === 'extraModules' && <ExtraModulesForm />}
      </div>

      {/* 底部按钮 */}
      {nextSection && (
        <div className="mt-8 pt-4 border-t border-gray-100 flex justify-end">
          <Button
            onClick={handleSaveAndNext}
            disabled={saving}
            className="bg-gray-900 hover:bg-gray-700 text-white text-xs h-8 px-5"
          >
            {saving ? '跳转中...' : '下一节'}
          </Button>
        </div>
      )}
    </div>
  )
}
