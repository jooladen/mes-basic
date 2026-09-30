// Design Ref: §6.1 — lazy 페이지 로드 실패 등 렌더 에러를 셸 안에서 흡수. console.error 는 여기 한 곳만.
import { Component } from 'react'
import { Button } from '@/common/components/ui/button'

export class ErrorBoundary extends Component {
  state = { error: null }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error('[mes-basic] 화면 렌더 실패', error, info?.componentStack)
  }

  reset = () => this.setState({ error: null })

  render() {
    if (!this.state.error) return this.props.children
    return (
      <div role="alert" className="flex flex-col items-start gap-3 rounded-lg border border-destructive/40 p-6">
        <p className="font-semibold">화면 로드 실패</p>
        <p className="text-sm text-muted-foreground">{String(this.state.error?.message ?? this.state.error)}</p>
        <Button variant="outline" size="sm" onClick={this.reset}>
          다시 시도
        </Button>
      </div>
    )
  }
}
