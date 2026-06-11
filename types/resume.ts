export interface BasicInfo {
  name: string
  phone: string
  email: string
  position: string
  yearsOfExperience: string
  avatar?: string // base64 图片
}

export interface ProjectExperience {
  id: string
  name: string
  goal: string
  description: string
}

export interface WorkExperience {
  id: string
  company: string
  position: string
  startDate: string
  endDate: string
  isCurrent: boolean
  responsibilities: string
  projects: ProjectExperience[]
}

export interface Education {
  id: string
  school: string
  startDate: string
  endDate: string
  major: string
  degree: string
}

export interface Certificate {
  id: string
  name: string
  date?: string
}

export interface PortfolioLink {
  id: string
  label: string
  url: string
}

export interface ExtraModules {
  certificates: Certificate[]
  languages: string[]
  portfolioLinks: PortfolioLink[]
}

export type ModuleKey = 'basicInfo' | 'summary' | 'workExperience' | 'education' | 'extraModules'

export type ThemeType = 'compact' | 'professional'

export interface ResumeData {
  basicInfo: BasicInfo
  summary: string
  workExperience: WorkExperience[]
  education: Education[]
  extraModules: ExtraModules
  moduleOrder: ModuleKey[]
  theme: ThemeType
}

export interface ResumeRecord {
  id: string
  title: string
  createdAt: number
  updatedAt: number
  data: ResumeData
}

export const DEFAULT_RESUME_DATA: ResumeData = {
  basicInfo: {
    name: '',
    phone: '',
    email: '',
    position: '',
    yearsOfExperience: '',
    avatar: '',
  },
  summary: '',
  workExperience: [],
  education: [],
  extraModules: {
    certificates: [],
    languages: [],
    portfolioLinks: [],
  },
  moduleOrder: ['basicInfo', 'summary', 'workExperience', 'education', 'extraModules'],
  theme: 'compact',
}
