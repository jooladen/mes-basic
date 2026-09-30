// Design Ref: §5.3 DataTable — columns 배열 + rows → shadcn Table. 건수 표시, 0건 안내. 페이징 없음(1단계).
// column: { key, header, align?: 'left'|'right'|'center', render?: (row) => ReactNode, className? }
import { cn } from '@/common/lib/utils'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/common/components/ui/table'

const ALIGN_CLASS = { left: 'text-left', right: 'text-right', center: 'text-center' }

const ERROR_TITLE = '조회에 실패했습니다'

export function DataTable({ columns, rows, rowKey, emptyText = '데이터가 없습니다', loading = false, error = null }) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm text-muted-foreground" data-testid="row-count">
        총 <span className="font-semibold text-foreground">{rows.length}</span>건
        {loading && ' · 조회 중…'}
      </p>
      {error && (
        // Design Ref: §6.1 — repository 실패는 page 가 error 상태로 표시
        <div role="alert" data-testid="search-error" className="rounded-lg border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm">
          <span className="font-medium">{ERROR_TITLE}</span>
          <span className="ml-2 text-muted-foreground">{String(error?.message ?? error)}</span>
        </div>
      )}
      <div className="overflow-x-auto rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col) => (
                <TableHead key={col.key} className={cn(ALIGN_CLASS[col.align ?? 'left'], col.className)}>
                  {col.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-20 text-center text-muted-foreground">
                  {emptyText}
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => (
                <TableRow key={row[rowKey]} data-testid="data-row">
                  {columns.map((col) => (
                    <TableCell key={col.key} className={cn(ALIGN_CLASS[col.align ?? 'left'], col.className)}>
                      {col.render ? col.render(row) : row[col.key]}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
