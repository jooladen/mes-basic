// Design Ref: §4.2 Service Contract — 3개 service 가 공유하는 검색조건 매칭 규칙 (순수 함수)
import { collectDescendantIds } from '@/common/utils/tree'

/** 선택 목록이 비어 있으면 통과, 아니면 IN 매칭 */
export function matchesIn(value, selected) {
  if (!selected?.length) return true
  return selected.includes(value)
}

/** 선택 목록이 비어 있으면 통과, 아니면 배열끼리 교집합 존재 */
export function intersects(values, selected) {
  if (!selected?.length) return true
  return values.some((value) => selected.includes(value))
}

/** 키워드가 비어 있으면 통과, 아니면 지정 필드 중 하나라도 includes (대소문자 무시) */
export function matchesKeyword(row, fields, keyword) {
  const term = (keyword ?? '').trim().toLowerCase()
  if (!term) return true
  return fields.some((field) => String(row[field] ?? '').toLowerCase().includes(term))
}

/**
 * 트리에서 선택한 노드(공장/라인/설비)의 하위 설비 id 집합.
 * 선택이 없으면 null (= 필터 안 함).
 */
export function resolveEquipmentIds(tree, equipmentId) {
  if (!equipmentId) return null
  return new Set(collectDescendantIds(tree, equipmentId))
}

export function matchesEquipment(row, equipmentIdSet) {
  if (!equipmentIdSet) return true
  return equipmentIdSet.has(row.equipmentId)
}
