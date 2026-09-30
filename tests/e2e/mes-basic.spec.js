// Design Ref: §8.3 L2 #1~#8, §8.4 L3 #1 #2 #4 — Do 단계에서 코드화, Check 단계는 실행만.
// L3 #3(확장 시연)은 코드 변경이 필요해 수동 절차 — Design §11.1.1 에 기록.
import { expect, test } from '@playwright/test'

const SCREENS = [
  { path: '/md/item', screenId: 'MD_ITEM_0010', group: '기준정보', label: '품목관리', minRows: 12 },
  { path: '/pp/work-order', screenId: 'PP_WO_0010', group: '생산', label: '작업지시', minRows: 10 },
  { path: '/qm/inspection', screenId: 'QM_INSP_0010', group: '품질', label: '검사결과', minRows: 10 },
]

const dataRows = (page) => page.getByTestId('data-row')
const submit = (page) => page.getByRole('button', { name: '조회' }).click()

async function pickMulti(page, comboName, ...labels) {
  await page.getByRole('combobox', { name: comboName }).click()
  for (const label of labels) await page.getByRole('option', { name: label }).click()
  await page.keyboard.press('Escape')
}

async function pickTree(page, nodeLabel, { search } = {}) {
  await page.getByTestId('tree-combo').click()
  if (search) await page.getByRole('textbox', { name: '트리 검색' }).fill(search)
  await page.getByRole('tree').getByText(nodeLabel, { exact: true }).first().click()
}

test.describe('L2 UI Action', () => {
  for (const screen of SCREENS) {
    test(`#1 ${screen.label} 로드 — 체크리스트 요소 + 데이터 렌더`, async ({ page }) => {
      await page.goto(screen.path)
      await expect(page.getByTestId('screen-id')).toHaveText(screen.screenId)
      await expect(page.getByRole('navigation', { name: '현재 위치' })).toContainText(`${screen.group}›${screen.label}`)
      await expect(page.getByRole('combobox')).toBeVisible()
      await expect(page.getByTestId('tree-combo')).toBeVisible()
      await expect(page.locator('#keyword')).toBeVisible()
      await expect(page.getByRole('button', { name: '초기화' })).toBeVisible()
      await expect(page.getByRole('button', { name: '조회' })).toBeVisible()
      await expect.poll(() => dataRows(page).count()).toBeGreaterThanOrEqual(screen.minRows)
    })
  }

  test('#2 품목관리 — 유형 RAW, FIN 선택 → 조회 → 표의 유형이 원자재/완제품만', async ({ page }) => {
    await page.goto('/md/item')
    await pickMulti(page, '품목유형', '원자재', '완제품')
    await submit(page)
    const types = await dataRows(page).locator('td:nth-child(3)').allInnerTexts()
    expect(types.length).toBeGreaterThan(0)
    types.forEach((t) => expect(['원자재', '완제품']).toContain(t))
  })

  test('#3 품목관리 — TreeCombo 검색 "프레스" → 선택 → 표시값 경로, 표 필터', async ({ page }) => {
    await page.goto('/md/item')
    await pickTree(page, '프레스#1', { search: '프레스' })
    await expect(page.getByTestId('tree-combo')).toContainText('1공장 › 1라인 › 프레스#1')
    await submit(page)
    const paths = await dataRows(page).locator('td:nth-child(5)').allInnerTexts()
    expect(paths.length).toBeGreaterThan(0)
    paths.forEach((p) => expect(p).toBe('1공장 › 1라인 › 프레스#1'))
  })

  test('#4 작업지시 — 상태 RUNNING → 조회 → 건수 감소, 초기화 → 전체 복귀', async ({ page }) => {
    await page.goto('/pp/work-order')
    await expect.poll(() => dataRows(page).count()).toBeGreaterThanOrEqual(10) // 초기 로드 대기
    const all = await dataRows(page).count()
    await pickMulti(page, '상태', '진행')
    await submit(page)
    await expect.poll(() => dataRows(page).count()).toBeLessThan(all)
    const codes = await dataRows(page).locator('[data-code]').evaluateAll((els) => els.map((e) => e.dataset.code))
    codes.forEach((c) => expect(c).toBe('RUNNING'))
    await page.getByRole('button', { name: '초기화' }).click()
    await expect.poll(() => dataRows(page).count()).toBe(all)
  })

  test('#5 검사결과 — 검사항목 DIM+VIS → 조회 → 각 행에 치수 또는 외관 포함', async ({ page }) => {
    await page.goto('/qm/inspection')
    await pickMulti(page, '검사항목', '치수', '외관')
    await submit(page)
    const rows = dataRows(page)
    expect(await rows.count()).toBeGreaterThan(0)
    for (const row of await rows.all()) {
      const items = await row.locator('[data-insp-item]').evaluateAll((els) => els.map((e) => e.dataset.inspItem))
      expect(items.some((c) => ['DIM', 'VIS'].includes(c))).toBe(true)
    }
    await expect(rows.first().locator('[data-code]')).toHaveAttribute('data-code', /PASS|FAIL/)
  })

  test('#6 셸 — 접기 → 새로고침 → 접힘 유지 (localStorage mes.sidebarCollapsed)', async ({ page }) => {
    await page.goto('/md/item')
    await page.getByRole('button', { name: '메뉴 접기' }).click()
    await expect(page.getByTestId('sidebar')).toHaveAttribute('data-collapsed', 'true')
    await page.reload()
    await expect(page.getByTestId('sidebar')).toHaveAttribute('data-collapsed', 'true')
    expect(await page.evaluate(() => localStorage.getItem('mes.sidebarCollapsed'))).toBe('true')
  })

  test('#7 셸 — 테마 토글 → 새로고침 → 라이트 유지, <html> 에 dark 없음', async ({ page }) => {
    await page.goto('/md/item')
    await expect(page.locator('html')).toHaveClass(/dark/)
    await page.getByTestId('theme-toggle').click()
    await expect(page.locator('html')).not.toHaveClass(/dark/)
    await page.reload()
    await expect(page.locator('html')).not.toHaveClass(/dark/)
    expect(await page.evaluate(() => localStorage.getItem('mes.theme'))).toBe('"light"')
  })

  test('#8 키보드 — TreeCombo 열고 ↓↓ Enter → 3번째 노드(1공장 2라인) 선택', async ({ page }) => {
    await page.goto('/md/item')
    await page.getByTestId('tree-combo').click()
    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('Enter')
    await expect(page.getByTestId('tree-combo')).toContainText('1공장 › 2라인')
  })
})

test.describe('L3 E2E', () => {
  test('#1 3화면 순회 — / redirect → 사이드바 이동 → 화면ID 순서 확인', async ({ page }) => {
    await page.goto('/')
    await expect(page).toHaveURL(/\/md\/item$/)
    await expect(page.getByTestId('screen-id')).toHaveText('MD_ITEM_0010')
    await page.getByRole('link', { name: '작업지시' }).click()
    await expect(page.getByTestId('screen-id')).toHaveText('PP_WO_0010')
    await page.getByRole('link', { name: '검사결과' }).click()
    await expect(page.getByTestId('screen-id')).toHaveText('QM_INSP_0010')
    await expect(page.getByTestId('screen-QM_INSP_0010')).toBeVisible()
  })

  test('#2 조건 비저장 — 품목관리 조회 → 작업지시 → 복귀 시 조건 초기화 (1단계 사양)', async ({ page }) => {
    await page.goto('/md/item')
    await page.locator('#keyword').fill('모듈')
    await submit(page)
    await expect.poll(() => dataRows(page).count()).toBe(3)
    await page.getByRole('link', { name: '작업지시' }).click()
    await page.getByRole('link', { name: '품목관리' }).click()
    await expect(page.locator('#keyword')).toHaveValue('')
    await expect.poll(() => dataRows(page).count()).toBe(12)
  })

  test('#4 반응형 375px — 사이드바 숨김, ☰ → Sheet → 메뉴 클릭 → 이동 + 닫힘', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 700 })
    await page.goto('/md/item')
    await expect(page.getByTestId('sidebar')).toBeHidden()
    await page.getByRole('button', { name: '메뉴 열기' }).click()
    await page.getByRole('dialog').getByRole('link', { name: '검사결과' }).click()
    await expect(page).toHaveURL(/\/qm\/inspection$/)
    await expect(page.getByRole('dialog')).toBeHidden()
  })

  test('없는 경로 → NotFound', async ({ page }) => {
    await page.goto('/nope/none')
    await expect(page.getByText('화면을 찾을 수 없습니다')).toBeVisible()
  })
})
