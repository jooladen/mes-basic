// Design Ref: §4.1 Repository Contract — 검사결과 (biz/qm)
// 교체 지점: 2단계에 mockGet → httpClient.get('/api/inspections')
import { mockGet } from '@/common/api/mockClient'
import { INSPECTIONS_MOCK } from '../data/inspections.mock'

export function findAll() {
  return mockGet(INSPECTIONS_MOCK).then((res) => res.data)
}

export function findById(inspNo) {
  return findAll().then((rows) => rows.find((row) => row.inspNo === inspNo) ?? null)
}
