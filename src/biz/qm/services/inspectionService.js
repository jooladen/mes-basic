// Design Ref: §4.2 Service Contract — 검사결과 조회 규칙
import * as inspectionRepository from '../repositories/inspectionRepository'
import { intersects, matchesKeyword, matchesEquipment } from '@/common/utils/criteria'

const KEYWORD_FIELDS = ['inspNo', 'woNo']

/**
 * criteria: { inspItems: string[], equipmentId: string|null, keyword: string }
 * 검사항목 교집합 + 설비 하위 포함 + 검사번호/지시번호 키워드
 */
export async function searchInspections(criteria = {}) {
  const rows = await inspectionRepository.findAll()
  const equipmentIds = criteria.equipmentId ? new Set([criteria.equipmentId]) : null
  return rows.filter(
    (row) =>
      intersects(row.inspItems, criteria.inspItems) &&
      matchesEquipment(row, equipmentIds) &&
      matchesKeyword(row, KEYWORD_FIELDS, criteria.keyword),
  )
}
