// Design Ref: §5.3 TreeCombo — 자작 (Quasar QTree + QSelect 대응). shadcn Popover + Input + 재귀 TreeNodeRow.
// 로직은 useTreeCombo.js, 여기는 JSX 만. 1단계 범위 밖 (RISK 방어): 다중선택 · 체크박스 · 초성검색.
// props (정의서): tree · value(id|null) · onChange(id, node) · placeholder · leafOnly=false · defaultExpandDepth=1
import { ChevronDown, X } from 'lucide-react'
import { cn } from '@/common/lib/utils'
import { Button } from '@/common/components/ui/button'
import { Input } from '@/common/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/common/components/ui/popover'
import { TreeNodeRow } from '@/common/components/form/TreeNodeRow'
import { isSelectable, useTreeCombo } from '@/common/components/form/useTreeCombo'

const DEFAULT_PLACEHOLDER = '선택'
const EMPTY_TEXT = '검색 결과가 없습니다'

export function TreeCombo({ tree, value, onChange, placeholder = DEFAULT_PLACEHOLDER, leafOnly = false, defaultExpandDepth = 1, disabled = false, id }) {
  const {
    open, keyword, rows, effectiveExpanded, highlightIndex, selectedNode, displayText, listRef,
    toggle, select, clear, setHighlightIndex, handleOpenChange, handleKeywordChange, handleKeyDown,
  } = useTreeCombo({ tree, value, onChange, leafOnly, defaultExpandDepth })

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger
        disabled={disabled}
        render={<Button id={id} type="button" variant="outline" data-testid="tree-combo" className="w-full justify-between font-normal" aria-haspopup="tree" aria-expanded={open} />}
      >
        <span className={cn('truncate', !displayText && 'text-muted-foreground')}>{displayText || placeholder}</span>
        <span className="flex items-center gap-1">
          {selectedNode && !disabled && (
            <span role="button" aria-label="선택 해제" tabIndex={-1} className="rounded p-0.5 opacity-60 hover:opacity-100" onClick={(e) => { e.stopPropagation(); clear() }}>
              <X className="size-3.5" />
            </span>
          )}
          <ChevronDown className="size-4 text-muted-foreground" />
        </span>
      </PopoverTrigger>

      <PopoverContent align="start" className="w-80 p-2" onKeyDown={handleKeyDown}>
        <Input autoFocus value={keyword} onChange={(e) => handleKeywordChange(e.target.value)} placeholder="검색" aria-label="트리 검색" />
        <div ref={listRef} role="tree" className="max-h-72 overflow-y-auto" data-testid="tree-list">
          {rows.length === 0 && <p className="p-2 text-sm text-muted-foreground">{EMPTY_TEXT}</p>}
          {rows.map((row, index) => (
            <TreeNodeRow
              key={row.node.id}
              node={row.node}
              depth={row.depth}
              hasChildren={row.hasChildren}
              expanded={effectiveExpanded.has(row.node.id)}
              selected={row.node.id === value}
              highlighted={index === highlightIndex}
              selectable={isSelectable(row, leafOnly)}
              onToggle={toggle}
              onSelect={select}
              onHover={() => setHighlightIndex(index)}
            />
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}
