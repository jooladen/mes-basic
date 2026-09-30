// Design Ref: §4.1 Repository Contract — 작업지시 (biz/pp)
// 교체 지점: 2단계에 mockGet → httpClient.get('/api/work-orders')
import { mockGet } from '@/common/api/mockClient'
import { WORK_ORDERS_MOCK } from '../data/workOrders.mock'

export function findAll() {
  return mockGet(WORK_ORDERS_MOCK).then((res) => res.data)
}

export function findById(woNo) {
  return findAll().then((rows) => rows.find((row) => row.woNo === woNo) ?? null)
}
