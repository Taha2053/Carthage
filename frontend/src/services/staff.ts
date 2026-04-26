import api from './api'

export const getStaff = async (institutionId?: number) => {
  const params: Record<string, number> = {}
  if (institutionId) params.institution_id = institutionId
  const { data } = await api.get('/staff', { params })
  return data
}

export const getStaffMember = async (id: number) => {
  const { data } = await api.get(`/staff/${id}`)
  return data
}
