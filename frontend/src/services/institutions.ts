import { supabase } from '@/lib/supabase'
import type { Institution } from '@/types'
export type { Institution }
import {
  fetchDashboardInstitutions,
  fetchInstitutionDetail,
} from './adapters'

export const getInstitutions = async (): Promise<Institution[]> => {
  const { institutions } = await fetchDashboardInstitutions()
  return institutions
}

export const getInstitution = async (id: string): Promise<Institution | null> =>
  fetchInstitutionDetail(id)

export const getInstitutionsRaw = async () => {
  const { data, error } = await supabase
    .from('dim_institution')
    .select('*')
    .order('name')
  if (error) {
    console.error('[supabase] getInstitutionsRaw:', error.message)
    return []
  }
  return data ?? []
}

export const createInstitution = async (payload: Record<string, any>) => {
  const { data, error } = await supabase
    .from('dim_institution')
    .insert(payload)
    .select()
    .single()
  if (error) throw error
  return data
}

export const updateInstitution = async (id: number, payload: Record<string, any>) => {
  const { data, error } = await supabase
    .from('dim_institution')
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export const deleteInstitution = async (id: number) => {
  const { error } = await supabase
    .from('dim_institution')
    .update({ is_active: false })
    .eq('id', id)
  if (error) throw error
  return { ok: true }
}
