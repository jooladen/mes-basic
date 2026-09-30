// Design Ref: §4.2 Service Contract — 품목 조회 규칙. repository 가 준 배열만 다룬다 (봉투 모름).
import * as itemRepository from '../repositories/itemRepository'
import * as equipmentTreeRepository from '@/common/repositories/equipmentTreeRepository'
import { matchesIn, matchesKeyword, matchesEquipment, resolveEquipmentIds } from '@/common/utils/criteria'

const KEYWORD_FIELDS = ['itemCode']

/**
 * criteria: { itemTypes: string[], equipmentId: string|null, keyword: string }
 * 타입 IN + 설비 하위 포함 + 코드/이름 키워드
 */
export async function searchItems(criteria = {}) {
  const [rows, tree] = await Promise.all([itemRepository.findAll(), equipmentTreeRepository.findAll()])
  const equipmentIds = resolveEquipmentIds(tree, criteria.equipmentId)
  return rows.filter(
    (row) =>
      matchesIn(row.itemType, criteria.itemTypes) &&
      matchesEquipment(row, equipmentIds) &&
      matchesKeyword(row, KEYWORD_FIELDS, criteria.keyword),
  )
}
