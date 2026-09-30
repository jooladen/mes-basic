// Design Ref: §5.3 TreeCombo — 펼침 상태를 반영한 "보이는 행" 계산 (순수 함수, 키보드 이동의 기준 목록)
import { flatten } from '@/common/utils/tree'

/** expanded(Set<id>) 기준으로 화면에 보이는 행만 깊이 순서로. 각 행: { node, depth, hasChildren } */
export function visibleRows(tree, expanded, depth = 0, out = []) {
  for (const node of tree) {
    const hasChildren = Boolean(node.children?.length)
    out.push({ node, depth, hasChildren })
    if (hasChildren && expanded.has(node.id)) visibleRows(node.children, expanded, depth + 1, out)
  }
  return out
}

/** depth < maxDepth 인 노드 id 집합 (초기 펼침용). maxDepth=1 이면 루트만 펼침 */
export function idsUpToDepth(tree, maxDepth) {
  return new Set(
    flatten(tree)
      .filter((e) => e.depth < maxDepth && e.node.children?.length)
      .map((e) => e.node.id),
  )
}

/** 자식이 있는 모든 노드 id (검색 시 전부 펼침용) */
export function allBranchIds(tree) {
  return new Set(
    flatten(tree)
      .filter((e) => e.node.children?.length)
      .map((e) => e.node.id),
  )
}
