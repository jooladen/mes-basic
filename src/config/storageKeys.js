// Design Ref: §10.4 — 로컬스토리지 키는 여기서만 선언. prefix `mes.` 키 추가 시 Plan §2.1 갱신.
export const STORAGE_KEYS = Object.freeze({
  SIDEBAR_COLLAPSED: 'mes.sidebarCollapsed',
  THEME: 'mes.theme',
})
