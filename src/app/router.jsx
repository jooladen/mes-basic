// Design Ref: §2.2 메뉴 흐름 — menu.config → <Route> 자동 생성. 라우트를 손으로 추가하지 않는다.
// Plan SC (FR-03): 서브메뉴 추가 = menu.config 1줄 + 페이지 1개 → 여기는 무변경
import { Suspense, lazy } from 'react'
import { Navigate, createBrowserRouter } from 'react-router'
import { ErrorBoundary } from '@/app/ErrorBoundary'
import { NotFound } from '@/app/NotFound'
import { PageFallback } from '@/app/PageFallback'
import { AppShell } from '@/common/layout/AppShell'
import { DEFAULT_PATH, flattenMenu } from '@/config/menu.config'

function toRoute(item) {
  const Page = lazy(item.page)
  return {
    path: item.path,
    element: (
      <ErrorBoundary>
        <Suspense fallback={<PageFallback />}>
          <Page />
        </Suspense>
      </ErrorBoundary>
    ),
  }
}

export function createAppRouter(menu) {
  return createBrowserRouter([
    {
      path: '/',
      element: <AppShell />,
      children: [
        { index: true, element: <Navigate to={DEFAULT_PATH} replace /> },
        ...flattenMenu(menu).map(toRoute),
        { path: '*', element: <NotFound /> },
      ],
    },
  ])
}
