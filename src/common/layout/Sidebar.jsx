// Design Ref: §5.1 — 데스크톱 사이드바. 접힘 시 64px 아이콘 모드. 모바일(<md)에서는 숨김 (Sheet 는 AppShell 이 담당)
import { PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { cn } from '@/common/lib/utils'
import { Button } from '@/common/components/ui/button'
import { Separator } from '@/common/components/ui/separator'
import { SidebarNav } from '@/common/layout/SidebarNav'

export const SIDEBAR_WIDTH_CLASS = 'w-60'
export const SIDEBAR_WIDTH_COLLAPSED_CLASS = 'w-16'

export function Sidebar({ menu, collapsed, onToggleCollapsed }) {
  return (
    <aside
      data-testid="sidebar"
      data-collapsed={collapsed}
      className={cn(
        'hidden md:flex flex-col border-r bg-sidebar text-sidebar-foreground transition-[width] duration-200',
        collapsed ? SIDEBAR_WIDTH_COLLAPSED_CLASS : SIDEBAR_WIDTH_CLASS,
      )}
    >
      <div className={cn('flex h-14 items-center px-4 font-bold', collapsed && 'justify-center px-0')}>
        {collapsed ? 'M' : 'mes-basic'}
      </div>
      <Separator />
      <div className="flex-1 overflow-y-auto">
        <SidebarNav menu={menu} collapsed={collapsed} />
      </div>
      <Separator />
      <div className={cn('p-2', collapsed && 'flex justify-center')}>
        <Button
          variant="ghost"
          size={collapsed ? 'icon' : 'sm'}
          onClick={onToggleCollapsed}
          aria-label={collapsed ? '메뉴 펼치기' : '메뉴 접기'}
          aria-pressed={collapsed}
        >
          {collapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
          {!collapsed && <span>접기</span>}
        </Button>
      </div>
    </aside>
  )
}
