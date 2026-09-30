// Design Ref: §5.3 Sidebar — 메뉴 목록 렌더 (데스크톱 사이드바·모바일 Sheet 가 공용으로 사용)
// Plan FR-01: 대메뉴/서브메뉴는 menu.config 에서만 온다
import { NavLink } from 'react-router'
import { cn } from '@/common/lib/utils'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/common/components/ui/tooltip'
import { resolveIcon } from '@/common/layout/menuIcons'

function SubMenuLink({ item, collapsed, onNavigate }) {
  const link = (
    <NavLink
      to={item.path}
      onClick={onNavigate}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors',
          'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
          isActive && 'bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary',
          collapsed ? 'justify-center' : 'pl-8',
        )
      }
    >
      {collapsed ? (
        <span className="text-xs font-semibold">{item.label.slice(0, 2)}</span>
      ) : (
        <span className="truncate">{item.label}</span>
      )}
    </NavLink>
  )
  if (!collapsed) return link
  return (
    <Tooltip>
      <TooltipTrigger render={link} />
      <TooltipContent side="right">{item.label}</TooltipContent>
    </Tooltip>
  )
}

export function SidebarNav({ menu, collapsed = false, onNavigate }) {
  const groups = [...menu].sort((a, b) => a.order - b.order)
  return (
    <nav aria-label="주 메뉴" className="flex flex-col gap-4 p-2">
      {groups.map((group) => {
        const Icon = resolveIcon(group.icon)
        return (
          <div key={group.key} className="flex flex-col gap-1">
            <div
              className={cn(
                'flex items-center gap-2 px-2 py-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase',
                collapsed && 'justify-center',
              )}
            >
              <Icon className="size-4 shrink-0" aria-hidden="true" />
              {!collapsed && <span>{group.label}</span>}
            </div>
            {group.children.map((item) => (
              <SubMenuLink key={item.key} item={item} collapsed={collapsed} onNavigate={onNavigate} />
            ))}
          </div>
        )
      })}
    </nav>
  )
}
