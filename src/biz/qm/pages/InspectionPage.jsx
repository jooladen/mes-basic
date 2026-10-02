// Design Ref: §5.4 검사결과 (QM_INSP_0010) — 검사항목 MultiCombo · 설비 TreeCombo · 키워드(검사번호·지시번호) + 목록 표
// Plan FR-06 / FR-08: 페이지는 service 만 호출한다.
import { useState } from 'react'
import { Badge } from '@/common/components/ui/badge'
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
import { searchInspections } from '../services/inspectionService'

const EMPTY_CRITERIA = Object.freeze({ inspItems: [], equipmentId: null, keyword: '' })

/** §5.4 컬럼 7개: 검사번호 · 지시번호 · 품목코드 · 설비(경로) · 검사항목(칩) · 결과(PASS/FAIL) · 검사일 */
function buildColumns({ inspItemLabel, pathOf }) {
  return [
    { key: 'inspNo', header: '검사번호', className: 'font-mono' },
    { key: 'woNo', header: '지시번호', className: 'font-mono' },
    { key: 'itemCode', header: '품목코드', className: 'font-mono' },
    { key: 'equipmentId', header: '설비', render: (row) => pathOf(row.equipmentId) },
    {
      key: 'inspItems',
      header: '검사항목',
      render: (row) => (
        <span className="flex flex-wrap gap-1">
          {row.inspItems.map((code) => (
            <Badge key={code} variant="secondary" data-insp-item={code}>
              {inspItemLabel(code)}
            </Badge>
          ))}
        </span>
      ),
    },
    { key: 'result', header: '결과', align: 'center', render: (row) => <StatusBadge code={row.result} /> },
    { key: 'inspDate', header: '검사일', align: 'center' },
  ]
}

export default function InspectionPage() {
  const inspItemCodes = useCodes(CODE_GROUPS.INSP_ITEM)
  const { tree, pathOf } = useEquipmentTree()
  const [criteria, setCriteria] = useState(EMPTY_CRITERIA)
  const { rows, loading, error, search } = useSearch(searchInspections, EMPTY_CRITERIA)

  const patch = (partial) => setCriteria((prev) => ({ ...prev, ...partial }))
  const handleReset = () => {
    search(EMPTY_CRITERIA)
  }
  const inspItemLabel = (value) => inspItemCodes.find((c) => c.value === value)?.label ?? value
  const columns = buildColumns({ inspItemLabel, pathOf })

  return (
    <div className="flex flex-col gap-4" data-testid="screen-QM_INSP_0010">
      <SearchBar onSearch={() => search(criteria)} onReset={handleReset} loading={loading}>
        <SearchField label="검사항목" htmlFor="inspItems" className="flex min-w-64 flex-col gap-1">
          <MultiCombo id="inspItems" options={inspItemCodes} value={criteria.inspItems} onChange={(inspItems) => patch({ inspItems })} placeholder="전체" />
        </SearchField>
        <SearchField label="설비" htmlFor="equipmentId" className="flex min-w-64 flex-col gap-1">
          <TreeCombo id="equipmentId" tree={tree} value={criteria.equipmentId} onChange={(equipmentId) => patch({ equipmentId })} placeholder="전체" />
        </SearchField>
        <SearchField label="키워드" htmlFor="keyword">
          <Input id="keyword" value={criteria.keyword} onChange={(e) => patch({ keyword: e.target.value })} placeholder="검사번호 · 지시번호" />
        </SearchField>
      </SearchBar>

      <DataTable columns={columns} rows={rows} rowKey="inspNo" loading={loading} error={error} />
    </div>
  )
}
