'use client'

import { useState } from 'react'
import { useResumeStore } from '@/store/useResumeStore'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

export default function ExtraModulesForm() {
  const { data, addCertificate, removeCertificate, addLanguage, removeLanguage, addPortfolioLink, removePortfolioLink } =
    useResumeStore()
  const { extraModules } = data

  const [certInput, setCertInput] = useState('')
  const [langInput, setLangInput] = useState('')
  const [linkLabel, setLinkLabel] = useState('')
  const [linkUrl, setLinkUrl] = useState('')

  return (
    <div className="space-y-6">
      <h2 className="text-sm font-semibold text-gray-700">更多模块（可选）</h2>

      {/* 证书/荣誉 */}
      <div>
        <Label className="text-xs text-gray-500 mb-2 block">证书 / 荣誉</Label>
        <div className="flex gap-2 mb-2">
          <Input
            placeholder="例如：PMP 证书、CET-6"
            value={certInput}
            onChange={(e) => setCertInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && certInput.trim()) {
                addCertificate(certInput.trim())
                setCertInput('')
              }
            }}
            className="h-8 text-sm flex-1"
          />
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              if (certInput.trim()) {
                addCertificate(certInput.trim())
                setCertInput('')
              }
            }}
            className="h-8 text-xs"
          >
            添加
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {extraModules.certificates.map((c) => (
            <span
              key={c.id}
              className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full"
            >
              {c.name}
              <button
                onClick={() => removeCertificate(c.id)}
                className="text-gray-400 hover:text-gray-600 ml-0.5"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* 语言能力 */}
      <div>
        <Label className="text-xs text-gray-500 mb-2 block">语言能力</Label>
        <div className="flex gap-2 mb-2">
          <Input
            placeholder="例如：英语（CET-6）、日语（N2）"
            value={langInput}
            onChange={(e) => setLangInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && langInput.trim()) {
                addLanguage(langInput.trim())
                setLangInput('')
              }
            }}
            className="h-8 text-sm flex-1"
          />
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              if (langInput.trim()) {
                addLanguage(langInput.trim())
                setLangInput('')
              }
            }}
            className="h-8 text-xs"
          >
            添加
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {extraModules.languages.map((lang) => (
            <span
              key={lang}
              className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full"
            >
              {lang}
              <button
                onClick={() => removeLanguage(lang)}
                className="text-gray-400 hover:text-gray-600 ml-0.5"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* 作品链接 */}
      <div>
        <Label className="text-xs text-gray-500 mb-2 block">作品链接</Label>
        <div className="space-y-2 mb-2">
          <Input
            placeholder="链接名称，例如：产品案例集"
            value={linkLabel}
            onChange={(e) => setLinkLabel(e.target.value)}
            className="h-8 text-sm"
          />
          <div className="flex gap-2">
            <Input
              placeholder="https://..."
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && linkLabel.trim() && linkUrl.trim()) {
                  addPortfolioLink(linkLabel.trim(), linkUrl.trim())
                  setLinkLabel('')
                  setLinkUrl('')
                }
              }}
              className="h-8 text-sm flex-1"
            />
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                if (linkLabel.trim() && linkUrl.trim()) {
                  addPortfolioLink(linkLabel.trim(), linkUrl.trim())
                  setLinkLabel('')
                  setLinkUrl('')
                }
              }}
              className="h-8 text-xs"
            >
              添加
            </Button>
          </div>
        </div>
        <div className="space-y-1.5">
          {extraModules.portfolioLinks.map((link) => (
            <div key={link.id} className="flex items-center justify-between bg-gray-50 rounded px-3 py-2">
              <div>
                <span className="text-xs font-medium text-gray-700">{link.label}</span>
                <p className="text-xs text-gray-400 truncate max-w-[240px]">{link.url}</p>
              </div>
              <button
                onClick={() => removePortfolioLink(link.id)}
                className="text-xs text-red-400 hover:text-red-600"
              >
                删除
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
