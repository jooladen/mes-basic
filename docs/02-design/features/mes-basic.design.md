# mes-basic Design Document

> **Summary**: React 19 + shadcn/ui(JS) 기반 MES 골격. 대기업 SI 표준 방식 — **계층형 아키텍처(Layered/Clean) + 업무 모듈 단위 패키징(common / biz-{모듈코드})** — 으로 좌측 대메뉴 3개(기준정보 MD·생산 PP·품질 QM) × 서브메뉴 1개, 공용 MultiCombo/TreeCombo, 하드코딩 데이터 저장소를 설계한다.
>
> **Project**: mes-basic (`claude-code3/mes-basic/`)
> **Version**: 0.1.0
> **Author**: 준 (주영준) + 앨리
> **Date**: 2026-09-21
> **Status**: Draft
> **Planning Doc**: [mes-basic.plan.md](../../01-plan/features/mes-basic.plan.md)

### Pipeline References

| Phase | Document | Status |
|-------|----------|--------|
| Phase 1 | Schema Definition | N/A — §3 인터페이스 정의서(I/F 정의서)로 대체 |
| Phase 2 | Coding Conventions | N/A — §10으로 대체 |
| Phase 3 | Mockup | N/A — §5.1 ASCII 레이아웃으로 대체 |
| Phase 4 | API Spec | N/A — 백엔드 없음. §4 저장소 계약(Repository Contract)으로 대체 |

---

## Context Anchor

> Plan에서 복사. Design→Do 인수인계 시 전략 맥락 보존용.

| Key | Value |
|-----|-------|
| **WHY** | MES 화면을 늘려도 셸(레이아웃·메뉴·공용 콤보)을 다시 짜지 않게 하고, Quasar 없이 shadcn으로 멀티/트리 콤보가 되는지 실증한다 |
| **WHO** | 준 본인 (1인 기업용 MES 기반 확보, React/shadcn 학습 겸용) |
| **RISK** | 트리콤보를 자작하다 셸 목적을 잊고 트리 컴포넌트 완성도에 매몰되는 것 / TS 없는 JS라 데이터 형태가 문서화 안 되면 확장 시 깨짐 |
| **SUCCESS** | 새 서브메뉴 1개 추가가 "menu.config.js 항목 1줄 + 페이지 파일 1개"로 끝난다. 멀티콤보·트리콤보가 3개 화면에서 동일 컴포넌트로 동작한다. 빌드 에러 0 |
| **SCOPE** | 1단계(이번): 셸 + 메뉴 3×1 + 콤보 2종 + 하드코딩 데이터 + UI 상태 로컬스토리지. 제외: 백엔드/API, 인증, 그리드 CRUD 저장, TypeScript |

---

## 1. Overview

### 1.1 Design Goals

1. **확장 지점 2곳 고정**: 화면 추가는 `menu.config.js`, 데이터 출처 교체는 `repositories/`. 이 둘 외에는 손대지 않고 MES가 커져야 한다.
2. **SI 관례 이식**: 공통(common)/업무(biz) 분리, 모듈코드(MD·PP·QM), 화면ID, 메뉴 정의 주도 라우팅 — 나중에 메뉴가 DB 테이블에서 오더라도 같은 형태.
3. **Quasar 대체 실증**: `MultiCombo`(shadcn Combobox multiple 래핑), `TreeCombo`(자작)가 3개 화면에서 같은 props로 동작.
4. **TS·JSDoc 부재 보완 (덕 타이핑 + 문서 계약)**: 코드에는 타입 선언이 전혀 없다. 데이터 형태의 계약은 §3 **인터페이스 정의서(표)** 가 지고, mock 데이터 필드명이 정의서와 1:1 인지 테스트로 대조한다. 향후 axios 도입 시 `res.data` 언래핑은 **repository 한 곳**에서만 한다(응답 봉투 패턴).

### 1.2 Design Principles

- **의존성은 안쪽으로만**: pages → services → repositories → data. 역방향·건너뛰기 금지 (pages가 data를 직접 import 금지).
- **공통은 업무를 모른다**: `common/`은 `biz/`를 import 하지 않는다. 반대만 허용.
- **모듈은 서로 모른다**: `biz/md`가 `biz/pp`를 import 하지 않는다. 공유가 필요하면 `common/`으로 올린다.
- **YAGNI 경계**: 저장소는 인터페이스 없이 "같은 함수 시그니처를 가진 모듈"로만 통일. 팩토리/DI 컨테이너는 백엔드가 실제로 붙을 때 도입.
- **로컬스토리지는 UI 상태만**: 키는 `storageKeys.js` 한 곳, 접근은 `useLocalStorage` 훅 한 곳.

---

## 2. Architecture Options

### 2.0 Architecture Comparison

| Criteria | Option A: Minimal | Option B: Clean (SI 표준) | Option C: Pragmatic |
|----------|:-:|:-:|:-:|
| **Approach** | 메뉴 하드코딩, 페이지가 data 직접 import | 공통/업무 모듈 분리 + 계층(pages/services/repositories/types) | menu.config + 단일 repositories/ 폴더 |
| **New Files** | ~12 | **~34** | ~20 |
| **Modified Files** | 0 | 0 | 0 |
| **Complexity** | Low | High | Medium |
| **Maintainability** | Low | **High** | High |
| **Effort** | Low | High | Medium |
| **Risk** | Plan 성공기준 미달 | 초기 과설계 가능 → §1.2 YAGNI 경계로 통제 | 균형 |
| **서브메뉴 추가 시 파일** | 3~4 | **2** (데이터까지 새로면 +3) | 2 |

**Selected**: **Option B — 계층형 아키텍처 + 업무 모듈 패키징 (대기업 SI 표준 방식)**
**Rationale**: 준의 결정. 이후 MES가 커질 때 대기업 SI 현장과 같은 구조여야 실무 이식이 쉽다. Plan은 C를 권했으나, B의 과설계 리스크는 "저장소 인터페이스·팩토리 없음, 모듈 간 import 금지"라는 두 규칙으로 통제한다. 파일 수는 20→34로 늘지만 성공기준(추가 시 파일 2개)은 유지된다.

**공식 명칭 정리**
| 부분 | 이름 | 출처 |
|------|------|------|
| pages → services → repositories 층 분리, 의존성 안쪽 | Layered Architecture (3-Tier) / Clean Architecture | Robert C. Martin |
| 저장소를 교체 지점으로 두고 데이터 출처 격리 | Hexagonal / Ports & Adapters | Alistair Cockburn |
| common + biz/{모듈코드} 로 패키징 | Package by Feature / Modular Monolith | 일반 명칭 |
| 모듈코드·화면ID·메뉴 정의 주도 라우팅 | (학술 명칭 없음) SI 표준 프레임워크 컨벤션 | eGovFrame 등 관례 |

### 2.1 Component Diagram

```
┌──────────────────────────────────────────────────────────────────────┐
│ app/                     (조립 — Provider, Router, AppShell)          │
│   router.jsx ◀── config/menu.config.js ──▶ common/layout/Sidebar     │
└──────────────┬───────────────────────────────────────────────────────┘
               │ lazy import (menu.config의 page 필드)
┌──────────────▼───────────────────────────────────────────────────────┐
│ biz/{md|pp|qm}/  (업무 모듈 — 서로 import 금지)                       │
│   pages/*.jsx  ──▶ services/*.js ──▶ repositories/*.js ──▶ data/*.js │
│        │                                     │  (res.data 언래핑 유일 지점)│
│        │                 형태 계약: §3 I/F 정의서 (문서, 코드 없음)      │
└────────┼─────────────────────────────────────────────────────────────┘
         │ uses
┌────────▼─────────────────────────────────────────────────────────────┐
│ common/  (공통 — biz를 모른다)                                        │
│   components/ui (shadcn) · components/form (MultiCombo, TreeCombo)   │
│   layout (AppShell, Sidebar, Header) · hooks (useLocalStorage,       │
│   useTheme) · utils (tree.js 검색/평탄화) · constants                 │
└──────────────────────────────────────────────────────────────────────┘
```

### 2.2 Data Flow

```
[조회 흐름]
사용자 검색조건 입력 (MultiCombo/TreeCombo → 배열/노드id)
  → page 상태(useState) 
  → service.search(criteria)      // 필터 규칙(비즈니스)
  → repository.findAll()          // 지금: data/*.js 반환 (Promise)
  → service가 criteria로 필터
  → page가 <Table>로 렌더

[UI 상태 흐름]
Sidebar 접힘 토글 → useLocalStorage(STORAGE_KEYS.SIDEBAR_COLLAPSED) → localStorage
Header 테마 토글  → useTheme → <html class="dark"> + localStorage(STORAGE_KEYS.THEME)

[메뉴 흐름]
menu.config.js → router.jsx (라우트 자동 생성) 
               → Sidebar (대/서브메뉴 렌더, NavLink active)
               → Header (현재 화면 제목·화면ID 표시)
```

### 2.3 Dependencies

| Component | Depends On | Purpose |
|-----------|-----------|---------|
| `app/router.jsx` | `config/menu.config.js`, react-router | 메뉴 정의에서 `<Route>` 자동 생성 |
| `common/layout/Sidebar` | `menu.config.js`, `useLocalStorage` | 메뉴 렌더 + 접힘 상태 유지 |
| `common/components/form/MultiCombo` | shadcn `Combobox`(Base UI) | 다중 선택 |
| `common/components/form/TreeCombo` | shadcn `Popover`, `Input`, `common/utils/tree.js` | 계층 선택 |
| `biz/*/pages` | `common/*`, 같은 모듈의 `services` | 화면 |
| `biz/*/services` | 같은 모듈의 `repositories` | 필터/가공 |
| `biz/*/repositories` | 같은 모듈의 `data` (1단계) → `common/api/httpClient` (2단계) | 데이터 출처 + `res.data` 언래핑 (교체 지점) |

**외부 패키지** (설치 시 `npm view` 로 최신 확인)
| 패키지 | 용도 | 비고 |
|--------|------|------|
| react, react-dom 19.x | UI | 안정판 |
| react-router 7.x | 라우팅 | `react-router` 단일 패키지 |
| shadcn (CLI) + Tailwind v4 | UI 킷 | `npx shadcn@latest init -t vite`, TypeScript: **no** |
| lucide-react | 아이콘 | shadcn 기본 |
| vitest + @testing-library/react | 단위 테스트 | 콤보·트리 유틸 |
| @playwright/test | L2/L3 | 선택 |
| axios | HTTP 클라이언트 | **2단계에 설치**. 1단계는 mock이 axios 응답 봉투 `{ data }` 모양만 흉내 |

---

## 3. Data Model

> **계약 방식: 인터페이스 정의서(I/F 정의서) + 덕 타이핑.** 코드에는 TypeScript도 JSDoc도 없다. 아래 표가 유일한 형태 계약이며, `*.mock.js`의 필드명은 이 표와 1:1이어야 한다(8.2 #8 테스트로 대조). 향후 백엔드 API 응답 본문(`res.data`)도 이 표를 따른다. 필드를 바꾸면 **이 표를 먼저** 고친다.

### 3.1 Entity Definition (인터페이스 정의서)

#### MenuItem — 서브메뉴(화면) 1개 (`config/menu.config.js` 안)

| 필드 | 형 | 필수 | 예시 / 규칙 |
|------|----|:----:|-------------|
| key | string | Y | `"md.item"` — `{모듈}.{업무}` |
| screenId | string | Y | `"MD_ITEM_0010"` — `{모듈}_{업무}_{순번4}` |
| label | string | Y | `"품목관리"` |
| path | string | Y | `"/md/item"` |
| page | function | Y | `() => import('@/biz/md/pages/ItemPage.jsx')` lazy |
| roles | string[] | N | 2단계 권한용 예약. 1단계 무시 |

#### MenuGroup — 대메뉴 1개

| 필드 | 형 | 필수 | 예시 / 규칙 |
|------|----|:----:|-------------|
| key | string | Y | `"md"` \| `"pp"` \| `"qm"` (모듈코드) |
| label | string | Y | `"기준정보"` |
| icon | string | Y | lucide 아이콘명 `"Database"` |
| order | number | Y | 정렬 |
| children | MenuItem[] | Y | 서브메뉴 목록 |

#### TreeNode — 설비 계층 (공장 › 라인 › 설비)

| 필드 | 형 | 필수 | 예시 / 규칙 |
|------|----|:----:|-------------|
| id | string | Y | `"F1"` / `"F1-L1"` / `"F1-L1-E01"` |
| label | string | Y | `"1공장"` / `"1라인"` / `"프레스#1"` |
| type | string | N | `"factory"` \| `"line"` \| `"equipment"` |
| children | TreeNode[] | N | 말단(설비)은 없음 |

#### Item — 품목 (`biz/md`)

| 필드 | 형 | 필수 | 예시 / 규칙 |
|------|----|:----:|-------------|
| itemCode | string | Y | `"ITM-0001"` PK |
| itemName | string | Y | |
| itemType | string | Y | `"RAW"` 원자재 \| `"SEMI"` 반제품 \| `"FIN"` 완제품 (코드그룹 ITEM_TYPE) |
| unit | string | Y | `"EA"` \| `"KG"` |
| equipmentId | string | Y | TreeNode.id (설비) |
| useYn | boolean | Y | |

#### WorkOrder — 작업지시 (`biz/pp`)

| 필드 | 형 | 필수 | 예시 / 규칙 |
|------|----|:----:|-------------|
| woNo | string | Y | `"WO-20260921-001"` PK |
| itemCode | string | Y | Item.itemCode |
| equipmentId | string | Y | TreeNode.id (설비) |
| planQty | number | Y | 정수 |
| status | string | Y | `"PLANNED"` \| `"RUNNING"` \| `"DONE"` (코드그룹 WO_STATUS) |
| planDate | string | Y | `"2026-09-21"` (YYYY-MM-DD) |

#### InspectionResult — 검사결과 (`biz/qm`)

| 필드 | 형 | 필수 | 예시 / 규칙 |
|------|----|:----:|-------------|
| inspNo | string | Y | `"INS-0001"` PK |
| woNo | string | Y | WorkOrder.woNo |
| itemCode | string | Y | Item.itemCode |
| equipmentId | string | Y | TreeNode.id |
| inspItems | string[] | Y | `["DIM","VIS"]` (코드그룹 INSP_ITEM) 1개 이상 |
| result | string | Y | `"PASS"` \| `"FAIL"` |
| inspDate | string | Y | YYYY-MM-DD |

#### CodeOption — 콤보 옵션 공통형 (MultiCombo 입력)

| 필드 | 형 | 필수 | 예시 |
|------|----|:----:|------|
| value | string | Y | `"RAW"` |
| label | string | Y | `"원자재"` |

#### 응답 봉투 (Response Envelope) — repository 안에서만 보이는 형태

| 단계 | repository가 받는 것 | repository가 돌려주는 것 |
|------|---------------------|--------------------------|
| 1단계 mock | `{ data: Item[] }` (axios 봉투 모양을 흉내) | `res.data` → `Item[]` |
| 2단계 axios | `AxiosResponse { data, status, headers }` | `res.data` → `Item[]` |
| 2단계 + 공통 응답 규격 | `res.data = { resultCode, resultMsg, data }` | `res.data.data` → `Item[]` (규격 확정 시 여기만 수정) |

> service·page는 봉투를 **절대** 보지 않는다. 배열/객체만 받는다.

### 3.2 Entity Relationships

```
[TreeNode 공장] 1 ── N [TreeNode 라인] 1 ── N [TreeNode 설비]
                                                  │ equipmentId
        [Item] 1 ──── N [WorkOrder] 1 ──── N [InspectionResult]
          └──────────────── itemCode ─────────────────┘
```

### 3.3 Database Schema

N/A — 1단계는 `biz/*/data/*.mock.js` 배열. §3.1 정의서가 곧 향후 테이블 스키마·API 응답 본문의 초안이다.

---

## 4. API Specification

백엔드 없음. 대신 **저장소 계약(Repository Contract)** 을 고정한다. 나중에 axios가 붙을 때 이 시그니처를 그대로 유지하고 내부만 `httpClient.get(...)` 으로 바꾼다. `res.data` 언래핑은 repository 함수 안에서만 일어난다.

### 4.1 Repository Contract (모든 모듈 공통 형태)

| 함수 | 시그니처 (호출부가 보는 것) | 1단계 구현 (mock) | 2단계 구현 (axios) |
|------|------------------------------|-------------------|--------------------|
| `findAll` | `() => Promise<T[]>` | `mockGet(MOCK).then(res => res.data)` — `mockGet`은 `{ data: 복사본 }` 봉투를 Promise로 반환 | `httpClient.get('/api/{resource}').then(res => res.data)` |
| `findById` | `(id) => Promise<T \| null>` | `findAll().then(rows => rows.find(...) ?? null)` | `httpClient.get('/api/{resource}/' + id).then(res => res.data)` |

```js
// 1단계 repository 모양 (biz/md/repositories/itemRepository.js)
// 교체 지점: 2단계에 mockGet → httpClient.get 으로 바꾸면 끝. 호출부 무변경.
import { mockGet } from '@/common/api/mockClient'
import { ITEMS_MOCK } from '../data/items.mock'

export function findAll() {
  return mockGet(ITEMS_MOCK).then((res) => res.data)
}
```

| 공통 클라이언트 | 파일 | 역할 |
|----------------|------|------|
| `mockGet(rows, delayMs = 0)` | `common/api/mockClient.js` | `Promise.resolve({ data: structuredClone(rows) })` — axios 봉투 모양. 원본 불변 보장 |
| `httpClient` | `common/api/httpClient.js` | **2단계** axios 인스턴스(`baseURL = VITE_API_BASE_URL`, 인터셉터). 1단계는 파일만 예약(미생성) |

| 모듈 | 파일 | T |
|------|------|---|
| md | `biz/md/repositories/itemRepository.js` | `Item` |
| pp | `biz/pp/repositories/workOrderRepository.js` | `WorkOrder` |
| qm | `biz/qm/repositories/inspectionRepository.js` | `InspectionResult` |
| common | `common/repositories/equipmentTreeRepository.js` | `TreeNode[]` (공장›라인›설비) |
| common | `common/repositories/codeRepository.js` | `getCodes(groupId) => Promise<CodeOption[]>` — ITEM_TYPE, WO_STATUS, INSP_ITEM |

### 4.2 Service Contract

| 모듈 | 파일 | 함수 | 역할 |
|------|------|------|------|
| md | `services/itemService.js` | `searchItems({ itemTypes: string[], equipmentId: string\|null, keyword })` | 타입 IN + 설비 하위 포함 + 이름 포함 |
| pp | `services/workOrderService.js` | `searchWorkOrders({ statuses: string[], equipmentId, keyword })` | 상태 IN + 설비 하위 포함 |
| qm | `services/inspectionService.js` | `searchInspections({ inspItems: string[], equipmentId, keyword })` | 검사항목 교집합 + 설비 하위 포함 |

> "설비 하위 포함": 트리에서 **라인**을 고르면 그 라인의 모든 설비가 대상. `common/utils/tree.js`의 `collectDescendantIds(tree, id)` 사용.

---

## 5. UI/UX Design

### 5.1 Screen Layout

```
┌──────────┬─────────────────────────────────────────────────────────┐
│ mes-basic│ Header: [☰] 기준정보 › 품목관리 (MD_ITEM_0010)   [🌙/☀] │
│ (로고)   ├─────────────────────────────────────────────────────────┤
├──────────┤ 검색조건 (Card)                                         │
│ ▣ 기준정보│  품목유형 [MultiCombo ▾]  설비 [TreeCombo ▾]  키워드 [__] │
│   └ 품목관리│                                        [초기화] [조회] │
│ ▣ 생산   ├─────────────────────────────────────────────────────────┤
│   └ 작업지시│ 목록 (Table)  총 N건                                   │
│ ▣ 품질   │  품목코드 │ 품목명 │ 유형 │ 단위 │ 설비 │ 사용          │
│   └ 검사결과│  ...                                                  │
│          │                                                         │
│ [◀ 접기] │                                                         │
└──────────┴─────────────────────────────────────────────────────────┘
접힘 시: 사이드바 폭 64px, 아이콘만. 모바일(<768px): 오버레이 Sheet.
```

### 5.2 User Flow

```
/ → (redirect) /md/item
사이드바 서브메뉴 클릭 → URL 변경 → lazy 페이지 로드 → Header 제목/화면ID 갱신
검색조건 선택 → [조회] → service 필터 → 표 갱신 (건수 표시)
[초기화] → 조건 비움 + 전체 목록
[☰] → 사이드바 접힘 (localStorage) / [🌙] → 테마 (localStorage)
```

### 5.3 Component List

| Component | Location | Responsibility |
|-----------|----------|----------------|
| `AppShell` | `common/layout/AppShell.jsx` | Sidebar + Header + `<Outlet>` 배치, 접힘 상태 소유 |
| `Sidebar` | `common/layout/Sidebar.jsx` | `menu.config` 렌더, active 표시, 접힘 모드 |
| `Header` | `common/layout/Header.jsx` | 현재 메뉴 breadcrumb + 화면ID, 테마 토글, ☰ |
| `ThemeProvider` / `useTheme` | `common/hooks/useTheme.js` | dark 기본, `<html class>` 토글, 저장 |
| `useLocalStorage` | `common/hooks/useLocalStorage.js` | try/catch 래핑, `useSyncExternalStore` 기반 |
| `MultiCombo` | `common/components/form/MultiCombo.jsx` | shadcn Combobox `multiple` 래핑 |
| `TreeCombo` | `common/components/form/TreeCombo.jsx` | Popover + `TreeNodeRow` 재귀 + 검색 |
| `TreeNodeRow` | `common/components/form/TreeNodeRow.jsx` | 노드 1줄 (펼침 아이콘·선택 하이라이트) |
| `SearchBar` | `common/components/form/SearchBar.jsx` | 검색조건 Card 껍데기 + [초기화][조회] 버튼 |
| `DataTable` | `common/components/table/DataTable.jsx` | columns 배열 + rows → shadcn Table, 건수 표시 |
| `ItemPage` | `biz/md/pages/ItemPage.jsx` | 화면 MD_ITEM_0010 |
| `WorkOrderPage` | `biz/pp/pages/WorkOrderPage.jsx` | 화면 PP_WO_0010 |
| `InspectionPage` | `biz/qm/pages/InspectionPage.jsx` | 화면 QM_INSP_0010 |

**공용 콤보 props 정의서 (Quasar QSelect 대응)**

MultiCombo — QSelect(multiple, use-chips) 대응

| prop | 형 | 필수 | 기본 | 설명 |
|------|----|:----:|------|------|
| options | CodeOption[] | Y | | `{ value, label }` 배열 |
| value | string[] | Y | | 선택된 value 배열 (제어 컴포넌트) |
| onChange | function(next: string[]) | Y | | 선택 변경 시 새 배열 전달 |
| placeholder | string | N | `"선택"` | |
| disabled | boolean | N | false | |

TreeCombo — 자작 (Quasar QTree + QSelect 조합 대응)

| prop | 형 | 필수 | 기본 | 설명 |
|------|----|:----:|------|------|
| tree | TreeNode[] | Y | | 루트 노드 배열 |
| value | string \| null | Y | | 선택 노드 id (단일) |
| onChange | function(id, node) | Y | | `(string\|null, TreeNode\|null)` |
| placeholder | string | N | `"선택"` | |
| leafOnly | boolean | N | false | true면 말단(설비)만 선택 가능 |
| defaultExpandDepth | number | N | 1 | 초기 펼침 깊이 |

- 표시값: 선택 노드의 경로 `"1공장 › 1라인 › 프레스#1"` (`utils/tree.js getPath`)
- 검색: 입력 시 label includes 매칭 노드 + 그 조상만 표시, 자동 펼침

### 5.4 Page UI Checklist

#### 공통 셸 (모든 페이지)
- [ ] Sidebar: 대메뉴 3개 — 기준정보(Database 아이콘), 생산(Factory), 품질(ClipboardCheck)
- [ ] Sidebar: 각 대메뉴 아래 서브메뉴 1개 — 품목관리 `/md/item`, 작업지시 `/pp/work-order`, 검사결과 `/qm/inspection`
- [ ] Sidebar: 현재 경로 서브메뉴 하이라이트 (NavLink active)
- [ ] Sidebar: [◀ 접기] 버튼 — 접힘 시 아이콘만(64px), 새로고침 후 유지
- [ ] Header: breadcrumb "대메뉴 › 서브메뉴" + 화면ID 배지
- [ ] Header: 테마 토글 버튼 (기본 dark), 새로고침 후 유지
- [ ] `/` 접속 시 `/md/item` 으로 redirect
- [ ] 없는 경로 → "화면을 찾을 수 없습니다" NotFound

#### 품목관리 (MD_ITEM_0010)
- [ ] Filter: 품목유형 MultiCombo (옵션 3: RAW 원자재 / SEMI 반제품 / FIN 완제품) — 칩 표시
- [ ] Filter: 설비 TreeCombo (공장›라인›설비, 라인 선택 시 하위 설비 전부 포함)
- [ ] Filter: 키워드 Input (품목코드·품목명 includes)
- [ ] Button: 초기화, 조회
- [ ] Table 컬럼: 품목코드, 품목명, 유형(라벨), 단위, 설비(경로), 사용여부(Y/N 배지)
- [ ] 건수 표시 "총 N건", 0건 시 "데이터가 없습니다"
- [ ] Mock 데이터 ≥ 12건 (유형 3종·설비 3개 이상 분포)

#### 작업지시 (PP_WO_0010)
- [ ] Filter: 상태 MultiCombo (PLANNED 계획 / RUNNING 진행 / DONE 완료)
- [ ] Filter: 설비 TreeCombo
- [ ] Filter: 키워드 (지시번호·품목코드)
- [ ] Button: 초기화, 조회
- [ ] Table 컬럼: 지시번호, 품목코드, 설비(경로), 계획수량(우측정렬·천단위), 상태(색 배지), 계획일
- [ ] Mock ≥ 10건

#### 검사결과 (QM_INSP_0010)
- [ ] Filter: 검사항목 MultiCombo (DIM 치수 / VIS 외관 / FUNC 기능 / PACK 포장)
- [ ] Filter: 설비 TreeCombo
- [ ] Filter: 키워드 (검사번호·지시번호)
- [ ] Button: 초기화, 조회
- [ ] Table 컬럼: 검사번호, 지시번호, 품목코드, 설비(경로), 검사항목(칩 나열), 결과(PASS 초록/FAIL 빨강), 검사일
- [ ] Mock ≥ 10건 (PASS/FAIL 혼합)

#### 확장 시연 (성공기준 검증용)
- [ ] `menu.config.js`에 `pp.line-status`(라인현황) 1줄 추가 + `biz/pp/pages/LineStatusPage.jsx` 1개 생성 → 사이드바·라우트·Header에 자동 반영되는지 확인. 확인 후 되돌림(또는 유지)

---

## 6. Error Handling

### 6.1 Error Definition

| 상황 | 처리 | 위치 |
|------|------|------|
| localStorage 접근 실패(프라이빗 창·용량) | try/catch → 기본값 사용, 콘솔 경고 없음 | `useLocalStorage` |
| localStorage 값이 깨진 JSON | catch → 기본값 + 해당 키 삭제 | `useLocalStorage` |
| menu.config의 page lazy import 실패 | `<Suspense>` + ErrorBoundary → "화면 로드 실패" | `app/router.jsx` |
| 없는 경로 | NotFound 페이지 | `app/router.jsx` |
| TreeCombo value가 tree에 없는 id | 표시값 빈 문자열, onChange(null) 하지 않음(외부 상태 존중) | `TreeCombo` |
| repository 반환 실패 (추후 API) | service가 그대로 throw → page가 `error` 상태 표시 | 각 page |

### 6.2 Error Response Format

N/A (API 없음). 추후 API 도입 시 `{ error: { code, message } }` 형식으로 §4 계약에 추가.

---

## 7. Security Considerations

- [x] 입력값 렌더는 React 기본 이스케이프 — `dangerouslySetInnerHTML` 사용 금지
- [ ] 인증/권한 — 범위 밖 (2단계). 단, `MenuItem`에 `roles?: string[]` 필드를 예약해 두고 지금은 무시
- [x] 시크릿 없음 — `.env` 불필요. 추후 `VITE_API_BASE_URL`만
- [x] localStorage에는 UI 상태만 (개인정보·토큰 저장 금지)

---

## 8. Test Plan

> Do 단계에서 코드 + 테스트 = 1세트. Check 단계는 실행만.

### 8.1 Test Scope

| Type | Target | Tool | Phase |
|------|--------|------|-------|
| L0: Unit | `utils/tree.js`, services 필터, `useLocalStorage` | Vitest | Do |
| L1: API | N/A (백엔드 없음) — 대신 repository 계약 단위 테스트 | Vitest | Do |
| L2: UI Action | 콤보 조작·조회·접힘·테마 | Playwright | Do |
| L3: E2E | 메뉴 이동 → 조회 → 새로고침 유지 | Playwright | Do |

### 8.2 L0/L1: Unit Test Scenarios

| # | 대상 | 테스트 | 기대 |
|---|------|--------|------|
| 1 | `tree.js getPath` | "F1-L1-E01" | ["1공장","1라인","프레스#1"] |
| 2 | `tree.js collectDescendantIds` | "F1-L1" | 그 라인의 설비 id 전부 + 자기 자신 |
| 3 | `tree.js filterTree` | "프레스" | 매칭 노드 + 조상만 남음, 무관 가지 제거 |
| 4 | `itemService.searchItems` | itemTypes ["RAW"], equipmentId "F1-L1" | 결과 전부 RAW이고 설비가 F1-L1 하위 |
| 5 | `itemService.searchItems` | 빈 조건 | 전체 반환 |
| 6 | 각 repository `findAll` | 두 번 호출 후 한쪽 변형 | 원본 mock 불변 (복사본 반환) |
| 7 | `useLocalStorage` | localStorage.getItem이 throw | 기본값 반환, 에러 전파 없음 |
| 8 | mock ↔ §3 정의서 대조 | 각 `*.mock.js` 모든 행의 키 집합 | 정의서 필수 필드와 정확히 일치 (TS 없음의 안전망) |
| 9 | `mockGet` | 반환값 | `{ data }` 봉투이고 `res.data !== 원본` (깊은 복사) |

### 8.3 L2: UI Action Test Scenarios

| # | Page | Action | Expected Result |
|---|------|--------|-----------------|
| 1 | 모든 페이지 | 로드 | §5.4 체크리스트 요소 전부 표시 |
| 2 | 품목관리 | MultiCombo에서 RAW, FIN 선택 → 조회 | 표의 유형 컬럼이 원자재/완제품만 |
| 3 | 품목관리 | TreeCombo 열기 → 검색 "프레스" → 선택 | 표시값 경로 문자열, 표 필터됨 |
| 4 | 작업지시 | 상태 RUNNING → 조회 → 초기화 | 건수 감소 후 전체 복귀 |
| 5 | 검사결과 | 검사항목 DIM+VIS → 조회 | 결과 행의 칩에 DIM 또는 VIS 포함 |
| 6 | 셸 | [◀ 접기] → 새로고침 | 접힘 유지 |
| 7 | 셸 | 테마 토글 → 새로고침 | 라이트 유지, `<html>`에 `dark` 없음 |
| 8 | 셸 | 키보드: TreeCombo 열고 ↓↓ Enter | 3번째 노드 선택 |

### 8.4 L3: E2E Scenario Test Scenarios

| # | Scenario | Steps | Success Criteria |
|---|----------|-------|-----------------|
| 1 | 3화면 순회 | / → 품목관리 → 생산›작업지시 → 품질›검사결과 | 각 Header 화면ID가 MD_ITEM_0010 / PP_WO_0010 / QM_INSP_0010 |
| 2 | 조건 유지 없음 확인 | 품목관리에서 조회 → 작업지시 이동 → 복귀 | 조건 초기화됨 (1단계 사양: 페이지 상태 비저장) |
| 3 | 확장 시연 | menu.config 1줄 + 페이지 1개 추가 후 dev 재시작 | 사이드바에 "라인현황" 등장, 라우트 동작 |
| 4 | 반응형 | 뷰포트 375px | 사이드바 숨김, ☰로 Sheet 오버레이 |

### 8.5 Seed Data Requirements

| Entity | Minimum | Key Fields |
|--------|:-------:|------------|
| TreeNode | 공장 2 › 라인 2씩 › 설비 2~3씩 (총 설비 ≥ 8) | id 규칙 `F{n}-L{n}-E{nn}` |
| Item | 12 | itemType 3종 고루, equipmentId 설비 분산 |
| WorkOrder | 10 | status 3종, equipmentId 분산 |
| InspectionResult | 10 | PASS/FAIL 혼합, inspItems 1~3개 |
| CodeOption 그룹 | ITEM_TYPE(3), WO_STATUS(3), INSP_ITEM(4) | — |

---

## 9. Clean Architecture

### 9.1 Layer Structure

| Layer | Responsibility | Location |
|-------|---------------|----------|
| **Presentation** | 페이지, 레이아웃, 공용 UI, 훅 | `biz/*/pages/`, `common/layout/`, `common/components/`, `common/hooks/` |
| **Application** | 조회 조건 → 필터 규칙 (비즈니스) | `biz/*/services/` |
| **Domain** | 순수 유틸(트리 연산). 데이터 형태 계약은 코드가 아니라 §3 정의서(문서) | `common/utils/` |
| **Infrastructure** | 데이터 출처 (mock → axios) + `res.data` 언래핑 | `biz/*/repositories/`, `common/repositories/`, `biz/*/data/`, `common/api/` |

### 9.2 Dependency Rules

```
Presentation(pages) ──→ Application(services) ──→ Infrastructure(repositories ──→ data)
        │                        │                          │
        └────────────────────────┴──────────→ Domain(types, utils) ←┘
common ─X─→ biz          (공통은 업무를 모른다)
biz/md ─X─→ biz/pp       (모듈끼리 모른다)
pages ─X─→ repositories  (건너뛰기 금지)
pages ─X─→ data          (직접 import 금지 — grep 검증 항목)
```

### 9.3 File Import Rules

| From | Can Import | Cannot Import |
|------|-----------|---------------|
| `biz/*/pages` | `common/*`, 같은 모듈 `services` | `repositories`, `data`, `common/api`, 다른 모듈 |
| `biz/*/services` | 같은 모듈 `repositories`, `common/utils`, `common/repositories` | `pages`, `common/components`, `common/api`, 다른 모듈 |
| `biz/*/repositories` | 같은 모듈 `data`, `common/api` | 그 외 전부 |
| `common/*` | `common/*` 내부만 | `biz/*` |
| `app/*` | 전부 (조립 계층) | — |

### 9.4 This Feature's Layer Assignment

| Component | Layer | Location |
|-----------|-------|----------|
| AppShell, Sidebar, Header, MultiCombo, TreeCombo, DataTable, SearchBar | Presentation | `common/layout/`, `common/components/` |
| ItemPage, WorkOrderPage, InspectionPage | Presentation | `biz/{md,pp,qm}/pages/` |
| itemService, workOrderService, inspectionService | Application | `biz/*/services/` |
| tree.js (getPath, collectDescendantIds, filterTree, flatten) | Domain | `common/utils/` |
| itemRepository, workOrderRepository, inspectionRepository, equipmentTreeRepository, codeRepository, *.mock.js, mockClient | Infrastructure | `biz/*/repositories/`, `common/repositories/`, `biz/*/data/`, `common/api/` |

---

## 10. Coding Convention Reference

### 10.1 Naming Conventions

| Target | Rule | Example |
|--------|------|---------|
| 모듈코드 | 소문자 2자 (SAP 관례 차용) | `md` 기준정보, `pp` 생산, `qm` 품질 |
| 화면ID | `{모듈}_{업무}_{순번4}` 대문자 | `MD_ITEM_0010`, `PP_WO_0010`, `QM_INSP_0010` |
| 메뉴 key | `{모듈}.{업무}` 소문자 | `md.item` |
| 라우트 | `/{모듈}/{업무-kebab}` | `/pp/work-order` |
| 컴포넌트 파일 | PascalCase.jsx | `TreeCombo.jsx`, `ItemPage.jsx` |
| 훅 | `useXxx.js` | `useLocalStorage.js` |
| 서비스/저장소 | `{entity}Service.js` / `{entity}Repository.js` | `itemRepository.js` |
| mock 데이터 | `{entity}.mock.js`, export `const {ENTITY}_MOCK` | `items.mock.js` → `ITEMS_MOCK` |
| API 클라이언트 | `common/api/{name}Client.js` | `mockClient.js`(1단계), `httpClient.js`(2단계 axios) |
| 응답 변수명 | repository 안에서 axios/mock 응답은 항상 `res` | `.then((res) => res.data)` |
| 상수 | UPPER_SNAKE | `STORAGE_KEYS.SIDEBAR_COLLAPSED`, `SIDEBAR_WIDTH_COLLAPSED` |
| 폴더 | kebab-case | `work-order/` 없음 — 모듈 폴더는 코드 2자 |

### 10.2 Import Order

```js
// 1. react / 외부
import { useState } from 'react'
import { NavLink } from 'react-router'
// 2. 공통 절대경로
import { MultiCombo } from '@/common/components/form/MultiCombo'
// 3. 같은 모듈 상대경로
import { searchItems } from '../services/itemService'
// 4. 스타일 (있을 때)
```

`@/` → `src/` (jsconfig.json `paths` + vite `resolve.alias`)

### 10.3 Environment Variables

1단계 없음. 예약: `VITE_API_BASE_URL` (2단계).

### 10.4 This Feature's Conventions

| Item | Convention Applied |
|------|-------------------|
| 파일 상단 주석 | `// Design Ref: §N — 이유` (bkit 관례). 저장소 파일엔 `// 교체 지점: 추후 fetch로 대체` |
| 상태관리 | 페이지 로컬 `useState`. 셸 상태는 `AppShell`이 소유하고 Context로 내려줌 |
| 비동기 | repository는 항상 `Promise` 반환 (mock이라도) — API 전환 시 호출부 무변경 |
| 응답 처리 | `res.data` 언래핑은 **repository 안에서만**. service/page는 배열·객체만 받는다 (응답 봉투 패턴) |
| 형태 계약 | TS·JSDoc 없음. §3 정의서가 계약, mock 필드명 대조 테스트(8.2 #8)가 안전망 |
| 로컬스토리지 | 키는 `config/storageKeys.js`, prefix `mes.` — `mes.sidebarCollapsed`, `mes.theme` |
| 에러 | §6 표 준수. `console.error`는 ErrorBoundary 한 곳만 |
| 파일 크기 | 300줄 / 함수 50줄 초과 시 분리 (TreeCombo는 `TreeNodeRow` 분리로 대비) |

---

## 11. Implementation Guide

### 11.1 File Structure

```
mes-basic/
├── package.json  vite.config.js  jsconfig.json  components.json(shadcn)  index.html
├── docs/                              ← PDCA 문서
├── tests/e2e/mes-basic.spec.js        ← L2/L3
└── src/
    ├── main.jsx
    ├── index.css                      ← Tailwind v4 + shadcn 토큰
    ├── app/
    │   ├── App.jsx                    ← ThemeProvider + RouterProvider
    │   ├── router.jsx                 ← menu.config → routes (lazy) + redirect + NotFound
    │   └── ErrorBoundary.jsx
    ├── config/
    │   ├── menu.config.js             ★ 확장 지점 1
    │   └── storageKeys.js
    ├── common/
    │   ├── components/
    │   │   ├── ui/                    ← shadcn 생성 (button, input, popover, combobox, table, badge, card, sheet, tooltip)
    │   │   ├── form/  MultiCombo.jsx  TreeCombo.jsx  TreeNodeRow.jsx  SearchBar.jsx
    │   │   └── table/ DataTable.jsx
    │   ├── layout/    AppShell.jsx  Sidebar.jsx  Header.jsx
    │   ├── hooks/     useLocalStorage.js  useTheme.js
    │   ├── utils/     tree.js  (getPath, collectDescendantIds, filterTree, flatten)
    │   ├── api/       mockClient.js  (1단계: { data } 봉투)   httpClient.js (2단계 axios, 지금은 미생성)
    │   ├── repositories/ equipmentTreeRepository.js  codeRepository.js   ★ 확장 지점 2
    │   └── data/      equipmentTree.mock.js  codes.mock.js
    └── biz/
        ├── md/  pages/ItemPage.jsx  services/itemService.js  repositories/itemRepository.js
        │        data/items.mock.js
        ├── pp/  pages/WorkOrderPage.jsx  services/workOrderService.js  repositories/workOrderRepository.js
        │        data/workOrders.mock.js
        └── qm/  pages/InspectionPage.jsx  services/inspectionService.js  repositories/inspectionRepository.js
                 data/inspections.mock.js
```
> 데이터 형태 파일(`types/`)은 없다 — 계약은 §3 정의서(문서). 파일 수 34 → 28.

#### 11.1.1 구현 편차 기록 (module-1·2, 2026-09-21)

| 설계 | 실제 | 이유 |
|------|------|------|
| React 19.2.x | **React 19.3.0**, react-router 8.4, Vite 8.3, shadcn 4.21 (`-b base` = Base UI 계열) | 초기화 시점 `npm view` 최신 안정판 |
| `common/utils/tree.js` 만 | + `common/utils/criteria.js` (IN/교집합/키워드/설비하위 매칭) | 3개 service 가 같은 규칙 반복 → 함수 추출 규칙 |
| `common/lib` 없음 | + `common/lib/utils.js` (`cn`) | shadcn CLI 관례. `components.json` alias 를 `@/common/*` 로 조정 |
| `Sidebar.jsx` 단일 | `Sidebar.jsx` + `SidebarNav.jsx` + `menuIcons.js` | 데스크톱 사이드바와 모바일 Sheet 가 같은 nav 를 공유. 아이콘은 명시 등록(트리쉐이킹) |
| `ThemeProvider` | Provider 없이 `useTheme()` 훅만 — `useLocalStorage` 가 같은 키 구독을 동기화 | Context 불필요 (YAGNI) |
| 페이지 3개 완성 | `common/components/ScreenStub.jsx` 스텁 (module-3/5 에서 교체) | module-2 는 라우팅 검증 범위 |
| `app/router.jsx` 안의 fallback | `app/PageFallback.jsx` 분리 | ESLint fast-refresh 규칙 |
| Tooltip/Sheet `asChild` | Base UI 는 `render` prop | 프리미티브 차이 |

**module-3·4 (2026-09-21)**

| 설계 | 실제 | 이유 |
|------|------|------|
| `CODE_GROUPS` 가 `codes.mock.js` 안 | `config/codeGroups.js` 로 분리 | 페이지가 `data/` 를 import 하면 §9.3 위반 — 상수만 config 로 |
| 페이지가 `common/repositories` 직접 호출 가능(§9.3) | `common/hooks/useCodes`, `useEquipmentTree`, `useSearch` 훅 경유 | 페이지는 훅만 알게 해 repository 이름조차 모르게. `useSearch` 는 3페이지 공통 조회 패턴(요청 순서 보장 포함) |
| `TreeCombo` 단일 파일 | + `common/utils/treeView.js` (visibleRows / idsUpToDepth / allBranchIds) | 키보드 이동 기준 목록을 순수 함수로 분리 → 단위 테스트 가능, TreeCombo 300줄 미만 유지 |
| MultiCombo value = string[] | 바깥은 string[] 유지, 내부에서 Base UI 가 요구하는 객체 배열로 변환 (`isItemEqualToValue`, `itemToStringValue`) | 정의서 props 를 지키면서 Base UI Combobox 사용 |
| 트리 변경 시 펼침 재계산을 effect 로 | React "렌더 중 상태 조정" 패턴(`prevTree` 비교) | ESLint `react-hooks/set-state-in-effect` 규칙 |
| §5.4 품목관리 7항목 | 전부 구현 + dev 서버 검증 (`shots/04~06`) | — |

**module-5 (2026-09-21)**

| 설계 | 실제 | 이유 |
|------|------|------|
| 상태/결과 배지를 페이지별 렌더 | `common/components/StatusBadge.jsx` (코드→색조 매핑 한 곳) | PLANNED/RUNNING/DONE + PASS/FAIL 을 두 페이지가 공유 |
| `ScreenStub` (module-2 임시) | 삭제 — 참조 0건 grep 확인 | 3페이지 실장 완료 |
| E2E 파일명 `tests/e2e/{feature}.spec.ts` | `tests/e2e/mes-basic.spec.js` + `playwright.config.js` (webServer 자동 기동, 포트 5176) | TS 미사용. `pnpm test:e2e` 한 번으로 실행 |
| L3 #3 확장 시연 | 수동 수행 후 되돌림 — `menu.config` 1줄 + `LineStatusPage.jsx` 1개 → 사이드바·라우트·breadcrumb·화면ID 자동 반영 (`shots/07`), 빌드에 chunk 자동 생성, 메뉴 무결성 테스트 통과. **수정 파일 2개 = Plan FR-03 충족** | 코드 변경이 필요한 시나리오라 자동 E2E 에서 제외 |
| Vitest include 기본값 | `src/**/*.test.{js,jsx}` 로 한정 | Playwright spec 을 Vitest 가 집지 않게 |

**Check 단계 갭 조치 (2026-09-21, analysis 1차 99.5% → 100%)**

| 설계 | 실제 | 이유 |
|------|------|------|
| §6.1 repository 실패 → page error 표시 | `useSearch` 가 `error` 반환, `DataTable error` prop 이 `role=alert` 표시. `useCodes`/`useEquipmentTree` 는 실패 시 빈 목록(에러 전파 없음) | Gap #1 — 1차 분석에서 미구현 발견 |
| `TreeCombo.jsx` 단일 | `useTreeCombo.js` (useTreeExpansion · useTreeHighlight · treeKeyAction 순수 함수) + `TreeCombo.jsx` (JSX 만) | Gap #3 — Plan §4.2 함수 50줄. 열 때 첫 행 하이라이트(§8.3 #8 ↓↓ Enter) — Gap #2 |
| 페이지 컴포넌트 안에 columns 배열 | `buildColumns({ …label, pathOf })` 함수로 분리 (같은 파일) | Gap #3 — 컴포넌트 본문 ≤ 50줄 |

**menu.config.js 형태 (확장 지점 1)**
```js
// 서브메뉴 추가 = 여기 1줄 + biz/{모듈}/pages/{화면}.jsx 1개
export const MENU = [
  { key: 'md', label: '기준정보', icon: 'Database', order: 1, children: [
    { key: 'md.item', screenId: 'MD_ITEM_0010', label: '품목관리', path: '/md/item',
      page: () => import('@/biz/md/pages/ItemPage.jsx') },
  ]},
  { key: 'pp', label: '생산', icon: 'Factory', order: 2, children: [ /* pp.work-order */ ]},
  { key: 'qm', label: '품질', icon: 'ClipboardCheck', order: 3, children: [ /* qm.inspection */ ]},
]
```

### 11.2 Implementation Order

1. [ ] **초기화**: `npx shadcn@latest init -t vite` (TypeScript: no) → `jsconfig.json` alias → `npm view react version` 기록 → 다크 기본 설정
2. [ ] **Domain**: `common/utils/tree.js` + Vitest 테스트(8.2 #1~3)
3. [ ] **Infrastructure**: `common/api/mockClient.js` → mock 데이터 5종(§3 정의서 필드명 그대로) → repository 5개(`res.data` 언래핑) + 테스트(8.2 #6, #8, #9)
4. [ ] **Application**: service 3개 + 테스트(8.2 #4~5)
5. [ ] **셸**: `storageKeys`, `useLocalStorage`(+테스트 #7), `useTheme`, `AppShell/Sidebar/Header`, `menu.config`, `router`, NotFound, ErrorBoundary → dev 서버로 메뉴 이동 확인
6. [ ] **공용 컴포넌트**: `DataTable`, `SearchBar`, `MultiCombo` → 품목관리 페이지에 먼저 연결해 검증
7. [ ] **TreeCombo**: `TreeNodeRow` → `TreeCombo`(펼침/검색/키보드) → 품목관리에 연결
8. [ ] **나머지 페이지**: 작업지시, 검사결과 (콤보·표 재사용)
9. [ ] **L2/L3**: Playwright 시나리오 작성·실행, 확장 시연(8.4 #3), 스크린샷 `docs/02-design/features/mes-basic.screenshot.png`
10. [ ] `pnpm build` + lint 0건 → `/pdca analyze mes-basic`

### 11.3 Session Guide

#### Module Map

| Module | Scope Key | Description | Estimated Turns |
|--------|-----------|-------------|:---------------:|
| 초기화 + Domain + Infra + Service | `module-1` | 11.2의 1~4단계. 화면 없이 테스트로만 검증 | 25-35 |
| 셸 (레이아웃·메뉴·라우터·로컬스토리지) | `module-2` | 11.2의 5단계. dev 서버에서 메뉴 이동 확인 | 25-35 |
| MultiCombo + DataTable + 품목관리 | `module-3` | 11.2의 6단계 | 20-30 |
| TreeCombo | `module-4` | 11.2의 7단계. 가장 리스크 큰 자작 컴포넌트 | 25-40 |
| 작업지시·검사결과 + E2E + 확장 시연 | `module-5` | 11.2의 8~10단계 | 25-35 |

#### Recommended Session Plan

| Session | Phase | Scope | Turns |
|---------|-------|-------|:-----:|
| 1 | Plan + Design | 전체 | 완료 |
| 2 | Do | `--scope module-1,module-2` | 50-70 |
| 3 | Do | `--scope module-3,module-4` | 45-70 |
| 4 | Do | `--scope module-5` | 25-35 |
| 5 | Check + Report | 전체 | 30-40 |

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-09-21 | Initial draft — B(SI 표준: Layered + Package by Module) 선택, 트리 데이터 공장›라인›설비 확정 | 준 + 앨리 |
| 0.2 | 2026-09-21 | JSDoc 전면 제거 → §3 인터페이스 정의서(표) + 덕 타이핑. axios 대비 응답 봉투 패턴(`res.data`는 repository만) + `mockClient` 도입. `types/` 폴더 삭제(파일 34→28) | 준 + 앨리 |
| 0.3 | 2026-09-21 | module-1·2 구현 완료 — §11.1.1 편차 기록. 스크린샷 `shots/01~03`. Vitest 39건, lint 0, build 0 | 준 + 앨리 |
| 0.4 | 2026-09-21 | module-3·4 구현 완료 — MultiCombo·TreeCombo·DataTable·SearchBar·품목관리 실장. 스크린샷 `shots/04~06`. Vitest 55건, lint 0, build 0 | 준 + 앨리 |
| 0.5 | 2026-09-21 | module-5 구현 완료 — 작업지시·검사결과 실장, Playwright E2E 14건(L2 #1~8, L3 #1·2·4 + NotFound), 확장 시연(FR-03) `shots/07`. **1단계 전체 Do 완료** | 준 + 앨리 |
| 0.6 | 2026-09-21 | Check 갭 3건 조치 기록 (§11.1.1). Vitest 62건, E2E 14건, 50줄 초과 함수 0. Match Rate 100% | 준 + 앨리 |
