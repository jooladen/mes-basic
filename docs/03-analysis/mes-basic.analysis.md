# mes-basic Analysis Report

> **Analysis Type**: Gap Analysis (Design vs Implementation) + Runtime Verification
>
> **Project**: mes-basic
> **Version**: 0.1.0
> **Analyst**: 앨리 (gap-detector 정적 분석 + Playwright/Vitest 실행) · 준 검토
> **Date**: 2026-09-21
> **Design Doc**: [mes-basic.design.md](../02-design/features/mes-basic.design.md)

### Pipeline References

| Phase | Document | Verification Target |
|-------|----------|---------------------|
| Phase 1 | Design §3.1 인터페이스 정의서 | mock·컬럼 필드명 일치 (`schema.test.js`) |
| Phase 2 | Design §10 Conventions | 명명·import 순서·헤더 주석 |
| Phase 4 | Design §4 Repository/Service Contract | `res.data` 위치, 시그니처 |
| Phase 8 | 본 문서 §6·§7 | 아키텍처·컨벤션 |

---

## Context Anchor

| Key | Value |
|-----|-------|
| **WHY** | MES 화면을 늘려도 셸(레이아웃·메뉴·공용 콤보)을 다시 짜지 않게 하고, Quasar 없이 shadcn으로 멀티/트리 콤보가 되는지 실증한다 |
| **WHO** | 준 본인 (1인 기업용 MES 기반 확보, React/shadcn 학습 겸용) |
| **RISK** | 트리콤보를 자작하다 셸 목적을 잊고 트리 컴포넌트 완성도에 매몰되는 것 / TS 없는 JS라 데이터 형태가 문서화 안 되면 확장 시 깨짐 |
| **SUCCESS** | 새 서브메뉴 1개 추가가 "menu.config.js 항목 1줄 + 페이지 파일 1개"로 끝난다. 멀티콤보·트리콤보가 3개 화면에서 동일 컴포넌트로 동작한다. 빌드 에러 0 |
| **SCOPE** | 1단계(이번): 셸 + 메뉴 3×1 + 콤보 2종 + 하드코딩 데이터 + UI 상태 로컬스토리지. 제외: 백엔드/API, 인증, 그리드 CRUD 저장, TypeScript |

---

## Strategic Alignment Check

### PRD Alignment

PRD 없음 (`docs/00-pm/` 부재). Plan Executive Summary 로 대체.

| Plan 요소 | 기대 | 구현 |
|-----------|------|:----:|
| Problem — 화면마다 셸을 다시 짜는 문제, Quasar→shadcn 대체 미확인 | 확장 지점 2곳 고정 + 콤보 2종 실증 | ✅ Addressed |
| Solution — menu.config 주도 셸 + Combobox multiple 래핑 + 트리 자작 + repository 교체 지점 | 그대로 구현 | ✅ Delivered |
| Function/UX — 3화면 · 콤보 2종 · 접힘/테마 유지 | E2E 14/14 | ✅ Delivered |
| Core Value — "shadcn으로 Quasar 콤보 대체 가능" 실증 | MultiCombo 60줄 래핑 / TreeCombo 자작 (~50줄 JSX + ~120줄 훅) | ✅ Delivered |

### Success Criteria Status

| # | Criteria (Plan FR) | Status | Evidence |
|---|---------------------|:------:|----------|
| FR-01 | 사이드바 대메뉴 3×서브메뉴 1, menu.config 렌더 | ✅ | `config/menu.config.js`, `common/layout/SidebarNav.jsx` · E2E L3 #1 |
| FR-02 | 서브메뉴 클릭 → URL·콘텐츠 변경 | ✅ | `app/router.jsx` (menu.config → routes) · E2E L3 #1 |
| FR-03 | 서브메뉴 추가 = menu.config 1줄 + 페이지 1개 | ✅ | 확장 시연 수행·되돌림 (`shots/07-extension-demo.png`), Design §11.1.1 module-5 |
| FR-04 | MultiCombo 다중선택·칩·검색·배열 onChange | ✅ | `MultiCombo.jsx` · 단위 4건 · E2E L2 #2 |
| FR-05 | TreeCombo N단계·단일선택·검색 경로만·경로 표시 | ✅ | `TreeCombo.jsx` + `useTreeCombo.js` · 단위 9건 · E2E L2 #3, #8 |
| FR-06 | 3페이지 검색조건 + 목록 표 | ✅ | `biz/*/pages/*.jsx` · E2E L2 #1 ×3 |
| FR-07 | 접힘·테마 새로고침 유지 | ✅ | `useLocalStorage.js` · E2E L2 #6, #7 |
| FR-08 | 페이지가 data 직접 import 금지 | ✅ | grep: pages import = `@/common/*`, `@/config/*`, `../services/*` 만 |
| FR-09 | 다크 기본 + 헤더 토글 | ✅ | `index.html class="dark"`, `useTheme.js` · E2E L2 #7 |
| FR-10 | 정의서(표) ↔ mock 필드명 1:1 | ✅ | `common/data/schema.test.js` #8 (`expectExactKeys`) |
| FR-11 | `res.data` 언래핑은 repository 만 | ✅ | grep: 출현 파일 = repository 5개만 |

**Success Rate**: 11/11 criteria met

### Decision Record Verification

| Source | Decision | Followed? | Deviation |
|--------|----------|:---------:|-----------|
| [Plan] | Vite + React 최신 (JS, TS 없음) | ✅ | React 19.3.0 (Plan 시점 19.2 → 초기화 시 최신) |
| [Plan] | shadcn Combobox multiple / 트리 자작 | ✅ | — |
| [Design] | B안: Layered + `common/` + `biz/{md,pp,qm}` | ✅ | — |
| [Design] | TS·JSDoc 없음 → §3.1 정의서 + mock 대조 테스트 | ✅ | — |
| [Design] | `res.data` 는 repository 만 (응답 봉투) | ✅ | `mockClient.js` 가 봉투 생성 |
| [Design] | Base UI 계열 프리미티브로 고정 | ✅ | `shadcn init -b base`, `render` prop |
| [Design] | localStorage 키 2개만 | ✅ | `mes.sidebarCollapsed`, `mes.theme` |
| [Design] | ThemeProvider | ⚠️ 의도적 편차 | Provider 없이 훅만 (§11.1.1 기록) |

---

## 1. Analysis Overview

### 1.1 Analysis Purpose

Design(v0.5) 대비 구현(module-1~5)의 일치율을 정적 3축 + 런타임으로 측정하고, 준 지시("100퍼까지")에 따라 발견된 갭을 **모두 해소한 뒤** 재측정한 결과를 기록한다.

### 1.2 Analysis Scope

- **Design Document**: `docs/02-design/features/mes-basic.design.md` (v0.5 → 갭 반영 후 v0.6)
- **Implementation Path**: `src/` (48 소스 파일 + 12 테스트 파일 + shadcn ui 12), `tests/e2e/mes-basic.spec.js`
- **Analysis Date**: 2026-09-21
- **방법**: gap-detector 에이전트 정적 분석(1차) → 갭 3건 수정 → 본인 재검증(grep·함수길이 스크립트·테스트 재실행)

---

## 2. Gap Analysis (Design vs Implementation)

### 2.1 API Endpoints → Repository Contract (백엔드 없음)

| Design §4.1 | Implementation | Status | Notes |
|--------|---------------|--------|-------|
| `findAll() => Promise<T[]>` via `res.data` | 5 repository 전부 `mockGet(...).then((res) => res.data)` | ✅ Match | |
| `findById(id) => Promise<T\|null>` | item / workOrder / inspection 3개 | ✅ Match | |
| `getCodes(groupId)` | `codeRepository.js` | ✅ Match | 없는 그룹 → `[]` |
| `mockGet` `{ data: 깊은복사 }` | `common/api/mockClient.js` | ✅ Match | 단위 #9 |
| `httpClient.js` (2단계) | 미생성 | ✅ 설계대로 | §11.1 "지금은 미생성" |

### 2.2 Data Model (§3.1 정의서 ↔ mock ↔ 컬럼)

| Entity | 정의서 필드 | mock 키 집합 | 페이지 컬럼 | Status |
|--------|:-----------:|:------------:|:-----------:|:------:|
| MenuItem / MenuGroup | 5+1 / 5 | menu.config | Sidebar·Header | ✅ (`menu.config.test.js`) |
| TreeNode | 4 | equipmentTree.mock 9설비 | TreeCombo | ✅ |
| Item | 6 | 정확 일치 (12건) | 6컬럼 | ✅ |
| WorkOrder | 6 | 정확 일치 (10건) | 6컬럼 | ✅ |
| InspectionResult | 7 | 정확 일치 (10건) | 7컬럼 | ✅ |
| CodeOption | 2 | 3그룹 3/3/4 | MultiCombo | ✅ |

### 2.3 Component Structure

| Design §5.3 | Implementation | Status |
|------------------|---------------------|--------|
| AppShell / Sidebar / Header | `common/layout/*` (+ `SidebarNav`, `menuIcons`) | ✅ |
| ThemeProvider·useTheme / useLocalStorage | `common/hooks/useTheme.js`, `useLocalStorage.js` | ✅ (Provider 생략 — 편차 기록) |
| MultiCombo / TreeCombo / TreeNodeRow / SearchBar / DataTable | `common/components/form/*`, `table/DataTable.jsx` (+ `useTreeCombo.js`) | ✅ |
| ItemPage / WorkOrderPage / InspectionPage | `biz/{md,pp,qm}/pages/*.jsx` | ✅ |
| router / ErrorBoundary / NotFound | `app/*` (+ `PageFallback.jsx`) | ✅ |
| §11.1 파일 50개 | 50/50 + 편차 추가분 | ✅ |

**Structural Match Rate**: 68/68 = **100%**

### 2.4 Functional Depth Analysis

| File | Depth | Placeholder | Missing |
|------|:-----:|-------------|---------|
| `biz/*/pages/*.jsx` ×3 | 100 | 없음 | 없음 |
| `MultiCombo.jsx` / `TreeCombo.jsx` + `useTreeCombo.js` | 100 | 없음 | 없음 |
| `DataTable.jsx` / `SearchBar.jsx` | 100 | 없음 | 없음 (error 표시 추가됨) |
| `useSearch.js` | 100 | 없음 | 없음 (error 상태 추가됨) |
| 셸·훅·repository·service | 100 | 없음 | 없음 |

grep: `TODO|FIXME|console.log` 0건 (console.error 는 ErrorBoundary 1곳). **Shallow File Count**: 0 / 48

### 2.5 Page UI Checklist Verification (§5.4)

| Page | Design Elements | Implemented | Missing | Rate |
|------|:--------------:|:-----------:|:-------:|:----:|
| 공통 셸 | 8 | 8 | 0 | 100% |
| 품목관리 MD_ITEM_0010 | 7 | 7 | 0 | 100% |
| 작업지시 PP_WO_0010 | 6 | 6 | 0 | 100% |
| 검사결과 QM_INSP_0010 | 6 | 6 | 0 | 100% |
| 확장 시연 | 1 | 1 (수동·되돌림) | 0 | 100% |
| §5.3 props 정의서 | 11 | 11 | 0 | 100% |
| 표시값·검색 동작 | 2 | 2 | 0 | 100% |
| §6.1 에러 처리 | 6 | 6 | 0 | 100% (1차 5/6 → Gap #1 해소) |

**Functional Match Rate**: 47/47 = **100%**

### 2.6 API Contract Verification → Repository/Service/Import Contract

| # | 계약 | Design | Impl | Contract |
|---|------|:------:|:----:|:--------:|
| 1 | repository 5개 `.then((res) => res.data)` | ✅ | ✅ | PASS |
| 2 | `res.data` 출현 = repository 5파일만 | ✅ | ✅ | PASS |
| 3 | service 3개 criteria 키 = 페이지 criteria 키 | ✅ | ✅ | PASS |
| 4 | §3.1 필드명 = mock = 컬럼 (8 엔티티) | ✅ | ✅ | PASS |
| 5 | §9.3 import 규칙 6종 (pages/services/repositories/common/app/모듈 간) | ✅ | ✅ | PASS |
| 6 | §10.1 명명 12종 (모듈코드·화면ID·key·라우트·파일·상수) | ✅ | ✅ | PASS |

**Contract Failures**: 없음
**Contract Match Rate**: 26/26 = **100%**

### 2.7 Runtime Verification Results

#### L1: API Endpoint Tests

N/A — 백엔드 없음. Design §8.1 대로 repository 계약은 Vitest `repositories.test.js` (5 repo × 불변성 + findById 경계) 로 대체. **62/62 단위 테스트 통과.**

#### L2: UI Action Tests (Playwright, `tests/e2e/mes-basic.spec.js`)

| # | Page | Action | Expected Result | Pass |
|---|------|--------|----------------|:----:|
| 1 | 품목관리·작업지시·검사결과 | 로드 | 화면ID·breadcrumb·콤보·트리·키워드·버튼·행수 ≥ seed | ✅ ×3 |
| 2 | 품목관리 | RAW+FIN → 조회 | 유형 컬럼 원자재/완제품만 | ✅ |
| 3 | 품목관리 | 트리 검색 "프레스" → 선택 → 조회 | 표시값 경로, 설비 컬럼 일치 | ✅ |
| 4 | 작업지시 | RUNNING → 조회 → 초기화 | 건수 감소·`data-code=RUNNING`·전체 복귀 | ✅ |
| 5 | 검사결과 | DIM+VIS → 조회 | 각 행 칩에 DIM 또는 VIS, 결과 배지 PASS/FAIL | ✅ |
| 6 | 셸 | 접기 → 새로고침 | `data-collapsed=true`, localStorage `true` | ✅ |
| 7 | 셸 | 테마 토글 → 새로고침 | `<html>` dark 없음, localStorage `"light"` | ✅ |
| 8 | 품목관리 | TreeCombo ↓↓ Enter | 3번째 노드 "1공장 › 2라인" (Gap #2 해소 후 ↓↓) | ✅ |

**L2 Score**: 10/10 = 100%

#### L3: E2E Scenario Tests

| # | Scenario | Steps | Result | Pass |
|---|----------|:-----:|--------|:----:|
| 1 | 3화면 순회 | 4 | `/`→`/md/item`, 화면ID MD→PP→QM | ✅ |
| 2 | 조건 비저장 | 5 | 키워드 "모듈" 3건 → 이동·복귀 → 빈 조건 12건 | ✅ |
| 3 | 확장 시연 | 수동 | menu.config 1줄 + 페이지 1개 → 자동 반영 (`shots/07`) — 코드 변경 필요라 자동화 제외 | ✅ (수동) |
| 4 | 375px 반응형 | 4 | 사이드바 숨김 → Sheet → 이동 → 닫힘 | ✅ |
| + | NotFound | 1 | "화면을 찾을 수 없습니다" | ✅ |

**L3 Score**: 4/4 (자동 3 + 수동 1) = 100%

**Runtime Match Rate**: L1 N/A → L2·L3 로 재정규화 = (100 × 0.5 + 100 × 0.5) = **100%**

### 2.8 Match Rate Summary

```
┌─────────────────────────────────────────────┐
│  Structural Match Rate:  100%  (68/68)       │
│  Functional Match Rate:  100%  (47/47)       │
│  Contract Match Rate:    100%  (26/26)       │
│  Runtime Match Rate:     100%  (L2 10/10 · L3 4/4)│
│  ─────────────────────────────────────────── │
│  Overall Match Rate:     100%                │
│  = (100 × 0.15) + (100 × 0.25)              │
│    + (100 × 0.25) + (100 × 0.35)            │
├─────────────────────────────────────────────┤
│  1차(gap-detector, 수정 전): Functional 98%  │
│  → Overall 99.5% → 갭 3건 수정 → 100%        │
└─────────────────────────────────────────────┘
```

### 2.9 발견된 갭과 조치 (1차 → 2차)

| # | 심각도 | 갭 | 조치 | 검증 |
|---|--------|-----|------|------|
| 1 | Important | Design §6.1 "repository 실패 → page error 표시" 미구현. `useSearch` 에 catch 없음 → unhandled rejection 잠재 | `useSearch` 에 `error` 상태 + `.catch`, `DataTable error` prop → `role=alert` 표시, 3페이지 전달. `useCodes`/`useEquipmentTree` 도 실패 흡수 | `useSearch.test.js` 4건, `DataTable.test.jsx` +1 |
| 2 | Minor | Design §8.3 #8 "↓↓ Enter → 3번째" vs 코드 "↓↓↓" (열 때 하이라이트 없음) | 열 때 첫 행(또는 선택된 행) 하이라이트 — 콤보 관례. 단위·E2E #8 을 ↓↓ 로 | `TreeCombo.test.jsx` #8 + 2건, E2E #8 |
| 3 | Minor | Plan §4.2 "함수 50줄 초과 없음" — TreeCombo 컴포넌트 168줄, 페이지 56~68줄 | TreeCombo 로직을 `useTreeCombo.js` (useTreeExpansion·useTreeHighlight·treeKeyAction 으로 분할) 로 추출, 페이지 컬럼을 `buildColumns()` 로 분리 | 함수 길이 스크립트: 67개 함수 중 50줄 초과 **0** (최장 DataTable 49줄) |

---

## 3. Code Quality Analysis

### 3.1 Complexity

| File | Function | 줄수 | Status |
|------|----------|:----:|--------|
| `DataTable.jsx` | DataTable | 49 | ✅ (JSX 위주) |
| `TreeCombo.jsx` | TreeCombo | 47 | ✅ |
| `useTreeCombo.js` | useTreeCombo | 46 | ✅ |
| `Header.jsx` | Header | 46 | ✅ |
| 나머지 63개 | — | ≤ 42 | ✅ |

### 3.2 Code Smells

| Type | 위치 | 설명 | Severity |
|------|------|------|----------|
| 유사 구조 | `biz/*/pages/*.jsx` ×3 | 컬럼·조건만 다른 같은 골격 (의도된 교과서형). 화면 5개 이상이면 템플릿화 검토 | 🟢 |
| 이름 | `common/components/StatusBadge.jsx` | 상태+결과 둘 다 담당 → `CodeBadge` 가 정직 (`/simplify` 후보) | 🟢 |

### 3.3 Security

| Severity | 항목 | 결과 |
|----------|------|------|
| 🟢 | `dangerouslySetInnerHTML` | 0건 |
| 🟢 | 시크릿·`.env` | 없음 |
| 🟢 | localStorage 내용 | UI 상태 2키만 |

---

## 4. Performance Analysis

N/A (mock 데이터 ≤ 12건, 즉시 응답). 빌드 산출: `index` 471KB(gzip 154KB), 페이지별 lazy chunk 분리 확인.

---

## 5. Test Coverage

### 5.1 Coverage Status

| Area | 건수 | 대상 |
|------|:----:|------|
| Vitest 단위 | 62 (12파일) | tree/treeView/criteria 유틸, mockClient, schema(#8), repository ×5, service ×3, useLocalStorage, useSearch, menu.config, MultiCombo, TreeCombo, DataTable |
| Playwright E2E | 14 | L2 #1~8 (10), L3 #1·2·4 + NotFound |
| 수동 | 1 | L3 #3 확장 시연 |

### 5.2 Uncovered Areas

- `app/ErrorBoundary.jsx` 렌더 실패 경로 (lazy import 실패 재현이 어려움 — 2단계 API 도입 시 네트워크 실패로 검증 권장)
- `SidebarNav` 접힘 모드의 Tooltip 표시 (수동 확인만)

---

## 6. Clean Architecture Compliance

### 6.1 Layer Dependency Verification

| Layer | Expected | Actual (grep) | Status |
|-------|----------|---------------|--------|
| Presentation (`biz/*/pages`, `common/components`, `common/layout`, `common/hooks`) | common, own services | `@/common/*`, `@/config/*`, `../services/*` | ✅ |
| Application (`biz/*/services`) | own repositories, common/utils, common/repositories | 정확히 그 3종 | ✅ |
| Domain (`common/utils`) | 없음 | 내부만 | ✅ |
| Infrastructure (`*/repositories`, `common/api`, `*/data`) | own data, common/api | 정확히 그 2종 | ✅ |

### 6.2 Dependency Violations

없음. (1차에서 `ItemPage` → `common/data/codes.mock` 직접 import 를 grep 이 잡아 `config/codeGroups.js` 로 분리 — Design §11.1.1 module-3·4 기록)

### 6.3 Layer Assignment

Design §9.4 표 그대로. 추가분: `useTreeCombo.js`(Presentation, 컴포넌트 옆), `useSearch.js`/`useCodes.js`/`useEquipmentTree.js`(Presentation 훅), `criteria.js`/`treeView.js`(Domain).

### 6.4 Architecture Score

```
┌─────────────────────────────────────────────┐
│  Architecture Compliance: 100%               │
│  ✅ 계층 배치 정확:   48/48 파일              │
│  ⚠️ 의존성 위반:      0                       │
│  ❌ 잘못된 계층:      0                       │
└─────────────────────────────────────────────┘
```

---

## 7. Convention Compliance

### 7.1 Naming

| Category | Convention | 검사 | Compliance |
|----------|-----------|:----:|:----------:|
| 모듈코드 / 화면ID / 메뉴 key / 라우트 | `md` · `MD_ITEM_0010` · `md.item` · `/md/item` | 3+3+3+3 (테스트 강제) | 100% |
| 컴포넌트 / 훅 / service / repository / mock | PascalCase.jsx · useXxx.js · xxxService · xxxRepository · xxx.mock → XXX_MOCK | 전 파일 | 100% |
| 상수 | UPPER_SNAKE | STORAGE_KEYS, CODE_GROUPS, DEFAULT_*, FIRST_ROW 등 | 100% |
| 응답 변수 | `res` | repository 5/5 | 100% |

### 7.2 Folder Structure

Design §11.1 전부 존재 + 편차 추가분(§11.1.1) 기록. `types/` 없음(설계대로).

### 7.3 Import Order

react → 외부 → `@/` → 상대 — 페이지·서비스·훅 전부 준수.

### 7.4 Environment Variables

없음 (1단계). `VITE_API_BASE_URL` 예약.

### 7.5 Convention Score: **100%**

---

## 8. Overall Score

```
┌─────────────────────────────────────────────┐
│  Overall Score: 100/100                      │
├─────────────────────────────────────────────┤
│  Design Match:        100 (구조·기능·계약·런타임)│
│  Code Quality:        100 (50줄 초과 0, placeholder 0)│
│  Security:            100                    │
│  Testing:             100 (단위 62 · E2E 14 · 수동 1)│
│  Architecture:        100                    │
│  Convention:          100                    │
└─────────────────────────────────────────────┘
```

---

## 9. Recommended Actions

### 9.1 Immediate

없음 — 갭 3건 전부 해소.

### 9.2 Short-term (`/simplify` 후보)

| Priority | Item | File | Expected Impact |
|----------|------|------|-----------------|
| 🟢 | `StatusBadge` → `CodeBadge` 개명 | `common/components/StatusBadge.jsx` | 이름이 역할과 일치 |
| 🟢 | `useSearch` → `useListQuery` 개명 검토 | `common/hooks/useSearch.js` | 전역 검색창 도입 시 충돌 방지 |

### 9.3 Long-term (2단계)

| Item | Notes |
|------|-------|
| `httpClient.js` (axios) 도입 | repository 5파일 `mockGet` → `httpClient.get` 교체만. 공통 응답 규격 확정 시 `res.data.data` |
| 화면 5개 이상 시 `SearchListPage` 템플릿 | 3페이지 동일 골격 접기 |
| E2E 에 지연 응답 케이스 | `mockGet(rows, 300)` 로 레이스 재현 |

---

## 10. Design Document Updates Needed

- [x] §11.1.1 에 Gap 조치 편차 추가 (useTreeCombo 분리, useSearch error, buildColumns, useCodes/useEquipmentTree catch) → Design v0.6
- [x] §8.3 #8 "↓↓ Enter" — 코드가 문서에 맞춰짐 (문서 변경 없음)

---

## 11. Next Steps

- [x] Critical/Important 수정 (Gap #1)
- [x] Design 문서 갱신 (v0.6)
- [ ] `/pdca report mes-basic` — 완료 보고서

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-09-21 | 1차 정적 분석 99.5% → 갭 3건 수정 → 재검증 100% | 앨리 + 준 |
