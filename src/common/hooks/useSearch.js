// Design Ref: §2.2 조회 흐름 — 검색조건 → service → rows. 3개 페이지가 같은 패턴이라 훅으로 추출.
// Design Ref: §6.1 — repository/service 실패는 throw 그대로 올라오고, 페이지는 error 상태를 표시한다 (unhandled rejection 없음).
// searchFn: (criteria) => Promise<rows>. 마운트 시 initialCriteria 로 1회 조회.
import { useCallback, useEffect, useRef, useState } from 'react'

export function useSearch(searchFn, initialCriteria) {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const requestId = useRef(0) // 늦게 도착한 이전 응답이 최신 결과를 덮지 않게

  const search = useCallback(
    (criteria) => {
      const id = ++requestId.current
      setLoading(true)
      setError(null)
      return searchFn(criteria)
        .then((result) => {
          if (id === requestId.current) setRows(result)
        })
        .catch((err) => {
          if (id === requestId.current) setError(err)
        })
        .finally(() => {
          if (id === requestId.current) setLoading(false)
        })
    },
    [searchFn],
  )

  useEffect(() => {
    let alive = true
    const id = ++requestId.current
    searchFn(initialCriteria)
      .then((result) => {
        if (alive && id === requestId.current) setRows(result)
      })
      .catch((err) => {
        if (alive && id === requestId.current) setError(err)
      })
    return () => {
      alive = false // 언마운트/재실행 시 이전 응답 무효화
    }
  }, [searchFn, initialCriteria])

  return { rows, loading, error, search }
}
