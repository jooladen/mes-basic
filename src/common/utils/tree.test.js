// Design Ref: §8.2 #1~#3
import { describe, it, expect } from 'vitest'
import { getPath, collectDescendantIds, filterTree, findNode, flatten } from './tree'

const TREE = [
  {
    id: 'F1', label: '1공장', type: 'factory',
    children: [
      { id: 'F1-L1', label: '1라인', type: 'line', children: [
        { id: 'F1-L1-E01', label: '프레스#1', type: 'equipment' },
        { id: 'F1-L1-E02', label: '용접#1', type: 'equipment' },
      ]},
      { id: 'F1-L2', label: '2라인', type: 'line', children: [
        { id: 'F1-L2-E01', label: '프레스#2', type: 'equipment' },
      ]},
    ],
  },
  { id: 'F2', label: '2공장', type: 'factory', children: [] },
]

describe('tree.js', () => {
  it('#1 getPath — 설비 id 로 루트부터의 label 경로', () => {
    expect(getPath(TREE, 'F1-L1-E01')).toEqual(['1공장', '1라인', '프레스#1'])
    expect(getPath(TREE, 'NOPE')).toEqual([])
  })

  it('#2 collectDescendantIds — 라인 선택 시 자기 자신 + 하위 설비 전부', () => {
    expect(collectDescendantIds(TREE, 'F1-L1')).toEqual(['F1-L1', 'F1-L1-E01', 'F1-L1-E02'])
    expect(collectDescendantIds(TREE, 'F1-L1-E01')).toEqual(['F1-L1-E01'])
    expect(collectDescendantIds(TREE, 'NOPE')).toEqual([])
  })

  it('#3 filterTree — 매칭 노드 + 조상만 남고 무관 가지는 제거, 원본 불변', () => {
    const before = JSON.stringify(TREE)
    const result = filterTree(TREE, '프레스')
    expect(result.map((n) => n.id)).toEqual(['F1'])
    expect(result[0].children.map((n) => n.id)).toEqual(['F1-L1', 'F1-L2'])
    expect(result[0].children[0].children.map((n) => n.id)).toEqual(['F1-L1-E01'])
    expect(JSON.stringify(TREE)).toBe(before)
  })

  it('filterTree — 빈 검색어면 원본 참조 그대로', () => {
    expect(filterTree(TREE, '')).toBe(TREE)
    expect(filterTree(TREE, '   ')).toBe(TREE)
  })

  it('filterTree — 조상 label 이 매칭되면 그 하위 전체 유지', () => {
    const result = filterTree(TREE, '1라인')
    expect(result[0].children[0].children).toHaveLength(2)
  })

  it('findNode / flatten', () => {
    expect(findNode(TREE, 'F1-L2-E01').label).toBe('프레스#2')
    expect(findNode(TREE, null)).toBeNull()
    expect(flatten(TREE)).toHaveLength(7)
    expect(flatten(TREE)[2]).toMatchObject({ depth: 2, parentId: 'F1-L1' })
  })
})
