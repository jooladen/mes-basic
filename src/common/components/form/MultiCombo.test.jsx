// Design Ref: §8.3 #2 — 다중 선택 → value 배열 onChange, 칩 표시, 검색 필터
import { describe, it, expect, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MultiCombo } from './MultiCombo'

const OPTIONS = [
  { value: 'RAW', label: '원자재' },
  { value: 'SEMI', label: '반제품' },
  { value: 'FIN', label: '완제품' },
]

describe('MultiCombo', () => {
  it('선택값이 칩으로 표시된다', () => {
    render(<MultiCombo options={OPTIONS} value={['RAW', 'FIN']} onChange={() => {}} />)
    const chips = within(screen.getByTestId('multi-combo'))
    expect(chips.getByText('원자재')).toBeInTheDocument()
    expect(chips.getByText('완제품')).toBeInTheDocument()
    expect(chips.queryByText('반제품')).not.toBeInTheDocument()
  })

  it('옵션을 고르면 value 문자열 배열로 onChange', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<MultiCombo options={OPTIONS} value={[]} onChange={onChange} placeholder="전체" />)
    await user.click(screen.getByPlaceholderText('전체'))
    await user.click(await screen.findByRole('option', { name: '반제품' }))
    expect(onChange).toHaveBeenLastCalledWith(['SEMI'])
  })

  it('입력하면 라벨로 필터된다', async () => {
    const user = userEvent.setup()
    render(<MultiCombo options={OPTIONS} value={[]} onChange={() => {}} placeholder="전체" />)
    await user.type(screen.getByPlaceholderText('전체'), '완')
    expect(await screen.findByRole('option', { name: '완제품' })).toBeInTheDocument()
    expect(screen.queryByRole('option', { name: '원자재' })).not.toBeInTheDocument()
  })

  it('value 에 없는 코드는 무시한다 (정의서 밖 값 방어)', () => {
    render(<MultiCombo options={OPTIONS} value={['NOPE']} onChange={() => {}} placeholder="전체" />)
    expect(screen.getByPlaceholderText('전체')).toBeInTheDocument()
  })
})
