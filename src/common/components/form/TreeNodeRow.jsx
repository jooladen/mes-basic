// Design Ref: §5.3 TreeNodeRow — 트리 1줄. 펼침 아이콘 · 들여쓰기 · 선택/하이라이트 표시. 상태는 갖지 않는다(TreeCombo 소유).
import { ChevronDown, ChevronRight, Check } from 'lucide-react'
import { cn } from '@/common/lib/utils'

const INDENT_PX = 14

export function TreeNodeRow({ node, depth, hasChildren, expanded, selected, highlighted, selectable, onToggle, onSelect, onHover }) {
  const handleClick = () => {
    if (selectable) onSelect(node)
    else if (hasChildren) onToggle(node.id)
  }
  return (
    <div
      role="treeitem"
      aria-expanded={hasChildren ? expanded : undefined}
      aria-selected={selected}
      aria-level={depth + 1}
      data-node-id={node.id}
      data-highlighted={highlighted || undefined}
      className={cn(
        'flex h-8 cursor-pointer items-center gap-1 rounded-md pr-2 text-sm select-none',
        'hover:bg-accent hover:text-accent-foreground',
        highlighted && 'bg-accent text-accent-foreground',
        selected && 'font-semibold',
        !selectable && !hasChildren && 'cursor-default opacity-60',
      )}
      style={{ paddingLeft: depth * INDENT_PX + 4 }}
      onClick={handleClick}
      onMouseEnter={onHover}
    >
      <button
        type="button"
        tabIndex={-1}
        aria-label={expanded ? '접기' : '펼치기'}
        className={cn('flex size-5 shrink-0 items-center justify-center rounded', !hasChildren && 'invisible')}
        onClick={(e) => {
          e.stopPropagation()
          onToggle(node.id)
        }}
      >
        {expanded ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
      </button>
      <span className="flex-1 truncate">{node.label}</span>
      {selected && <Check className="size-4 shrink-0" />}
    </div>
  )
}
