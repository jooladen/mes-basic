// Design Ref: §6.1 — 조회 실패 시 error 상태, 에러 전파(unhandled rejection) 없음. 늦은 응답은 무시.
import { describe, it, expect, vi } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { useSearch } from './useSearch'

const CRITERIA = Object.freeze({})

describe('useSearch', () => {
  it('마운트 시 initialCriteria 로 1회 조회해 rows 를 채운다', async () => {
    const searchFn = vi.fn().mockResolvedValue([{ id: 1 }])
    const { result } = renderHook(() => useSearch(searchFn, CRITERIA))
    await waitFor(() => expect(result.current.rows).toEqual([{ id: 1 }]))
    expect(searchFn).toHaveBeenCalledWith(CRITERIA)
    expect(result.current.error).toBeNull()
  })

  it('search() 실패 → error 상태, loading false, 호출부에 reject 가 전파되지 않는다', async () => {
    const boom = new Error('repository down')
    const searchFn = vi.fn().mockResolvedValueOnce([]).mockRejectedValueOnce(boom)
    const { result } = renderHook(() => useSearch(searchFn, CRITERIA))
    await waitFor(() => expect(searchFn).toHaveBeenCalledTimes(1))
    await act(() => result.current.search({ keyword: 'x' })) // reject 면 act 가 throw 한다
    expect(result.current.error).toBe(boom)
    expect(result.current.loading).toBe(false)
  })

  it('다시 조회하면 error 가 지워진다', async () => {
    const searchFn = vi.fn().mockRejectedValueOnce(new Error('x')).mockResolvedValue([{ id: 2 }])
    const { result } = renderHook(() => useSearch(searchFn, CRITERIA))
    await waitFor(() => expect(result.current.error).not.toBeNull())
    await act(() => result.current.search({}))
    expect(result.current.error).toBeNull()
    expect(result.current.rows).toEqual([{ id: 2 }])
  })

  it('늦게 도착한 이전 응답은 최신 결과를 덮지 않는다', async () => {
    let resolveSlow
    const slow = new Promise((resolve) => (resolveSlow = resolve))
    const searchFn = vi.fn().mockResolvedValueOnce([]).mockReturnValueOnce(slow).mockResolvedValueOnce([{ id: 'fast' }])
    const { result } = renderHook(() => useSearch(searchFn, CRITERIA))
    await waitFor(() => expect(searchFn).toHaveBeenCalledTimes(1))
    let slowPromise
    act(() => {
      slowPromise = result.current.search({ a: 1 })
    })
    await act(() => result.current.search({ a: 2 }))
    expect(result.current.rows).toEqual([{ id: 'fast' }])
    await act(async () => {
      resolveSlow([{ id: 'slow' }])
      await slowPromise
    })
    expect(result.current.rows).toEqual([{ id: 'fast' }])
  })
})
