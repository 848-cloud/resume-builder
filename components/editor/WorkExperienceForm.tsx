'use client'

import { useState } from 'react'
import { useResumeStore } from '@/store/useResumeStore'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import type { WorkExperience, ProjectExperience } from '@/types/resume'

export default function WorkExperienceForm() {
  const { data, addWorkExperience, updateWorkExperience, removeWorkExperience, addProject, updateProject, removeProject } =
    useResumeStore()

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-semibold text-gray-700">工作经历</h2>
        <Button
          size="sm"
          variant="outline"
          onClick={addWorkExperience}
          className="text-xs h-7 px-3 border-gray-200"
        >
          + 添加
        </Button>
      </div>

      {data.workExperience.length === 0 && (
        <div className="text-center py-8 text-gray-400 text-sm border border-dashed border-gray-200 rounded-lg">
          还没有工作经历，点击「添加」开始填写
        </div>
      )}

      <div className="space-y-6">
        {data.workExperience.map((work, idx) => (
          <WorkItem
            key={work.id}
            work={work}
            index={idx}
            onUpdate={(field, value) => updateWorkExperience(work.id, field, value)}
            onRemove={() => removeWorkExperience(work.id)}
            onAddProject={() => addProject(work.id)}
            onUpdateProject={(pid, field, value) => updateProject(work.id, pid, field, value)}
            onRemoveProject={(pid) => removeProject(work.id, pid)}
          />
        ))}
      </div>
    </div>
  )
}

interface WorkItemProps {
  work: WorkExperience
  index: number
  onUpdate: (field: keyof Omit<WorkExperience, 'id' | 'projects'>, value: string | boolean) => void
  onRemove: () => void
  onAddProject: () => void
  onUpdateProject: (pid: string, field: keyof Omit<ProjectExperience, 'id'>, value: string) => void
  onRemoveProject: (pid: string) => void
}

function WorkItem({ work, index, onUpdate, onRemove, onAddProject, onUpdateProject, onRemoveProject }: WorkItemProps) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {/* 标题栏 */}
      <div
        className="flex items-center justify-between px-4 py-3 bg-gray-50 cursor-pointer"
        onClick={() => setCollapsed(!collapsed)}
      >
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 font-medium">#{index + 1}</span>
          <span className="text-sm font-medium text-gray-700 truncate max-w-[200px]">
            {work.company || work.position || '未命名经历'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); onRemove() }}
            className="text-xs text-red-400 hover:text-red-600 transition-colors"
          >
            删除
          </button>
          <svg
            className={`w-4 h-4 text-gray-400 transition-transform ${collapsed ? '-rotate-90' : ''}`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {!collapsed && (
        <div className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-gray-500">公司名称</Label>
              <Input
                placeholder="公司名称"
                value={work.company}
                onChange={(e) => onUpdate('company', e.target.value)}
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-gray-500">职位</Label>
              <Input
                placeholder="职位名称"
                value={work.position}
                onChange={(e) => onUpdate('position', e.target.value)}
                className="h-8 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-gray-500">开始时间</Label>
              <Input
                placeholder="2020.06"
                value={work.startDate}
                onChange={(e) => onUpdate('startDate', e.target.value)}
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-gray-500">结束时间</Label>
              <Input
                placeholder="2023.06 / 至今"
                value={work.isCurrent ? '至今' : work.endDate}
                onChange={(e) => onUpdate('endDate', e.target.value)}
                disabled={work.isCurrent}
                className="h-8 text-sm"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={work.isCurrent}
              onChange={(e) => onUpdate('isCurrent', e.target.checked)}
              className="w-3.5 h-3.5 accent-gray-900"
            />
            <span className="text-xs text-gray-500">至今在职</span>
          </label>

          <div className="space-y-1.5">
            <Label className="text-xs text-gray-500">岗位职责</Label>
            <Textarea
              placeholder="描述主要的工作职责和成就..."
              value={work.responsibilities}
              onChange={(e) => onUpdate('responsibilities', e.target.value)}
              className="text-sm min-h-[100px] resize-none"
            />
          </div>

          {/* 项目经验 */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-gray-600">项目经验</span>
              <button
                onClick={onAddProject}
                className="text-xs text-gray-500 hover:text-gray-700 border border-gray-200 rounded px-2 py-1 hover:border-gray-400 transition-colors"
              >
                + 添加项目
              </button>
            </div>

            {work.projects.length === 0 && (
              <p className="text-xs text-gray-400 py-3 text-center border border-dashed border-gray-200 rounded">
                暂无项目经验
              </p>
            )}

            <div className="space-y-3">
              {work.projects.map((project) => (
                <div key={project.id} className="bg-gray-50 rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-500">项目</span>
                    <button
                      onClick={() => onRemoveProject(project.id)}
                      className="text-xs text-red-400 hover:text-red-600"
                    >
                      删除
                    </button>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-gray-400">项目名称</Label>
                    <Input
                      placeholder="项目名称"
                      value={project.name}
                      onChange={(e) => onUpdateProject(project.id, 'name', e.target.value)}
                      className="h-8 text-sm bg-white"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-gray-400">项目目标</Label>
                    <Input
                      placeholder="项目目标"
                      value={project.goal}
                      onChange={(e) => onUpdateProject(project.id, 'goal', e.target.value)}
                      className="h-8 text-sm bg-white"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs text-gray-400">内容描述</Label>
                      <span className="text-xs text-gray-300">用 **文字** 加粗重点</span>
                    </div>
                    <Textarea
                      placeholder="项目内容描述，用 **关键词** 包裹可加粗突出重点数据..."
                      value={project.description}
                      onChange={(e) => onUpdateProject(project.id, 'description', e.target.value)}
                      className="text-sm min-h-[100px] resize-none bg-white font-mono"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
