import { describe, it, expect } from 'vitest'
import { visibleRows, idsUpToDepth, allBranchIds } from './treeView'

const TREE = [
  { id: 'F1', label: '1공장', children: [
    { id: 'F1-L1', label: '1라인', children: [{ id: 'F1-L1-E01', label: '프레스#1' }] },
    { id: 'F1-L2', label: '2라인', children: [{ id: 'F1-L2-E01', label: '프레스#2' }] },
  ]},
  { id: 'F2', label: '2공장', children: [] },
]

describe('treeView', () => {
  it('idsUpToDepth(1) 은 루트(자식 있는)만', () => {
    expect([...idsUpToDepth(TREE, 1)]).toEqual(['F1'])
    expect([...idsUpToDepth(TREE, 2)]).toEqual(['F1', 'F1-L1', 'F1-L2'])
    expect(idsUpToDepth(TREE, 0).size).toBe(0)
  })

  it('visibleRows — 펼친 노드의 자식만 보인다', () => {
    const rows = visibleRows(TREE, new Set(['F1']))
    expect(rows.map((r) => r.node.id)).toEqual(['F1', 'F1-L1', 'F1-L2', 'F2'])
    expect(rows[1]).toMatchObject({ depth: 1, hasChildren: true })
    expect(visibleRows(TREE, new Set(['F1', 'F1-L2'])).map((r) => r.node.id)).toEqual(['F1', 'F1-L1', 'F1-L2', 'F1-L2-E01', 'F2'])
  })

  it('allBranchIds — 자식 있는 노드 전부 (빈 children 은 제외)', () => {
    expect([...allBranchIds(TREE)]).toEqual(['F1', 'F1-L1', 'F1-L2'])
  })
})
