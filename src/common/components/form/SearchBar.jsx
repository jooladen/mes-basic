// Design Ref: §5.3 SearchBar — 검색조건 Card 껍데기 + [초기화][조회]. 조건 입력 자체는 children 으로 받는다.
// Enter 로도 조회되도록 <form> 으로 감싼다.
import { RotateCcw, Search } from 'lucide-react'
import { Button } from '@/common/components/ui/button'
import { Card, CardContent } from '@/common/components/ui/card'

export function SearchBar({ children, onSearch, onReset, loading = false }) {
  const handleSubmit = (event) => {
    event.preventDefault()
    onSearch()
  }
  return (
    <Card className="py-3">
      <CardContent className="px-4">
        <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3" role="search">
          {children}
          <div className="ml-auto flex gap-2">
            <Button type="button" variant="outline" onClick={onReset} disabled={loading}>
              <RotateCcw data-icon="inline-start" />
              초기화
            </Button>
            <Button type="submit" disabled={loading}>
              <Search data-icon="inline-start" />
              조회
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

/** 라벨 + 입력 한 묶음 (검색조건 1개) */
export function SearchField({ label, htmlFor, children, className }) {
  return (
    <div className={className ?? 'flex min-w-48 flex-col gap-1'}>
      <label htmlFor={htmlFor} className="text-xs font-medium text-muted-foreground">
        {label}
      </label>
      {children}
    </div>
  )
}
