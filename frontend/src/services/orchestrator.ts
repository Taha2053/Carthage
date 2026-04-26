import api from './api'

export const deepAnalysis = async (institutionId: number, includeReport = false) => {
  const { data } = await api.post('/orchestrator/analyse', null, {
    params: { institution_id: institutionId, include_report: includeReport },
  })
  return data
}

export const networkBrief = async () => {
  const { data } = await api.post('/orchestrator/network-brief')
  return data
}

export const triggerUploadPipeline = async (institutionId: number, filename: string, rowsInserted = 0) => {
  const { data } = await api.post('/orchestrator/upload-pipeline', null, {
    params: { institution_id: institutionId, filename, rows_inserted: rowsInserted },
  })
  return data
}
