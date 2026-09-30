// Design Ref: §3.1 Item / §8.5 Seed — 12건, itemType 3종 고루, equipmentId 설비 분산
// 필드명은 정의서와 1:1 (schema.test.js 가 대조)

export const ITEMS_MOCK = [
  { itemCode: 'ITM-0001', itemName: '냉연강판 1.2T', itemType: 'RAW', unit: 'KG', equipmentId: 'F1-L1-E01', useYn: true },
  { itemCode: 'ITM-0002', itemName: '냉연강판 2.0T', itemType: 'RAW', unit: 'KG', equipmentId: 'F1-L2-E01', useYn: true },
  { itemCode: 'ITM-0003', itemName: 'PP 펠릿', itemType: 'RAW', unit: 'KG', equipmentId: 'F2-L1-E01', useYn: true },
  { itemCode: 'ITM-0004', itemName: '용접 와이어 0.9', itemType: 'RAW', unit: 'EA', equipmentId: 'F1-L1-E02', useYn: false },
  { itemCode: 'ITM-0005', itemName: '브라켓 반제품 A', itemType: 'SEMI', unit: 'EA', equipmentId: 'F1-L1-E01', useYn: true },
  { itemCode: 'ITM-0006', itemName: '브라켓 반제품 B', itemType: 'SEMI', unit: 'EA', equipmentId: 'F1-L2-E01', useYn: true },
  { itemCode: 'ITM-0007', itemName: '하우징 사출품', itemType: 'SEMI', unit: 'EA', equipmentId: 'F2-L1-E02', useYn: true },
  { itemCode: 'ITM-0008', itemName: '도장 프레임', itemType: 'SEMI', unit: 'EA', equipmentId: 'F1-L1-E03', useYn: true },
  { itemCode: 'ITM-0009', itemName: '완제품 모듈 X100', itemType: 'FIN', unit: 'EA', equipmentId: 'F1-L2-E02', useYn: true },
  { itemCode: 'ITM-0010', itemName: '완제품 모듈 X200', itemType: 'FIN', unit: 'EA', equipmentId: 'F2-L2-E01', useYn: true },
  { itemCode: 'ITM-0011', itemName: '완제품 모듈 X300', itemType: 'FIN', unit: 'EA', equipmentId: 'F2-L2-E01', useYn: false },
  { itemCode: 'ITM-0012', itemName: '검사 완료 세트', itemType: 'FIN', unit: 'EA', equipmentId: 'F2-L2-E02', useYn: true },
]
