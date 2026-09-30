// Design Ref: §5.3 useTheme — dark 기본. <html class="dark"> 토글 + localStorage(mes.theme) 유지.
// Plan FR-09: 다크모드 기본 + 헤더 토글
import { useEffect } from 'react'
import { useLocalStorage } from '@/common/hooks/useLocalStorage'
import { STORAGE_KEYS } from '@/config/storageKeys'

export const THEMES = Object.freeze({ DARK: 'dark', LIGHT: 'light' })

export function useTheme() {
  const [theme, setTheme] = useLocalStorage(STORAGE_KEYS.THEME, THEMES.DARK)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === THEMES.DARK)
  }, [theme])

  const toggleTheme = () => setTheme((prev) => (prev === THEMES.DARK ? THEMES.LIGHT : THEMES.DARK))

  return { theme, isDark: theme === THEMES.DARK, toggleTheme }
}
