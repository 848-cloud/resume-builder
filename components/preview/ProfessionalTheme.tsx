import type { ResumeData } from '@/types/resume'
import { renderInlineMarkdown } from './renderUtils'

interface ProfessionalThemeProps {
  data: ResumeData
}

export default function ProfessionalTheme({ data }: ProfessionalThemeProps) {
  const { basicInfo, summary, workExperience, education, extraModules } = data
  const hasExtra =
    extraModules.certificates.length > 0 ||
    extraModules.languages.length > 0 ||
    extraModules.portfolioLinks.length > 0

  return (
    <div
      style={{
        fontFamily: "-apple-system, 'PingFang SC', 'Microsoft YaHei', sans-serif",
        padding: '44px 52px',
        fontSize: '13px',
        lineHeight: '1.8',
        color: '#1a1a1a',
        background: '#fff',
      }}
    >
      {/* 基本信息 */}
      <div style={{ marginBottom: '28px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '20px' }}>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#111', letterSpacing: '2px', marginBottom: '6px' }}>
            {basicInfo.name || '姓名'}
          </h1>
          <div style={{ fontSize: '14px', color: '#333', fontWeight: '500', marginBottom: '8px' }}>
            {basicInfo.position || '求职意向'}
            {basicInfo.yearsOfExperience && (
              <span style={{ color: '#888', marginLeft: '14px', fontWeight: 'normal', fontSize: '13px' }}>
                {basicInfo.yearsOfExperience}工作经验
              </span>
            )}
          </div>
          <div style={{ display: 'flex', gap: '28px', fontSize: '12px', color: '#666' }}>
            {basicInfo.phone && (
              <span>联系电话：{basicInfo.phone}</span>
            )}
            {basicInfo.email && (
              <span>电子邮箱：{basicInfo.email}</span>
            )}
          </div>
        </div>
        {basicInfo.avatar && (
          <img
            src={basicInfo.avatar}
            alt="证件照"
            style={{ width: '72px', height: '86px', objectFit: 'cover', borderRadius: '2px', flexShrink: 0 }}
          />
        )}
      </div>

      {/* 个人总结 */}
      {summary && (
        <Section title="自我描述">
          <p style={{ color: '#444', lineHeight: '1.85', fontSize: '13px' }}>{summary}</p>
        </Section>
      )}

      {/* 工作经历 */}
      {workExperience.length > 0 && (
        <Section title="工作经历">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {workExperience.map((work) => (
              <div key={work.id}>
                {/* 公司 + 时间 */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
                  <div>
                    <span style={{ fontWeight: '700', fontSize: '14px', color: '#111' }}>{work.company}</span>
                    {work.position && (
                      <span style={{ color: '#555', fontSize: '13px', marginLeft: '14px', fontWeight: '500' }}>
                        {work.position}
                      </span>
                    )}
                  </div>
                  <span style={{ color: '#888', fontSize: '12px', flexShrink: 0, marginLeft: '16px' }}>
                    {work.startDate}{work.startDate && (work.endDate || work.isCurrent) ? ' - ' : ''}{work.isCurrent ? '至今' : work.endDate}
                  </span>
                </div>

                {/* 岗位职责 */}
                {work.responsibilities && (
                  <div style={{ color: '#555', lineHeight: '1.8', marginTop: '6px', whiteSpace: 'pre-wrap', fontSize: '13px' }}>
                    {work.responsibilities}
                  </div>
                )}

                {/* 项目经验 */}
                {work.projects.length > 0 && (
                  <div style={{ marginTop: '12px' }}>
                    {work.projects.map((p, pi) => (
                      <div key={p.id} style={{ marginBottom: '12px' }}>
                        {/* 项目标题行 */}
                        {p.name && (
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
                            <span style={{ fontWeight: '700', fontSize: '13px', color: '#111' }}>
                              {pi + 1}. {p.name}
                            </span>
                            {p.goal && (
                              <span style={{ color: '#666', fontSize: '12px', fontWeight: '400', marginLeft: '12px', flexShrink: 0 }}>
                                {p.goal}
                              </span>
                            )}
                          </div>
                        )}
                        {/* 项目内容 */}
                        {p.description && (
                          <div style={{ color: '#555', lineHeight: '1.8', whiteSpace: 'pre-wrap', fontSize: '13px' }}>
                            {renderInlineMarkdown(p.description)}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* 教育经历 */}
      {education.length > 0 && (
        <Section title="教育经历">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {education.map((edu) => (
              <div key={edu.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <div>
                  <span style={{ fontWeight: '700', fontSize: '13px', color: '#111' }}>{edu.school}</span>
                  {edu.degree && (
                    <span style={{ color: '#666', marginLeft: '10px', fontSize: '12px' }}>
                      {edu.degree}
                    </span>
                  )}
                  {edu.major && (
                    <span style={{ color: '#777', marginLeft: '8px', fontSize: '12px' }}>
                      / {edu.major}
                    </span>
                  )}
                </div>
                <span style={{ color: '#888', fontSize: '12px', flexShrink: 0 }}>
                  {edu.startDate}{edu.startDate && edu.endDate ? ' - ' : ''}{edu.endDate}
                </span>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* 其他 */}
      {hasExtra && (
        <Section title="其他">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', color: '#444' }}>
            {extraModules.certificates.length > 0 && (
              <div>
                <span style={{ fontWeight: '600', color: '#222', marginRight: '8px' }}>证书：</span>
                {extraModules.certificates.map((c) => c.name).join('  ·  ')}
              </div>
            )}
            {extraModules.languages.length > 0 && (
              <div>
                <span style={{ fontWeight: '600', color: '#222', marginRight: '8px' }}>语言：</span>
                {extraModules.languages.join('  ·  ')}
              </div>
            )}
            {extraModules.portfolioLinks.length > 0 && (
              <div>
                <span style={{ fontWeight: '600', color: '#222', marginRight: '8px' }}>作品：</span>
                {extraModules.portfolioLinks.map((l, i) => (
                  <span key={l.id}>
                    {i > 0 && '  ·  '}
                    <a href={l.url} style={{ color: '#333', textDecoration: 'underline' }}>{l.label}</a>
                  </span>
                ))}
              </div>
            )}
          </div>
        </Section>
      )}
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '24px' }}>
      <div style={{ marginBottom: '12px' }}>
        <h2 style={{
          fontSize: '15px',
          fontWeight: '800',
          color: '#111',
          letterSpacing: '0.5px',
          paddingBottom: '6px',
          borderBottom: '2px solid #111',
        }}>
          {title}
        </h2>
      </div>
      {children}
    </div>
  )
}
