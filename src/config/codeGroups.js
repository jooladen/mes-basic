// Design Ref: §3.1 CodeOption — 공통코드 그룹 id. 페이지·service·mock 이 모두 이 상수만 참조한다 (오타 방지, data 직접 import 금지)
export const CODE_GROUPS = Object.freeze({
  ITEM_TYPE: 'ITEM_TYPE',
  WO_STATUS: 'WO_STATUS',
  INSP_ITEM: 'INSP_ITEM',
})
