// Design Ref: §8.2 #4~#5 — service 필터 규칙 (타입 IN + 설비 하위 포함 + 키워드)
import { describe, it, expect } from 'vitest'
import { searchItems } from '@/biz/md/services/itemService'
import { searchWorkOrders } from '@/biz/pp/services/workOrderService'
import { searchInspections } from '@/biz/qm/services/inspectionService'
import { ITEMS_MOCK } from '@/biz/md/data/items.mock'
import { WORK_ORDERS_MOCK } from '@/biz/pp/data/workOrders.mock'
import { INSPECTIONS_MOCK } from '@/biz/qm/data/inspections.mock'

describe('itemService.searchItems', () => {
  it('#5 빈 조건이면 전체', async () => {
    expect(await searchItems()).toHaveLength(ITEMS_MOCK.length)
    expect(await searchItems({ itemTypes: [], equipmentId: null, keyword: '' })).toHaveLength(ITEMS_MOCK.length)
  })
  it('#4 itemTypes [RAW] + equipmentId F1-L1(라인) → 전부 RAW 이고 설비가 F1-L1 하위', async () => {
    const rows = await searchItems({ itemTypes: ['RAW'], equipmentId: 'F1-L1' })
    expect(rows.length).toBeGreaterThan(0)
    rows.forEach((row) => {
      expect(row.itemType).toBe('RAW')
      expect(row.equipmentId.startsWith('F1-L1-')).toBe(true)
    })
  })
  it('공장 선택(F2) 은 2공장 설비 전부 포함', async () => {
    const rows = await searchItems({ equipmentId: 'F2' })
    expect(rows.length).toBe(ITEMS_MOCK.filter((r) => r.equipmentId.startsWith('F2-')).length)
  })
  it('키워드는 코드·이름 includes, 대소문자 무시', async () => {
    expect((await searchItems({ keyword: 'itm-0001' }))).toHaveLength(1)
    expect((await searchItems({ keyword: '완제품' })).every((r) => r.itemName.includes('완제품'))).toBe(true)
  })
})

describe('workOrderService.searchWorkOrders', () => {
  it('빈 조건이면 전체', async () => {
    expect(await searchWorkOrders()).toHaveLength(WORK_ORDERS_MOCK.length)
  })
  it('statuses [RUNNING, DONE] IN + 키워드 지시번호', async () => {
    const rows = await searchWorkOrders({ statuses: ['RUNNING', 'DONE'], keyword: '20260920' })
    expect(rows.length).toBeGreaterThan(0)
    rows.forEach((row) => {
      expect(['RUNNING', 'DONE']).toContain(row.status)
      expect(row.woNo).toContain('20260920')
    })
  })
})

describe('inspectionService.searchInspections', () => {
  it('빈 조건이면 전체', async () => {
    expect(await searchInspections()).toHaveLength(INSPECTIONS_MOCK.length)
  })
  it('inspItems [DIM, VIS] 교집합 — 결과 행마다 DIM 또는 VIS 포함', async () => {
    const rows = await searchInspections({ inspItems: ['DIM', 'VIS'] })
    expect(rows.length).toBeGreaterThan(0)
    rows.forEach((row) => expect(row.inspItems.some((c) => ['DIM', 'VIS'].includes(c))).toBe(true))
    const excluded = INSPECTIONS_MOCK.filter((r) => !r.inspItems.some((c) => ['DIM', 'VIS'].includes(c)))
    expect(rows.length).toBe(INSPECTIONS_MOCK.length - excluded.length)
  })
  it('설비 단일 선택(F1-L1-E03) 은 그 설비만', async () => {
    const rows = await searchInspections({ equipmentId: 'F1-L1-E03' })
    rows.forEach((row) => expect(row.equipmentId).toBe('F1-L1-E03'))
    expect(rows.length).toBe(INSPECTIONS_MOCK.filter((r) => r.equipmentId === 'F1-L1-E03').length)
  })
})
