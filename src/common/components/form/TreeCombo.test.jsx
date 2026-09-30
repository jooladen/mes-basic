// Design Ref: §8.3 #3, #8 — 펼침/접힘 · 검색 시 경로만 · 선택 → 경로 표시 · 키보드 ↓↓ Enter
import { describe, it, expect, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TreeCombo } from './TreeCombo'

const TREE = [
  { id: 'F1', label: '1공장', type: 'factory', children: [
    { id: 'F1-L1', label: '1라인', type: 'line', children: [
      { id: 'F1-L1-E01', label: '프레스#1', type: 'equipment' },
      { id: 'F1-L1-E02', label: '용접#1', type: 'equipment' },
    ]},
    { id: 'F1-L2', label: '2라인', type: 'line', children: [
      { id: 'F1-L2-E01', label: '프레스#2', type: 'equipment' },
    ]},
  ]},
  { id: 'F2', label: '2공장', type: 'factory', children: [
    { id: 'F2-L1', label: '1라인', type: 'line', children: [{ id: 'F2-L1-E01', label: '사출#1', type: 'equipment' }] },
  ]},
]

function itemNames() {
  return screen.getAllByRole('treeitem').map((el) => el.dataset.nodeId)
}

describe('TreeCombo', () => {
  it('선택값은 경로 "1공장 › 1라인 › 프레스#1" 로 표시, 없으면 placeholder', () => {
    const { rerender } = render(<TreeCombo tree={TREE} value={null} onChange={() => {}} placeholder="전체" />)
    expect(screen.getByTestId('tree-combo')).toHaveTextContent('전체')
    rerender(<TreeCombo tree={TREE} value="F1-L1-E01" onChange={() => {}} placeholder="전체" />)
    expect(screen.getByTestId('tree-combo')).toHaveTextContent('1공장 › 1라인 › 프레스#1')
  })

  it('열면 depth 1 까지 펼쳐져 있고, 라인을 클릭하면 설비가 펼쳐진다', async () => {
    const user = userEvent.setup()
    render(<TreeCombo tree={TREE} value={null} onChange={() => {}} leafOnly />)
    await user.click(screen.getByTestId('tree-combo'))
    expect(itemNames()).toEqual(['F1', 'F1-L1', 'F1-L2', 'F2', 'F2-L1'])
    await user.click(screen.getByText('1라인', { selector: '[data-node-id="F1-L1"] span' }))
    expect(itemNames()).toContain('F1-L1-E01')
  })

  it('#3 검색 "프레스" → 매칭 노드 + 조상만, 전부 펼침', async () => {
    const user = userEvent.setup()
    render(<TreeCombo tree={TREE} value={null} onChange={() => {}} />)
    await user.click(screen.getByTestId('tree-combo'))
    await user.type(screen.getByLabelText('트리 검색'), '프레스')
    expect(itemNames()).toEqual(['F1', 'F1-L1', 'F1-L1-E01', 'F1-L2', 'F1-L2-E01'])
  })

  it('노드 클릭 → onChange(id, node) 후 닫힘', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<TreeCombo tree={TREE} value={null} onChange={onChange} />)
    await user.click(screen.getByTestId('tree-combo'))
    await user.click(within(screen.getByRole('tree')).getByText('2라인'))
    expect(onChange).toHaveBeenCalledWith('F1-L2', expect.objectContaining({ id: 'F1-L2' }))
    expect(screen.queryByRole('tree')).not.toBeInTheDocument()
  })

  it('leafOnly 면 라인 클릭은 선택이 아니라 펼침', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<TreeCombo tree={TREE} value={null} onChange={onChange} leafOnly />)
    await user.click(screen.getByTestId('tree-combo'))
    await user.click(within(screen.getByRole('tree')).getByText('2라인'))
    expect(onChange).not.toHaveBeenCalled()
    expect(itemNames()).toContain('F1-L2-E01')
  })

  it('#8 키보드: 열면 첫 행 하이라이트, ↓↓ Enter 로 3번째 행 선택 (Design §8.3 #8)', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<TreeCombo tree={TREE} value={null} onChange={onChange} />)
    await user.click(screen.getByTestId('tree-combo'))
    expect(screen.getByRole('treeitem', { name: /1공장/ })).toHaveAttribute('data-highlighted', 'true')
    await user.keyboard('{ArrowDown}{ArrowDown}{Enter}')
    expect(onChange).toHaveBeenCalledWith('F1-L2', expect.anything())
  })

  it('값이 있으면 열 때 그 행이 하이라이트', async () => {
    const user = userEvent.setup()
    render(<TreeCombo tree={TREE} value="F1-L2" onChange={() => {}} />)
    await user.click(screen.getByTestId('tree-combo'))
    expect(screen.getByRole('treeitem', { name: /2라인/ })).toHaveAttribute('data-highlighted', 'true')
  })

  it('← → 로 접기/펼치기, Esc 로 닫기', async () => {
    const user = userEvent.setup()
    render(<TreeCombo tree={TREE} value={null} onChange={() => {}} />)
    await user.click(screen.getByTestId('tree-combo'))
    await user.keyboard('{ArrowLeft}') // 1공장 접기 (2공장은 기본 펼침 유지)
    expect(itemNames()).toEqual(['F1', 'F2', 'F2-L1'])
    await user.keyboard('{ArrowRight}') // 다시 펼치기
    expect(itemNames()).toEqual(['F1', 'F1-L1', 'F1-L2', 'F2', 'F2-L1'])
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('tree')).not.toBeInTheDocument()
  })

  it('X 로 선택 해제 → onChange(null, null)', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<TreeCombo tree={TREE} value="F1-L1-E01" onChange={onChange} />)
    await user.click(screen.getByLabelText('선택 해제'))
    expect(onChange).toHaveBeenCalledWith(null, null)
  })
})
