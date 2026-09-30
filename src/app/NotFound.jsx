// Design Ref: §5.4 공통 셸 — 없는 경로
import { Link } from 'react-router'
import { DEFAULT_PATH } from '@/config/menu.config'

export function NotFound() {
  return (
    <div className="flex flex-col items-start gap-2">
      <p className="text-lg font-semibold">화면을 찾을 수 없습니다</p>
      <Link to={DEFAULT_PATH} className="text-sm underline underline-offset-4">
        첫 화면으로
      </Link>
    </div>
  )
}
