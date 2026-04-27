import { supabase } from '@/lib/supabase'

export const getStaff = async (institutionId?: number) => {
  let q = supabase
    .from('dim_staff')
    .select('*, dim_institution(code, short_name, name), dim_department(code, name)')
    .order('last_name')
  if (institutionId) q = q.eq('institution_id', institutionId)
  const { data, error } = await q
  if (error) {
    console.error('[supabase] getStaff:', error.message)
    return []
  }
  return data ?? []
}

export const getStaffMember = async (id: number) => {
  const { data, error } = await supabase.from('dim_staff').select('*').eq('id', id).single()
  if (error) throw error
  return data
}

export const createStaff = async (payload: Record<string, any>) => {
  const { data, error } = await supabase.from('dim_staff').insert(payload).select().single()
  if (error) throw error
  return data
}

export const updateStaff = async (id: number, payload: Record<string, any>) => {
  const { data, error } = await supabase
    .from('dim_staff')
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export const deleteStaff = async (id: number) => {
  const { error } = await supabase.from('dim_staff').delete().eq('id', id)
  if (error) throw error
  return { ok: true }
}
