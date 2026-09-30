import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { DataTable } from './DataTable'

const COLUMNS = [
  { key: 'code', header: '코드' },
  { key: 'qty', header: '수량', align: 'right', render: (r) => r.qty.toLocaleString() },
]

describe('DataTable', () => {
  it('건수 + 행 렌더, render 컬럼 적용', () => {
    render(<DataTable columns={COLUMNS} rows={[{ code: 'A', qty: 1200 }, { code: 'B', qty: 5 }]} rowKey="code" />)
    expect(screen.getByTestId('row-count')).toHaveTextContent('총 2건')
    expect(screen.getAllByTestId('data-row')).toHaveLength(2)
    expect(screen.getByText('1,200')).toBeInTheDocument()
  })

  it('0건이면 안내 문구', () => {
    render(<DataTable columns={COLUMNS} rows={[]} rowKey="code" />)
    expect(screen.getByTestId('row-count')).toHaveTextContent('총 0건')
    expect(screen.getByText('데이터가 없습니다')).toBeInTheDocument()
  })

  it('error 가 있으면 alert 로 표시 (Design §6.1)', () => {
    render(<DataTable columns={COLUMNS} rows={[]} rowKey="code" error={new Error('repository down')} />)
    expect(screen.getByRole('alert')).toHaveTextContent('조회에 실패했습니다')
    expect(screen.getByRole('alert')).toHaveTextContent('repository down')
  })
})
