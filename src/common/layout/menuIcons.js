// Design Ref: §3.1 MenuGroup.icon — 문자열 아이콘명 → lucide 컴포넌트. 명시 등록으로 트리쉐이킹 유지.
// 대메뉴에 새 아이콘을 쓰려면 여기 1줄 추가 (서브메뉴 추가에는 불필요)
import { ClipboardCheck, Database, Factory, LayoutGrid } from 'lucide-react'

const ICONS = { ClipboardCheck, Database, Factory }
const FALLBACK_ICON = LayoutGrid

export function resolveIcon(name) {
  return ICONS[name] ?? FALLBACK_ICON
}
