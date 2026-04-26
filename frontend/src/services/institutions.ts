<<<<<<< HEAD
import { supabase } from '@/lib/supabase'

export interface Institution {
  id: number
  uuid: string
  code: string
  name: string
  name_fr?: string
  name_ar?: string
  short_name?: string
  city?: string
  region?: string
  address?: string
  latitude?: number
  longitude?: number
  institution_type?: string
  governing_body?: string
  founding_year?: number
  student_capacity?: number
  current_enrollment?: number
  website?: string
  phone?: string
  email?: string
  rector_name?: string
  is_active: boolean
  created_at?: string
  updated_at?: string
}

export async function getInstitutions(): Promise<Institution[]> {
  const { data, error } = await supabase
    .from('dim_institution')
    .select('*')
    .eq('is_active', true)
    .order('name')
  
  if (error) {
    console.error('Error fetching institutions:', error)
    return []
  }
  
  return data || []
=======
import api from './api'
import type { Institution } from '@/types'
import { mockInstitutions } from '@/mock/data'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

export const getInstitutions = async (): Promise<Institution[]> => {
  if (USE_MOCK) return Promise.resolve(mockInstitutions)
  const { data } = await api.get<Institution[]>('/institutions')
  return data
}

export const getInstitution = async (id: string): Promise<Institution | null> => {
  if (USE_MOCK) return Promise.resolve(mockInstitutions.find((i) => i.id === id) ?? null)
  const { data } = await api.get<Institution>(`/institutions/${id}`)
  return data
>>>>>>> 7304b0bdbaa5d5bd10bd2f7b6fd43cf60a000fe4
}

export async function getInstitution(id: number): Promise<Institution | null> {
  const { data, error } = await supabase
    .from('dim_institution')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) {
    console.error('Error fetching institution:', error)
    return null
  }
  
  return data
}

export async function getInstitutionsByRegion(region: string): Promise<Institution[]> {
  const { data, error } = await supabase
    .from('dim_institution')
    .select('*')
    .eq('region', region)
    .eq('is_active', true)
    .order('name')
  
  if (error) {
    console.error('Error fetching institutions by region:', error)
    return []
  }
  
  return data || []
}