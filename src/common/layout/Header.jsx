// Design Ref: §5.1/§5.3 Header — breadcrumb "대메뉴 › 서브메뉴" + 화면ID 배지 + 테마 토글 + 모바일 ☰
// Plan FR-09: 다크 기본 + 토글
import { Menu, Moon, Sun } from 'lucide-react'
import { useLocation } from 'react-router'
import { Badge } from '@/common/components/ui/badge'
import { Button } from '@/common/components/ui/button'
import { useTheme } from '@/common/hooks/useTheme'
import { findMenuByPath } from '@/config/menu.config'

export function Header({ onOpenMobileMenu }) {
  const { pathname } = useLocation()
  const { isDark, toggleTheme } = useTheme()
  const current = findMenuByPath(pathname)

  return (
    <header className="flex h-14 items-center gap-3 border-b bg-background px-4">
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={onOpenMobileMenu}
        aria-label="메뉴 열기"
      >
        <Menu />
      </Button>

      <div className="flex min-w-0 flex-1 items-center gap-2">
        {current ? (
          <>
            <nav aria-label="현재 위치" className="truncate text-sm">
              <span className="text-muted-foreground">{current.group.label}</span>
              <span className="mx-1 text-muted-foreground">›</span>
              <span className="font-semibold">{current.label}</span>
            </nav>
            <Badge variant="outline" data-testid="screen-id">
              {current.screenId}
            </Badge>
          </>
        ) : (
          <span className="text-sm text-muted-foreground">mes-basic</span>
        )}
      </div>

      <Button
        variant="ghost"
        size="icon"
        onClick={toggleTheme}
        aria-label={isDark ? '라이트 모드로 전환' : '다크 모드로 전환'}
        data-testid="theme-toggle"
      >
        {isDark ? <Sun /> : <Moon />}
      </Button>
    </header>
  )
}
