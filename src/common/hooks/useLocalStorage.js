// Design Ref: §6.1 — localStorage 접근 실패(프라이빗 창·용량·깨진 JSON)는 기본값으로 흡수. 에러를 밖으로 내보내지 않는다.
// Design Ref: §5.3 — useSyncExternalStore 기반: 같은 키를 쓰는 컴포넌트끼리 자동 동기화, 다른 탭 변경(storage 이벤트)도 반영.
import { useCallback, useSyncExternalStore } from 'react'

const listeners = new Map() // key -> Set<() => void>
const snapshotCache = new Map() // key -> { raw, value }  (getSnapshot 이 매번 새 객체를 만들면 무한 렌더)

const READ_FAILED = Symbol('read-failed') // "값 없음(null)" 과 "접근 불가" 를 구분

function readRaw(key) {
  try {
    return window.localStorage.getItem(key)
  } catch {
    return READ_FAILED
  }
}

function writeRaw(key, raw) {
  try {
    if (raw === null) window.localStorage.removeItem(key)
    else window.localStorage.setItem(key, raw)
  } catch {
    // 저장 실패는 조용히 무시 — 메모리 상태(snapshotCache)로만 동작
  }
}

function parse(key, raw, fallback) {
  if (raw === null) return fallback
  try {
    return JSON.parse(raw)
  } catch {
    writeRaw(key, null) // 깨진 값은 삭제
    return fallback
  }
}

function getSnapshot(key, fallback) {
  const raw = readRaw(key)
  const cached = snapshotCache.get(key)
  if (raw === READ_FAILED) return cached ? cached.value : fallback // 접근 불가면 메모리 상태로 동작
  if (cached && cached.raw === raw) return cached.value
  const value = parse(key, raw, fallback)
  snapshotCache.set(key, { raw, value })
  return value
}

function emit(key) {
  listeners.get(key)?.forEach((fn) => fn())
}

function subscribe(key, callback) {
  if (!listeners.has(key)) listeners.set(key, new Set())
  listeners.get(key).add(callback)
  const onStorage = (event) => {
    if (event.key === key || event.key === null) callback()
  }
  window.addEventListener('storage', onStorage)
  return () => {
    listeners.get(key)?.delete(callback)
    window.removeEventListener('storage', onStorage)
  }
}

/** [value, setValue] — setValue 는 값 또는 updater 함수(prev => next) */
export function useLocalStorage(key, fallback) {
  const value = useSyncExternalStore(
    useCallback((cb) => subscribe(key, cb), [key]),
    () => getSnapshot(key, fallback),
    () => fallback,
  )

  const setValue = useCallback(
    (next) => {
      const current = getSnapshot(key, fallback)
      const resolved = typeof next === 'function' ? next(current) : next
      const raw = JSON.stringify(resolved)
      writeRaw(key, raw)
      snapshotCache.set(key, { raw, value: resolved })
      emit(key)
    },
    [key, fallback],
  )

  return [value, setValue]
}
