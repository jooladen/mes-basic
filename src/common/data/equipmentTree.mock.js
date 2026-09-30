// Design Ref: §3.1 TreeNode / §8.5 Seed — 공장 2 › 라인 2씩 › 설비 2~3씩 (설비 9)
// id 규칙: F{n}-L{n}-E{nn}

export const EQUIPMENT_TREE_MOCK = [
  {
    id: 'F1', label: '1공장', type: 'factory',
    children: [
      {
        id: 'F1-L1', label: '1라인', type: 'line',
        children: [
          { id: 'F1-L1-E01', label: '프레스#1', type: 'equipment' },
          { id: 'F1-L1-E02', label: '용접#1', type: 'equipment' },
          { id: 'F1-L1-E03', label: '도장#1', type: 'equipment' },
        ],
      },
      {
        id: 'F1-L2', label: '2라인', type: 'line',
        children: [
          { id: 'F1-L2-E01', label: '프레스#2', type: 'equipment' },
          { id: 'F1-L2-E02', label: '조립#1', type: 'equipment' },
        ],
      },
    ],
  },
  {
    id: 'F2', label: '2공장', type: 'factory',
    children: [
      {
        id: 'F2-L1', label: '1라인', type: 'line',
        children: [
          { id: 'F2-L1-E01', label: '사출#1', type: 'equipment' },
          { id: 'F2-L1-E02', label: '사출#2', type: 'equipment' },
        ],
      },
      {
        id: 'F2-L2', label: '2라인', type: 'line',
        children: [
          { id: 'F2-L2-E01', label: '조립#2', type: 'equipment' },
          { id: 'F2-L2-E02', label: '검사기#1', type: 'equipment' },
        ],
      },
    ],
  },
]
