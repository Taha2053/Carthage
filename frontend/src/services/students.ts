import { supabase } from '@/lib/supabase'

export const getStudents = async (institutionId?: number, departmentId?: number) => {
  let q = supabase
    .from('dim_student')
    .select('*, dim_institution(code, short_name), dim_department(code, name)')
    .order('last_name')
  if (institutionId) q = q.eq('institution_id', institutionId)
  if (departmentId) q = q.eq('department_id', departmentId)
  const { data, error } = await q
  if (error) {
    console.error('[supabase] getStudents:', error.message)
    return []
  }
  return data ?? []
}

export const getStudent = async (id: number) => {
  const { data, error } = await supabase.from('dim_student').select('*').eq('id', id).single()
  if (error) throw error
  return data
}
