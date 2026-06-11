'use client'

import { useRef } from 'react'
import { useResumeStore } from '@/store/useResumeStore'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function BasicInfoForm() {
  const { data, setBasicInfo } = useResumeStore()
  const { basicInfo } = data
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      setBasicInfo('avatar', ev.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="space-y-4">
      <h2 className="text-sm font-semibold text-gray-700 mb-4">基本信息</h2>

      {/* 证件照上传 */}
      <div className="flex items-start gap-4">
        <div>
          <Label className="text-xs text-gray-500 mb-2 block">证件照</Label>
          <div
            className="w-20 h-24 border border-dashed border-gray-300 rounded cursor-pointer hover:border-gray-400 transition-colors overflow-hidden bg-gray-50 flex items-center justify-center"
            onClick={() => fileInputRef.current?.click()}
          >
            {basicInfo.avatar ? (
              <img src={basicInfo.avatar} alt="证件照" className="w-full h-full object-cover" />
            ) : (
              <div className="text-center">
                <svg className="w-6 h-6 text-gray-300 mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                </svg>
                <span className="text-xs text-gray-400">上传</span>
              </div>
            )}
          </div>
          {basicInfo.avatar && (
            <button
              onClick={() => setBasicInfo('avatar', '')}
              className="text-xs text-red-400 hover:text-red-600 mt-1 block"
            >
              删除
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />
        </div>

        <div className="flex-1 space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-xs text-gray-500">姓名</Label>
            <Input
              id="name"
              placeholder="请输入姓名"
              value={basicInfo.name}
              onChange={(e) => setBasicInfo('name', e.target.value)}
              className="h-9 text-sm"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="position" className="text-xs text-gray-500">当前岗位</Label>
            <Input
              id="position"
              placeholder="例如：高级产品经理"
              value={basicInfo.position}
              onChange={(e) => setBasicInfo('position', e.target.value)}
              className="h-9 text-sm"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="phone" className="text-xs text-gray-500">手机号</Label>
          <Input
            id="phone"
            placeholder="13800000000"
            value={basicInfo.phone}
            onChange={(e) => setBasicInfo('phone', e.target.value)}
            className="h-9 text-sm"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="yearsOfExperience" className="text-xs text-gray-500">工作年限</Label>
          <Input
            id="yearsOfExperience"
            placeholder="例如：5年"
            value={basicInfo.yearsOfExperience}
            onChange={(e) => setBasicInfo('yearsOfExperience', e.target.value)}
            className="h-9 text-sm"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="email" className="text-xs text-gray-500">邮箱</Label>
        <Input
          id="email"
          type="email"
          placeholder="example@email.com"
          value={basicInfo.email}
          onChange={(e) => setBasicInfo('email', e.target.value)}
          className="h-9 text-sm"
        />
      </div>
    </div>
  )
}
