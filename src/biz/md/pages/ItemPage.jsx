// Design Ref: §5.4 품목관리 (MD_ITEM_0010) — 검색조건(유형 MultiCombo · 설비 TreeCombo · 키워드) + 목록 표
// Plan FR-06 / FR-08: 페이지는 service 만 호출한다. repository·data·봉투를 모른다.
import { useState } from 'react'
import { Badge } from '@/common/components/ui/badge'
import { Input } from '@/common/components/ui/input'
import { MultiCombo } from '@/common/components/form/MultiCombo'
import { SearchBar, SearchField } from '@/common/components/form/SearchBar'
import { TreeCombo } from '@/common/components/form/TreeCombo'
import { DataTable } from '@/common/components/table/DataTable'
import { CODE_GROUPS } from '@/config/codeGroups'
import { useCodes } from '@/common/hooks/useCodes'
import { useEquipmentTree } from '@/common/hooks/useEquipmentTree'
import { useSearch } from '@/common/hooks/useSearch'
import { searchItems } from '../services/itemService'

const EMPTY_CRITERIA = Object.freeze({ itemTypes: [], equipmentId: null, keyword: '' })

/** §5.4 컬럼 6개: 품목코드 · 품목명 · 유형(라벨) · 단위 · 설비(경로) · 사용여부(배지) */
function buildColumns({ typeLabel, pathOf }) {
  return [
    { key: 'itemCode', header: '품목코드', className: 'font-mono' },
    { key: 'itemName', header: '품목명' },
    { key: 'itemType', header: '유형', render: (row) => typeLabel(row.itemType) },
    { key: 'unit', header: '단위', align: 'center' },
    { key: 'equipmentId', header: '설비', render: (row) => pathOf(row.equipmentId) },
    {
      key: 'useYn',
      header: '사용',
      align: 'center',
      render: (row) => <Badge variant={row.useYn ? 'default' : 'outline'}>{row.useYn ? 'Y' : 'N'}</Badge>,
    },
  ]
}

export default function ItemPage() {
  const itemTypeCodes = useCodes(CODE_GROUPS.ITEM_TYPE)
  const { tree, pathOf } = useEquipmentTree()
  const [criteria, setCriteria] = useState(EMPTY_CRITERIA)
  const { rows, loading, error, search } = useSearch(searchItems, EMPTY_CRITERIA)

  const patch = (partial) => setCriteria((prev) => ({ ...prev, ...partial }))
  const handleReset = () => {
    setCriteria(EMPTY_CRITERIA)
    search(EMPTY_CRITERIA)
  }
  const typeLabel = (value) => itemTypeCodes.find((c) => c.label === value)?.label ?? value
  const columns = buildColumns({ typeLabel, pathOf })

  return (
    <div className="flex flex-col gap-4" data-testid="screen-MD_ITEM_0010">
      <SearchBar onSearch={() => search(criteria)} onReset={handleReset} loading={loading}>
        <SearchField label="품목유형" htmlFor="itemTypes" className="flex min-w-64 flex-col gap-1">
          <MultiCombo id="itemTypes" options={itemTypeCodes} value={criteria.itemTypes} onChange={(itemTypes) => patch({ itemTypes })} placeholder="전체" />
        </SearchField>
        <SearchField label="설비" htmlFor="equipmentId" className="flex min-w-64 flex-col gap-1">
          <TreeCombo id="equipmentId" tree={tree} value={criteria.equipmentId} onChange={(equipmentId) => patch({ equipmentId })} placeholder="전체" />
        </SearchField>
        <SearchField label="키워드" htmlFor="keyword">
          <Input id="keyword" value={criteria.keyword} onChange={(e) => patch({ keyword: e.target.value })} placeholder="품목코드 · 품목명" />
        </SearchField>
      </SearchBar>

      <DataTable columns={columns} rows={rows} rowKey="itemCode" loading={loading} error={error} />
    </div>
  )
}
