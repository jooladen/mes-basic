// Design Ref: §5.3 AppShell — Sidebar + Header + <Outlet>. 접힘 상태를 소유(localStorage), 모바일은 Sheet 오버레이.
// Plan FR-07: 접힘 상태 새로고침 후 유지
import { useState } from 'react'
import { Outlet } from 'react-router'
import { Sheet, SheetContent, SheetTitle } from '@/common/components/ui/sheet'
import { useLocalStorage } from '@/common/hooks/useLocalStorage'
import { Header } from '@/common/layout/Header'
import { Sidebar } from '@/common/layout/Sidebar'
import { SidebarNav } from '@/common/layout/SidebarNav'
import { MENU } from '@/config/menu.config'
import { STORAGE_KEYS } from '@/config/storageKeys'

export function AppShell() {
  const [collapsed, setCollapsed] = useLocalStorage(STORAGE_KEYS.SIDEBAR_COLLAPSED, false)
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="flex h-dvh overflow-hidden">
      <Sidebar menu={MENU} collapsed={collapsed} onToggleCollapsed={() => setCollapsed((prev) => !prev)} />

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <SheetTitle className="px-4 py-3 text-base font-bold">mes-basic</SheetTitle>
          <SidebarNav menu={MENU} onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col">
        <Header onOpenMobileMenu={() => setMobileOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
