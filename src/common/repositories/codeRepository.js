// Design Ref: §4.1 Repository Contract — 공통코드. getCodes(groupId) => Promise<CodeOption[]>
// 교체 지점: 2단계에 mockGet → httpClient.get(`/api/codes/${groupId}`)
import { mockGet } from '@/common/api/mockClient'
import { CODES_MOCK } from '@/common/data/codes.mock'

export function getCodes(groupId) {
  return mockGet(CODES_MOCK[groupId] ?? []).then((res) => res.data)
}
