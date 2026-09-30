// Design Ref: §9.3 — 설비 트리(공장›라인›설비)를 페이지에 공급. TreeCombo 입력 + 표의 설비 경로 표시에 쓴다.
import { useCallback, useEffect, useState } from 'react'
import { findAll } from '@/common/repositories/equipmentTreeRepository'
import { getPath } from '@/common/utils/tree'

const EMPTY = []
const PATH_SEPARATOR = ' › '

export function useEquipmentTree() {
  const [tree, setTree] = useState(EMPTY)
  useEffect(() => {
    let alive = true
    findAll()
      .then((rows) => {
        if (alive) setTree(rows)
      })
      .catch(() => {
        if (alive) setTree(EMPTY) // 참조 데이터 실패 → 트리 비어 있는 상태로 동작 (에러 전파 없음)
      })
    return () => {
      alive = false
    }
  }, [])

  /** 설비 id → "1공장 › 1라인 › 프레스#1" */
  const pathOf = useCallback((equipmentId) => getPath(tree, equipmentId).join(PATH_SEPARATOR), [tree])

  return { tree, pathOf }
}
