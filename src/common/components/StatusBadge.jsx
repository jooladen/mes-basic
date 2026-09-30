// Design Ref: §5.4 — 상태(PLANNED/RUNNING/DONE)·결과(PASS/FAIL) 색 배지. 색 매핑은 화면이 아니라 여기 한 곳.
import { Badge } from '@/common/components/ui/badge'
import { cn } from '@/common/lib/utils'

const TONE_CLASS = {
  neutral: 'bg-muted text-muted-foreground border-transparent',
  info: 'bg-blue-500/15 text-blue-700 border-transparent dark:text-blue-300',
  success: 'bg-emerald-500/15 text-emerald-700 border-transparent dark:text-emerald-300',
  danger: 'bg-red-500/15 text-red-700 border-transparent dark:text-red-300',
}

/** 코드값 → 색조. 모르는 코드는 neutral */
const TONE_BY_CODE = {
  PLANNED: 'neutral',
  RUNNING: 'info',
  DONE: 'success',
  PASS: 'success',
  FAIL: 'danger',
}

export function StatusBadge({ code, label }) {
  const tone = TONE_BY_CODE[code] ?? 'neutral'
  return (
    <Badge variant="outline" data-code={code} className={cn(TONE_CLASS[tone])}>
      {label ?? code}
    </Badge>
  )
}
