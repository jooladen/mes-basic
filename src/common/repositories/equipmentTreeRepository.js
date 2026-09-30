// Design Ref: §4.1 Repository Contract — 설비 트리(공장›라인›설비). 3개 모듈이 공용으로 읽는다.
// 교체 지점: 2단계에 mockGet → httpClient.get('/api/equipment-tree') 로 바꾸면 끝.
// Plan FR-11: res.data 언래핑은 여기서만.
import { mockGet } from '@/common/api/mockClient'
import { EQUIPMENT_TREE_MOCK } from '@/common/data/equipmentTree.mock'

export function findAll() {
  return mockGet(EQUIPMENT_TREE_MOCK).then((res) => res.data)
}
