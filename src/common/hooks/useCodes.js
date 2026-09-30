// Design Ref: §9.3 — 페이지는 repository 를 직접 부르지 않는다. 공통코드는 이 훅으로만 받는다.
import { useEffect, useState } from 'react'
import { getCodes } from '@/common/repositories/codeRepository'

const EMPTY = []

export function useCodes(groupId) {
  const [codes, setCodes] = useState(EMPTY)
  useEffect(() => {
    let alive = true
    getCodes(groupId)
      .then((rows) => {
        if (alive) setCodes(rows)
      })
      .catch(() => {
        if (alive) setCodes(EMPTY) // 참조 데이터 실패 → 콤보가 비어 있는 상태로 동작 (에러 전파 없음)
      })
    return () => {
      alive = false
    }
  }, [groupId])
  return codes
}
