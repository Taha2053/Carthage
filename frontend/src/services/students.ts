import api from './api'

export const getStudents = async (institutionId?: number, departmentId?: number) => {
  const params: Record<string, number> = {}
  if (institutionId) params.institution_id = institutionId
  if (departmentId) params.department_id = departmentId
  const { data } = await api.get('/students', { params })
  return data
}

export const getStudent = async (id: number) => {
  const { data } = await api.get(`/students/${id}`)
  return data
}
