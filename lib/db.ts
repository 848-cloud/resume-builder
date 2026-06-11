import { openDB, type IDBPDatabase } from 'idb'
import type { ResumeRecord, ResumeData } from '@/types/resume'
import { DEFAULT_RESUME_DATA } from '@/types/resume'

const DB_NAME = 'resume-builder-db'
const DB_VERSION = 1
const STORE_NAME = 'resumes'

async function getDB(): Promise<IDBPDatabase> {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' })
        store.createIndex('updatedAt', 'updatedAt')
      }
    },
  })
}

export async function getAllResumes(): Promise<ResumeRecord[]> {
  const db = await getDB()
  const all = await db.getAll(STORE_NAME)
  return all.sort((a, b) => b.updatedAt - a.updatedAt)
}

export async function getResume(id: string): Promise<ResumeRecord | undefined> {
  const db = await getDB()
  return db.get(STORE_NAME, id)
}

export async function createResume(title: string): Promise<ResumeRecord> {
  const db = await getDB()
  const now = Date.now()
  const record: ResumeRecord = {
    id: `resume_${now}_${Math.random().toString(36).slice(2, 9)}`,
    title,
    createdAt: now,
    updatedAt: now,
    data: JSON.parse(JSON.stringify(DEFAULT_RESUME_DATA)),
  }
  await db.put(STORE_NAME, record)
  return record
}

export async function updateResume(id: string, data: ResumeData, title?: string): Promise<void> {
  const db = await getDB()
  const existing = await db.get(STORE_NAME, id)
  if (!existing) return
  await db.put(STORE_NAME, {
    ...existing,
    title: title ?? existing.title,
    updatedAt: Date.now(),
    data,
  })
}

export async function updateResumeTitle(id: string, title: string): Promise<void> {
  const db = await getDB()
  const existing = await db.get(STORE_NAME, id)
  if (!existing) return
  await db.put(STORE_NAME, {
    ...existing,
    title,
    updatedAt: Date.now(),
  })
}

export async function copyResume(id: string): Promise<ResumeRecord | undefined> {
  const db = await getDB()
  const existing = await db.get(STORE_NAME, id)
  if (!existing) return undefined
  const now = Date.now()
  const record: ResumeRecord = {
    ...existing,
    id: `resume_${now}_${Math.random().toString(36).slice(2, 9)}`,
    title: `${existing.title}（副本）`,
    createdAt: now,
    updatedAt: now,
    data: JSON.parse(JSON.stringify(existing.data)),
  }
  await db.put(STORE_NAME, record)
  return record
}

export async function deleteResume(id: string): Promise<void> {
  const db = await getDB()
  await db.delete(STORE_NAME, id)
}

/** 用已有数据创建简历（用于导入场景） */
export async function createResumeWithData(title: string, data: ResumeData): Promise<ResumeRecord> {
  const db = await getDB()
  const now = Date.now()
  const record: ResumeRecord = {
    id: `resume_${now}_${Math.random().toString(36).slice(2, 9)}`,
    title,
    createdAt: now,
    updatedAt: now,
    data: JSON.parse(JSON.stringify(data)),
  }
  await db.put(STORE_NAME, record)
  return record
}
