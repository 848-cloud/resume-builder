import { create } from 'zustand'
import type { ResumeData, WorkExperience, Education, ProjectExperience, ModuleKey, ThemeType } from '@/types/resume'
import { DEFAULT_RESUME_DATA } from '@/types/resume'
import { updateResume } from '@/lib/db'

interface ResumeStore {
  currentId: string | null
  data: ResumeData
  isDirty: boolean

  // 初始化
  loadResume: (id: string, data: ResumeData) => void
  resetResume: () => void

  // 基本信息
  setBasicInfo: (field: keyof ResumeData['basicInfo'], value: string) => void

  // 个人总结
  setSummary: (value: string) => void

  // 工作经历
  addWorkExperience: () => void
  updateWorkExperience: (id: string, field: keyof Omit<WorkExperience, 'id' | 'projects'>, value: string | boolean) => void
  removeWorkExperience: (id: string) => void

  // 项目经验
  addProject: (workId: string) => void
  updateProject: (workId: string, projectId: string, field: keyof Omit<ProjectExperience, 'id'>, value: string) => void
  removeProject: (workId: string, projectId: string) => void

  // 教育经历
  addEducation: () => void
  updateEducation: (id: string, field: keyof Omit<Education, 'id'>, value: string) => void
  removeEducation: (id: string) => void

  // 附加模块
  addCertificate: (name: string) => void
  removeCertificate: (id: string) => void
  addLanguage: (lang: string) => void
  removeLanguage: (lang: string) => void
  addPortfolioLink: (label: string, url: string) => void
  removePortfolioLink: (id: string) => void

  // 主题
  setTheme: (theme: ThemeType) => void

  // 模块顺序
  setModuleOrder: (order: ModuleKey[]) => void

  // 保存
  saveResume: () => Promise<void>
}

function nanoid() {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}

export const useResumeStore = create<ResumeStore>((set, get) => ({
  currentId: null,
  data: JSON.parse(JSON.stringify(DEFAULT_RESUME_DATA)),
  isDirty: false,

  loadResume: (id, data) => set({ currentId: id, data: JSON.parse(JSON.stringify(data)), isDirty: false }),
  resetResume: () => set({ currentId: null, data: JSON.parse(JSON.stringify(DEFAULT_RESUME_DATA)), isDirty: false }),

  setBasicInfo: (field, value) =>
    set((s) => ({ data: { ...s.data, basicInfo: { ...s.data.basicInfo, [field]: value } }, isDirty: true })),

  setSummary: (value) =>
    set((s) => ({ data: { ...s.data, summary: value }, isDirty: true })),

  addWorkExperience: () =>
    set((s) => ({
      data: {
        ...s.data,
        workExperience: [
          ...s.data.workExperience,
          { id: nanoid(), company: '', position: '', startDate: '', endDate: '', isCurrent: false, responsibilities: '', projects: [] },
        ],
      },
      isDirty: true,
    })),

  updateWorkExperience: (id, field, value) =>
    set((s) => ({
      data: {
        ...s.data,
        workExperience: s.data.workExperience.map((w) => (w.id === id ? { ...w, [field]: value } : w)),
      },
      isDirty: true,
    })),

  removeWorkExperience: (id) =>
    set((s) => ({
      data: { ...s.data, workExperience: s.data.workExperience.filter((w) => w.id !== id) },
      isDirty: true,
    })),

  addProject: (workId) =>
    set((s) => ({
      data: {
        ...s.data,
        workExperience: s.data.workExperience.map((w) =>
          w.id === workId
            ? { ...w, projects: [...w.projects, { id: nanoid(), name: '', goal: '', description: '' }] }
            : w
        ),
      },
      isDirty: true,
    })),

  updateProject: (workId, projectId, field, value) =>
    set((s) => ({
      data: {
        ...s.data,
        workExperience: s.data.workExperience.map((w) =>
          w.id === workId
            ? { ...w, projects: w.projects.map((p) => (p.id === projectId ? { ...p, [field]: value } : p)) }
            : w
        ),
      },
      isDirty: true,
    })),

  removeProject: (workId, projectId) =>
    set((s) => ({
      data: {
        ...s.data,
        workExperience: s.data.workExperience.map((w) =>
          w.id === workId ? { ...w, projects: w.projects.filter((p) => p.id !== projectId) } : w
        ),
      },
      isDirty: true,
    })),

  addEducation: () =>
    set((s) => ({
      data: {
        ...s.data,
        education: [
          ...s.data.education,
          { id: nanoid(), school: '', startDate: '', endDate: '', major: '', degree: '' },
        ],
      },
      isDirty: true,
    })),

  updateEducation: (id, field, value) =>
    set((s) => ({
      data: {
        ...s.data,
        education: s.data.education.map((e) => (e.id === id ? { ...e, [field]: value } : e)),
      },
      isDirty: true,
    })),

  removeEducation: (id) =>
    set((s) => ({
      data: { ...s.data, education: s.data.education.filter((e) => e.id !== id) },
      isDirty: true,
    })),

  addCertificate: (name) =>
    set((s) => ({
      data: {
        ...s.data,
        extraModules: {
          ...s.data.extraModules,
          certificates: [...s.data.extraModules.certificates, { id: nanoid(), name }],
        },
      },
      isDirty: true,
    })),

  removeCertificate: (id) =>
    set((s) => ({
      data: {
        ...s.data,
        extraModules: {
          ...s.data.extraModules,
          certificates: s.data.extraModules.certificates.filter((c) => c.id !== id),
        },
      },
      isDirty: true,
    })),

  addLanguage: (lang) =>
    set((s) => ({
      data: {
        ...s.data,
        extraModules: { ...s.data.extraModules, languages: [...s.data.extraModules.languages, lang] },
      },
      isDirty: true,
    })),

  removeLanguage: (lang) =>
    set((s) => ({
      data: {
        ...s.data,
        extraModules: { ...s.data.extraModules, languages: s.data.extraModules.languages.filter((l) => l !== lang) },
      },
      isDirty: true,
    })),

  addPortfolioLink: (label, url) =>
    set((s) => ({
      data: {
        ...s.data,
        extraModules: {
          ...s.data.extraModules,
          portfolioLinks: [...s.data.extraModules.portfolioLinks, { id: nanoid(), label, url }],
        },
      },
      isDirty: true,
    })),

  removePortfolioLink: (id) =>
    set((s) => ({
      data: {
        ...s.data,
        extraModules: {
          ...s.data.extraModules,
          portfolioLinks: s.data.extraModules.portfolioLinks.filter((l) => l.id !== id),
        },
      },
      isDirty: true,
    })),

  setTheme: (theme) =>
    set((s) => ({ data: { ...s.data, theme }, isDirty: true })),

  setModuleOrder: (order) =>
    set((s) => ({ data: { ...s.data, moduleOrder: order }, isDirty: true })),

  saveResume: async () => {
    const { currentId, data } = get()
    if (!currentId) return
    await updateResume(currentId, data)
    set({ isDirty: false })
  },
}))
