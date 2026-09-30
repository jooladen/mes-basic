// Design Ref: §5.4 공통 셸 — 메뉴 정의 자체의 무결성 (key/screenId/path 규칙, 유일성)
import { describe, it, expect } from 'vitest'
import { MENU, DEFAULT_PATH, flattenMenu, findMenuByPath } from './menu.config'

describe('menu.config', () => {
  const items = flattenMenu()

  it('대메뉴 3개(md, pp, qm), 각 서브메뉴 1개 이상', () => {
    expect(MENU.map((g) => g.key)).toEqual(['md', 'pp', 'qm'])
    MENU.forEach((g) => expect(g.children.length).toBeGreaterThan(0))
  })

  it('key "{모듈}.{업무}", screenId "{모듈}_{업무}_{순번4}", path "/{모듈}/..." 규칙', () => {
    items.forEach((item) => {
      expect(item.key).toMatch(/^[a-z]{2}\.[a-z-]+$/)
      expect(item.key.startsWith(item.group.key + '.')).toBe(true)
      expect(item.screenId).toMatch(/^[A-Z]{2}_[A-Z]+_\d{4}$/)
      expect(item.screenId.startsWith(item.group.key.toUpperCase() + '_')).toBe(true)
      expect(item.path.startsWith('/' + item.group.key + '/')).toBe(true)
      expect(typeof item.page).toBe('function')
    })
  })

  it('key / screenId / path 유일', () => {
    for (const field of ['key', 'screenId', 'path']) {
      expect(new Set(items.map((i) => i[field])).size, field).toBe(items.length)
    }
  })

  it('DEFAULT_PATH 는 첫 서브메뉴, findMenuByPath 동작', () => {
    expect(DEFAULT_PATH).toBe('/md/item')
    expect(findMenuByPath('/pp/work-order').screenId).toBe('PP_WO_0010')
    expect(findMenuByPath('/nope')).toBeNull()
  })
})
