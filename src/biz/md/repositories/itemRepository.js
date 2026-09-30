// Design Ref: §4.1 Repository Contract — 품목 (biz/md)
// 교체 지점: 2단계에 mockGet → httpClient.get('/api/items') 로 바꾸면 끝. 호출부(service) 무변경.
// Plan FR-11: res.data 언래핑은 여기서만.
import { mockGet } from '@/common/api/mockClient'
import { ITEMS_MOCK } from '../data/items.mock'

export function findAll() {
  return mockGet(ITEMS_MOCK).then((res) => res.data)
}

export function findById(itemCode) {
  return findAll().then((rows) => rows.find((row) => row.itemCode === itemCode) ?? null)
}
