import React from 'react'

/**
 * 将文本中的 **文字** 渲染为加粗的 <strong> 标签
 * 支持 *文字* 渲染为浅色强调
 */
export function renderInlineMarkdown(text: string): React.ReactNode {
  if (!text) return null
  // 匹配 **xxx** 为加粗
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <strong key={i} style={{ fontWeight: '700', color: '#111' }}>
              {part.slice(2, -2)}
            </strong>
          )
        }
        return <span key={i}>{part}</span>
      })}
    </>
  )
}
