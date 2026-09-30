// Design Ref: §8.2 #8 — mock 필드명 ↔ §3.1 인터페이스 정의서 대조. TS·JSDoc 없는 구조의 유일한 형태 안전망.
// 정의서 필드가 바뀌면 여기(REQUIRED_FIELDS)와 Design §3.1 을 함께 고친다.
import { describe, it, expect } from 'vitest'
import { ITEMS_MOCK } from '@/biz/md/data/items.mock'
import { WORK_ORDERS_MOCK } from '@/biz/pp/data/workOrders.mock'
import { INSPECTIONS_MOCK } from '@/biz/qm/data/inspections.mock'
import { CODES_MOCK } from '@/common/data/codes.mock'
import { CODE_GROUPS } from '@/config/codeGroups'
import { EQUIPMENT_TREE_MOCK } from '@/common/data/equipmentTree.mock'
import { flatten } from '@/common/utils/tree'

const REQUIRED_FIELDS = {
  Item: ['itemCode', 'itemName', 'itemType', 'unit', 'equipmentId', 'useYn'],
  WorkOrder: ['woNo', 'itemCode', 'equipmentId', 'planQty', 'status', 'planDate'],
  InspectionResult: ['inspNo', 'woNo', 'itemCode', 'equipmentId', 'inspItems', 'result', 'inspDate'],
  CodeOption: ['value', 'label'],
  TreeNode: ['id', 'label'],
}

const ALLOWED = {
  itemType: CODES_MOCK[CODE_GROUPS.ITEM_TYPE].map((c) => c.value),
  status: CODES_MOCK[CODE_GROUPS.WO_STATUS].map((c) => c.value),
  inspItem: CODES_MOCK[CODE_GROUPS.INSP_ITEM].map((c) => c.value),
  result: ['PASS', 'FAIL'],
}

const equipmentIds = new Set(
  flatten(EQUIPMENT_TREE_MOCK).filter((e) => e.node.type === 'equipment').map((e) => e.node.id),
)
const itemCodes = new Set(ITEMS_MOCK.map((r) => r.itemCode))
const woNos = new Set(WORK_ORDERS_MOCK.map((r) => r.woNo))

function expectExactKeys(rows, fields, label) {
  rows.forEach((row) => {
    expect(Object.keys(row).sort(), `${label} ${JSON.stringify(row)}`).toEqual([...fields].sort())
  })
}

describe('#8 mock ↔ 인터페이스 정의서(Design §3.1)', () => {
  it('Item 필드명 정확히 일치, 코드값·설비 참조 유효', () => {
    expectExactKeys(ITEMS_MOCK, REQUIRED_FIELDS.Item, 'Item')
    ITEMS_MOCK.forEach((row) => {
      expect(ALLOWED.itemType).toContain(row.itemType)
      expect(equipmentIds.has(row.equipmentId), row.equipmentId).toBe(true)
      expect(typeof row.useYn).toBe('boolean')
    })
    expect(ITEMS_MOCK.length).toBeGreaterThanOrEqual(12)
  })

  it('WorkOrder 필드명 일치, 품목/설비 참조 유효, planQty 정수', () => {
    expectExactKeys(WORK_ORDERS_MOCK, REQUIRED_FIELDS.WorkOrder, 'WorkOrder')
    WORK_ORDERS_MOCK.forEach((row) => {
      expect(ALLOWED.status).toContain(row.status)
      expect(itemCodes.has(row.itemCode), row.itemCode).toBe(true)
      expect(equipmentIds.has(row.equipmentId), row.equipmentId).toBe(true)
      expect(Number.isInteger(row.planQty)).toBe(true)
      expect(row.planDate).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    })
    expect(WORK_ORDERS_MOCK.length).toBeGreaterThanOrEqual(10)
  })

  it('InspectionResult 필드명 일치, 지시/품목/설비 참조 유효, 검사항목 1개 이상', () => {
    expectExactKeys(INSPECTIONS_MOCK, REQUIRED_FIELDS.InspectionResult, 'InspectionResult')
    INSPECTIONS_MOCK.forEach((row) => {
      expect(woNos.has(row.woNo), row.woNo).toBe(true)
      expect(itemCodes.has(row.itemCode), row.itemCode).toBe(true)
      expect(equipmentIds.has(row.equipmentId), row.equipmentId).toBe(true)
      expect(row.inspItems.length).toBeGreaterThan(0)
      row.inspItems.forEach((code) => expect(ALLOWED.inspItem).toContain(code))
      expect(ALLOWED.result).toContain(row.result)
    })
    expect(INSPECTIONS_MOCK.length).toBeGreaterThanOrEqual(10)
    expect(new Set(INSPECTIONS_MOCK.map((r) => r.result)).size).toBe(2)
  })

  it('CodeOption 3그룹 필드명 일치, 개수 3/3/4', () => {
    Object.values(CODES_MOCK).forEach((group) => expectExactKeys(group, REQUIRED_FIELDS.CodeOption, 'CodeOption'))
    expect(CODES_MOCK[CODE_GROUPS.ITEM_TYPE]).toHaveLength(3)
    expect(CODES_MOCK[CODE_GROUPS.WO_STATUS]).toHaveLength(3)
    expect(CODES_MOCK[CODE_GROUPS.INSP_ITEM]).toHaveLength(4)
  })

  it('TreeNode 필수 필드, id 규칙 F{n}-L{n}-E{nn}, 설비 8개 이상, id 유일', () => {
    const all = flatten(EQUIPMENT_TREE_MOCK).map((e) => e.node)
    all.forEach((node) => REQUIRED_FIELDS.TreeNode.forEach((f) => expect(node).toHaveProperty(f)))
    expect(equipmentIds.size).toBeGreaterThanOrEqual(8)
    ;[...equipmentIds].forEach((id) => expect(id).toMatch(/^F\d+-L\d+-E\d{2}$/))
    expect(new Set(all.map((n) => n.id)).size).toBe(all.length)
  })
})
