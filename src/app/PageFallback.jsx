// lazy 페이지 로딩 중 표시. router.jsx 와 분리 (fast-refresh: 컴포넌트 파일은 컴포넌트만 export)
export function PageFallback() {
  return <p className="text-sm text-muted-foreground">화면을 불러오는 중…</p>
}
