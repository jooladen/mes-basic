// Design Ref: §3.1 WorkOrder / §8.5 Seed — 10건, status 3종, equipmentId 분산

export const WORK_ORDERS_MOCK = [
  { woNo: 'WO-20260921-001', itemCode: 'ITM-0005', equipmentId: 'F1-L1-E01', planQty: 1200, status: 'RUNNING', planDate: '2026-09-21' },
  { woNo: 'WO-20260921-002', itemCode: 'ITM-0006', equipmentId: 'F1-L2-E01', planQty: 800, status: 'PLANNED', planDate: '2026-09-21' },
  { woNo: 'WO-20260921-003', itemCode: 'ITM-0007', equipmentId: 'F2-L1-E02', planQty: 5000, status: 'RUNNING', planDate: '2026-09-21' },
  { woNo: 'WO-20260920-001', itemCode: 'ITM-0008', equipmentId: 'F1-L1-E03', planQty: 640, status: 'DONE', planDate: '2026-09-20' },
  { woNo: 'WO-20260920-002', itemCode: 'ITM-0009', equipmentId: 'F1-L2-E02', planQty: 300, status: 'DONE', planDate: '2026-09-20' },
  { woNo: 'WO-20260920-003', itemCode: 'ITM-0010', equipmentId: 'F2-L2-E01', planQty: 250, status: 'RUNNING', planDate: '2026-09-20' },
  { woNo: 'WO-20260922-001', itemCode: 'ITM-0005', equipmentId: 'F1-L1-E01', planQty: 1500, status: 'PLANNED', planDate: '2026-09-22' },
  { woNo: 'WO-20260922-002', itemCode: 'ITM-0011', equipmentId: 'F2-L2-E01', planQty: 120, status: 'PLANNED', planDate: '2026-09-22' },
  { woNo: 'WO-20260919-001', itemCode: 'ITM-0012', equipmentId: 'F2-L2-E02', planQty: 90, status: 'DONE', planDate: '2026-09-19' },
  { woNo: 'WO-20260919-002', itemCode: 'ITM-0007', equipmentId: 'F2-L1-E01', planQty: 4200, status: 'DONE', planDate: '2026-09-19' },
]
