// Design Ref: §9.1 Domain — 트리(공장›라인›설비) 순수 연산. React·데이터 출처를 모른다.
// 노드 형태는 Design §3.1 TreeNode 정의서: { id, label, type?, children? }

/** 트리를 깊이우선으로 평탄화. 각 원소는 { node, depth, parentId } */
export function flatten(tree, depth = 0, parentId = null, out = []) {
  for (const node of tree) {
    out.push({ node, depth, parentId })
    if (node.children?.length) flatten(node.children, depth + 1, node.id, out)
  }
  return out
}

/** id 로 노드 찾기. 없으면 null */
export function findNode(tree, id) {
  if (id == null) return null
  for (const node of tree) {
    if (node.id === id) return node
    const found = node.children?.length ? findNode(node.children, id) : null
    if (found) return found
  }
  return null
}

/** 루트부터 해당 노드까지의 label 배열. 없으면 [] */
export function getPath(tree, id, trail = []) {
  for (const node of tree) {
    const next = [...trail, node.label]
    if (node.id === id) return next
    if (node.children?.length) {
      const found = getPath(node.children, id, next)
      if (found.length) return found
    }
  }
  return []
}

/** 자기 자신 + 모든 후손 id. 없는 id 면 [] */
export function collectDescendantIds(tree, id) {
  const root = findNode(tree, id)
  if (!root) return []
  return flatten([root]).map((entry) => entry.node.id)
}

/**
 * 검색어에 label 이 includes 되는 노드와 그 조상만 남긴 새 트리.
 * 빈 검색어면 원본 그대로. 원본은 변형하지 않는다.
 */
export function filterTree(tree, keyword) {
  const term = (keyword ?? '').trim().toLowerCase()
  if (!term) return tree
  return tree.reduce((kept, node) => {
    const children = node.children?.length ? filterTree(node.children, term) : []
    const selfMatch = node.label.toLowerCase().includes(term)
    if (!selfMatch && children.length === 0) return kept
    kept.push({ ...node, children: selfMatch && children.length === 0 ? node.children : children })
    return kept
  }, [])
}
