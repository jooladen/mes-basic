// Design Ref: §8.2 #7 — localStorage 가 throw 해도 기본값, 에러 전파 없음. 깨진 JSON 은 기본값 + 삭제.
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useLocalStorage } from './useLocalStorage'

const KEY = 'mes.test'

describe('useLocalStorage', () => {
  beforeEach(() => window.localStorage.clear())
  afterEach(() => vi.restoreAllMocks())

  it('저장된 값이 없으면 기본값', () => {
    const { result } = renderHook(() => useLocalStorage(KEY, false))
    expect(result.current[0]).toBe(false)
  })

  it('setValue 로 저장하면 localStorage 에 JSON 으로 남고 리렌더', () => {
    const { result } = renderHook(() => useLocalStorage(KEY, false))
    act(() => result.current[1](true))
    expect(result.current[0]).toBe(true)
    expect(window.localStorage.getItem(KEY)).toBe('true')
    act(() => result.current[1]((prev) => !prev))
    expect(result.current[0]).toBe(false)
  })

  it('같은 키를 쓰는 두 훅은 동기화된다', () => {
    const a = renderHook(() => useLocalStorage(KEY, 'dark'))
    const b = renderHook(() => useLocalStorage(KEY, 'dark'))
    act(() => a.result.current[1]('light'))
    expect(b.result.current[0]).toBe('light')
  })

  it('#7 getItem 이 throw 하면 기본값, 에러 전파 없음', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    // 모듈 캐시는 키 단위라 다른 테스트와 겹치지 않게 고유 키 사용
    const { result } = renderHook(() => useLocalStorage(`${KEY}.blocked`, 'fallback'))
    expect(result.current[0]).toBe('fallback')
    expect(() => act(() => result.current[1]('x'))).not.toThrow()
    expect(result.current[0]).toBe('x') // 메모리 상태로는 동작
  })

  it('깨진 JSON 은 기본값 + 해당 키 삭제', () => {
    const key = `${KEY}.broken`
    window.localStorage.setItem(key, '{not json')
    const { result } = renderHook(() => useLocalStorage(key, 'fallback'))
    expect(result.current[0]).toBe('fallback')
    expect(window.localStorage.getItem(key)).toBeNull()
  })
})
