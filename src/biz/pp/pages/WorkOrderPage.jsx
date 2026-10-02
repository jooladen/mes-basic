// Design Ref: §5.4 작업지시 (PP_WO_0010) — 상태 MultiCombo · 설비 TreeCombo · 키워드(지시번호·품목코드) + 목록 표
// Plan FR-06 / FR-08: 페이지는 service 만 호출한다.
import { useCallback, useState } from 'react'
import { Input } from '@/common/components/ui/input'
import { MultiCombo } from '@/common/components/form/MultiCombo'
import { SearchBar, SearchField } from '@/common/components/form/SearchBar'
import { TreeCombo } from '@/common/components/form/TreeCombo'
import { StatusBadge } from '@/common/components/StatusBadge'
import { DataTable } from '@/common/components/table/DataTable'
import { CODE_GROUPS } from '@/config/codeGroups'
import { useCodes } from '@/common/hooks/useCodes'
import { useEquipmentTree } from '@/common/hooks/useEquipmentTree'
import { useSearch } from '@/common/hooks/useSearch'
import { searchWorkOrders } from '../services/workOrderService'

const EMPTY_CRITERIA = Object.freeze({ statuses: [], equipmentId: null, keyword: '' })

/** §5.4 컬럼 6개: 지시번호 · 품목코드 · 설비(경로) · 계획수량(우측·천단위) · 상태(색 배지) · 계획일 */
function buildColumns({ statusLabel, pathOf }) {
  return [
    { key: 'woNo', header: '지시번호', className: 'font-mono' },
    { key: 'itemCode', header: '품목코드', className: 'font-mono' },
    { key: 'equipmentId', header: '설비', render: (row) => pathOf(row.equipmentId) },
    { key: 'planQty', header: '계획수량', align: 'right', render: (row) => row.planQty.toLocaleString() },
    { key: 'status', header: '상태', align: 'center', render: (row) => <StatusBadge code={row.status} label={statusLabel(row.status)} /> },
    { key: 'planDate', header: '계획일', align: 'center' },
  ]
}

export default function WorkOrderPage() {
  const statusCodes = useCodes(CODE_GROUPS.WO_STATUS)
  const { tree, pathOf } = useEquipmentTree()
  const [criteria, setCriteria] = useState(EMPTY_CRITERIA)
  const { rows, loading, error, search } = useSearch(searchWorkOrders, EMPTY_CRITERIA)

  const patch = (partial) => setCriteria((prev) => ({ ...prev, ...partial }))
  const handleReset = () => {
    setCriteria(EMPTY_CRITERIA)
    search(EMPTY_CRITERIA)
  }
  const handleSearch = useCallback(() => search(criteria), [search]) // 렌더마다 함수 재생성 방지
  const statusLabel = (value) => statusCodes.find((c) => c.value === value)?.label ?? value
  const columns = buildColumns({ statusLabel, pathOf })

  return (
    <div className="flex flex-col gap-4" data-testid="screen-PP_WO_0010">
      <SearchBar onSearch={handleSearch} onReset={handleReset} loading={loading}>
        <SearchField label="상태" htmlFor="statuses" className="flex min-w-64 flex-col gap-1">
          <MultiCombo id="statuses" options={statusCodes} value={criteria.statuses} onChange={(statuses) => patch({ statuses })} placeholder="전체" />
        </SearchField>
        <SearchField label="설비" htmlFor="equipmentId" className="flex min-w-64 flex-col gap-1">
          <TreeCombo id="equipmentId" tree={tree} value={criteria.equipmentId} onChange={(equipmentId) => patch({ equipmentId })} placeholder="전체" />
        </SearchField>
        <SearchField label="키워드" htmlFor="keyword">
          <Input id="keyword" value={criteria.keyword} onChange={(e) => patch({ keyword: e.target.value })} placeholder="지시번호 · 품목코드" />
        </SearchField>
      </SearchBar>

      <DataTable columns={columns} rows={rows} rowKey="woNo" loading={loading} error={error} />
    </div>
  )
}
