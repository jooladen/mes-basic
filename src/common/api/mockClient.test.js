// Design Ref: §8.2 #9
import { describe, it, expect } from 'vitest'
import { mockGet } from './mockClient'

describe('mockClient.mockGet', () => {
  it('#9 { data } 봉투이고 res.data 는 원본과 다른 참조(깊은 복사)', async () => {
    const rows = [{ id: 1, nested: { x: 1 } }]
    const res = await mockGet(rows)
    expect(res).toHaveProperty('data')
    expect(res.data).toEqual(rows)
    expect(res.data).not.toBe(rows)
    expect(res.data[0].nested).not.toBe(rows[0].nested)
  })

  it('delayMs 지정 시에도 같은 봉투를 돌려준다', async () => {
    const res = await mockGet([1, 2], 5)
    expect(res.data).toEqual([1, 2])
  })
})
