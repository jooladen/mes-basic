// Design Ref: §5.3 TreeCombo — 상태·키보드 로직. 컴포넌트(TreeCombo.jsx)는 JSX 만 갖는다 (Plan §4.2 함수 50줄).
// Plan FR-05: 펼침/접힘 · 단일 선택 · 검색 시 매칭 경로만 · 키보드 ↑↓ ← → Enter Esc
import { useEffect, useMemo, useRef, useState } from 'react'
import { filterTree, findNode, getPath } from '@/common/utils/tree'
import { allBranchIds, idsUpToDepth, visibleRows } from '@/common/utils/treeView'

const PATH_SEPARATOR = ' › '
const FIRST_ROW = 0

export function isSelectable(row, leafOnly) {
  return !leafOnly || !row.hasChildren
}

/** 펼침 상태. 트리가 늦게 오면 초기 펼침 재계산 (React "렌더 중 상태 조정" 패턴) */
function useTreeExpansion(tree, defaultExpandDepth) {
  const [expanded, setExpanded] = useState(() => idsUpToDepth(tree, defaultExpandDepth))
  const [prevTree, setPrevTree] = useState(tree)
  if (prevTree !== tree) {
    setPrevTree(tree)
    setExpanded(idsUpToDepth(tree, defaultExpandDepth))
  }
  const toggle = (nodeId) =>
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(nodeId)) next.delete(nodeId)
      else next.add(nodeId)
      return next
    })
  return { expanded, toggle }
}

/** 하이라이트 행 인덱스 + 순환 이동 + 스크롤 추적 */
function useTreeHighlight(rowCount) {
  const [highlightIndex, setHighlightIndex] = useState(-1)
  const listRef = useRef(null)
  const moveHighlight = (delta) => {
    if (!rowCount) return
    setHighlightIndex((prev) => (prev < 0 ? (delta > 0 ? 0 : rowCount - 1) : (prev + delta + rowCount) % rowCount))
  }
  useEffect(() => {
    listRef.current?.querySelector('[data-highlighted]')?.scrollIntoView?.({ block: 'nearest' })
  }, [highlightIndex])
  return { highlightIndex, setHighlightIndex, moveHighlight, listRef }
}

/** 키 1개 → 동작 1개. 순수 함수라 DOM 없이 테스트 가능 */
export function treeKeyAction(key, { row, expanded, leafOnly, moveHighlight, toggle, select, close }) {
  const isBranch = Boolean(row?.hasChildren)
  const isOpen = isBranch && expanded.has(row.node.id)
  switch (key) {
    case 'ArrowDown':
      moveHighlight(1)
      return true
    case 'ArrowUp':
      moveHighlight(-1)
      return true
    case 'ArrowRight':
      if (isBranch && !isOpen) toggle(row.node.id)
      return isBranch && !isOpen
    case 'ArrowLeft':
      if (isOpen) toggle(row.node.id)
      return isOpen
    case 'Enter':
      if (!row) return false
      if (isSelectable(row, leafOnly)) select(row.node)
      else toggle(row.node.id)
      return true
    case 'Escape':
      close()
      return true
    default:
      return false
  }
}

export function useTreeCombo({ tree, value, onChange, leafOnly, defaultExpandDepth }) {
  const [open, setOpen] = useState(false)
  const [keyword, setKeyword] = useState('')
  const { expanded, toggle } = useTreeExpansion(tree, defaultExpandDepth)

  const searching = keyword.trim().length > 0
  const shownTree = useMemo(() => filterTree(tree, keyword), [tree, keyword])
  const effectiveExpanded = useMemo(() => (searching ? allBranchIds(shownTree) : expanded), [searching, shownTree, expanded])
  const rows = useMemo(() => visibleRows(shownTree, effectiveExpanded), [shownTree, effectiveExpanded])
  const { highlightIndex, setHighlightIndex, moveHighlight, listRef } = useTreeHighlight(rows.length)

  const selectedNode = findNode(tree, value)
  const displayText = selectedNode ? getPath(tree, value).join(PATH_SEPARATOR) : ''

  const close = () => setOpen(false)
  const select = (node) => {
    onChange(node.id, node)
    close()
  }
  const clear = () => onChange(null, null)

  const handleOpenChange = (next) => {
    setOpen(next)
    if (!next) return
    setKeyword('')
    const selectedIndex = rows.findIndex((r) => r.node.id === value)
    setHighlightIndex(selectedIndex >= 0 ? selectedIndex : FIRST_ROW) // Design §8.3 #8: 열면 첫 행부터 ↓↓ Enter
  }

  const handleKeywordChange = (text) => {
    setKeyword(text)
    setHighlightIndex(FIRST_ROW)
  }

  const handleKeyDown = (event) => {
    const handled = treeKeyAction(event.key, {
      row: rows[highlightIndex], expanded: effectiveExpanded, leafOnly, moveHighlight, toggle, select, close,
    })
    if (handled && event.key !== 'Escape') event.preventDefault()
  }

  return {
    open, keyword, rows, effectiveExpanded, highlightIndex, selectedNode, displayText, listRef,
    toggle, select, clear, setHighlightIndex, handleOpenChange, handleKeywordChange, handleKeyDown,
  }
}
