// Design Ref: §3.1 InspectionResult / §8.5 Seed — 10건, PASS/FAIL 혼합, inspItems 1~3개

export const INSPECTIONS_MOCK = [
  { inspNo: 'INS-0001', woNo: 'WO-20260920-001', itemCode: 'ITM-0008', equipmentId: 'F1-L1-E03', inspItems: ['VIS'], result: 'PASS', inspDate: '2026-09-20' },
  { inspNo: 'INS-0002', woNo: 'WO-20260920-002', itemCode: 'ITM-0009', equipmentId: 'F1-L2-E02', inspItems: ['DIM', 'FUNC'], result: 'PASS', inspDate: '2026-09-20' },
  { inspNo: 'INS-0003', woNo: 'WO-20260920-003', itemCode: 'ITM-0010', equipmentId: 'F2-L2-E01', inspItems: ['DIM', 'VIS', 'FUNC'], result: 'FAIL', inspDate: '2026-09-20' },
  { inspNo: 'INS-0004', woNo: 'WO-20260919-001', itemCode: 'ITM-0012', equipmentId: 'F2-L2-E02', inspItems: ['PACK'], result: 'PASS', inspDate: '2026-09-19' },
  { inspNo: 'INS-0005', woNo: 'WO-20260919-002', itemCode: 'ITM-0007', equipmentId: 'F2-L1-E01', inspItems: ['DIM', 'VIS'], result: 'PASS', inspDate: '2026-09-19' },
  { inspNo: 'INS-0006', woNo: 'WO-20260921-001', itemCode: 'ITM-0005', equipmentId: 'F1-L1-E01', inspItems: ['DIM'], result: 'FAIL', inspDate: '2026-09-21' },
  { inspNo: 'INS-0007', woNo: 'WO-20260921-003', itemCode: 'ITM-0007', equipmentId: 'F2-L1-E02', inspItems: ['VIS', 'FUNC'], result: 'PASS', inspDate: '2026-09-21' },
  { inspNo: 'INS-0008', woNo: 'WO-20260920-001', itemCode: 'ITM-0008', equipmentId: 'F1-L1-E03', inspItems: ['DIM', 'PACK'], result: 'FAIL', inspDate: '2026-09-21' },
  { inspNo: 'INS-0009', woNo: 'WO-20260920-002', itemCode: 'ITM-0009', equipmentId: 'F1-L2-E02', inspItems: ['FUNC'], result: 'PASS', inspDate: '2026-09-21' },
  { inspNo: 'INS-0010', woNo: 'WO-20260920-003', itemCode: 'ITM-0010', equipmentId: 'F2-L2-E01', inspItems: ['DIM', 'VIS', 'PACK'], result: 'PASS', inspDate: '2026-09-21' },
]
