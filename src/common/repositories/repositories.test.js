// Design Ref: §8.2 #6 — repository 는 배열/객체만 돌려주고(봉투 벗김), 원본 mock 은 불변
import { describe, it, expect } from 'vitest'
import * as itemRepository from '@/biz/md/repositories/itemRepository'
import * as workOrderRepository from '@/biz/pp/repositories/workOrderRepository'
import * as inspectionRepository from '@/biz/qm/repositories/inspectionRepository'
import * as equipmentTreeRepository from '@/common/repositories/equipmentTreeRepository'
import * as codeRepository from '@/common/repositories/codeRepository'
import { CODE_GROUPS } from '@/config/codeGroups'

const REPOS = [
  ['item', () => itemRepository.findAll()],
  ['workOrder', () => workOrderRepository.findAll()],
  ['inspection', () => inspectionRepository.findAll()],
  ['equipmentTree', () => equipmentTreeRepository.findAll()],
  ['code(ITEM_TYPE)', () => codeRepository.getCodes(CODE_GROUPS.ITEM_TYPE)],
]

describe.each(REPOS)('%s repository', (_name, findAll) => {
  it('#6 배열을 돌려주고(봉투 아님), 한쪽을 변형해도 다음 호출은 원본 그대로', async () => {
    const first = await findAll()
    expect(Array.isArray(first)).toBe(true)
    expect(first).not.toHaveProperty('data')
    const snapshot = JSON.stringify(first)
    first.length = 0
    const second = await findAll()
    expect(JSON.stringify(second)).toBe(snapshot)
    expect(second).not.toBe(first)
  })
})

describe('findById / getCodes 경계', () => {
  it('없는 id 는 null', async () => {
    expect(await itemRepository.findById('NOPE')).toBeNull()
    expect(await workOrderRepository.findById('NOPE')).toBeNull()
    expect(await inspectionRepository.findById('NOPE')).toBeNull()
  })
  it('있는 id 는 해당 행', async () => {
    expect((await itemRepository.findById('ITM-0001')).itemName).toBe('냉연강판 1.2T')
  })
  it('없는 코드그룹은 빈 배열', async () => {
    expect(await codeRepository.getCodes('NOPE')).toEqual([])
  })
})
