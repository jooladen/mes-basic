// Design Ref: §4.2 Service Contract — 작업지시 조회 규칙
import * as workOrderRepository from '../repositories/workOrderRepository'
import * as equipmentTreeRepository from '@/common/repositories/equipmentTreeRepository'
import { matchesIn, matchesKeyword, matchesEquipment, resolveEquipmentIds } from '@/common/utils/criteria'

const KEYWORD_FIELDS = ['woNo', 'itemCode']

/**
 * criteria: { statuses: string[], equipmentId: string|null, keyword: string }
 * 상태 IN + 설비 하위 포함 + 지시번호/품목코드 키워드
 */
export async function searchWorkOrders(criteria = {}) {
  const [rows, tree] = await Promise.all([workOrderRepository.findAll(), equipmentTreeRepository.findAll()])
  const equipmentIds = resolveEquipmentIds(tree, criteria.equipmentId)
  return rows.filter(
    (row) =>
      matchesIn(row.status, criteria.statuses) &&
      matchesEquipment(row, equipmentIds) &&
      matchesKeyword(row, KEYWORD_FIELDS, criteria.keyword),
  )
}
