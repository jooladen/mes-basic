// Design Ref: §11.1 app/ — 조립 계층. Provider + Router 만 안다.
import { RouterProvider } from 'react-router'
import { createAppRouter } from '@/app/router'
import { TooltipProvider } from '@/common/components/ui/tooltip'
import { useTheme } from '@/common/hooks/useTheme'
import { MENU } from '@/config/menu.config'

const router = createAppRouter(MENU)

export function App() {
  useTheme() // <html class="dark"> 를 저장된 테마와 동기화 (Header 의 토글과 같은 저장소를 본다)
  return (
    <TooltipProvider>
      <RouterProvider router={router} />
    </TooltipProvider>
  )
}
