# mes-basic Planning Document

> **Summary**: React 최신 + shadcn/ui 기반, 좌측 대메뉴(기준정보·생산·품질) + 서브메뉴 1개씩을 갖춘 **확장 가능한 MES 골격(shell)**. 백엔드 없이 하드코딩 데이터로 동작하며, 멀티콤보·트리콤보 공용 컴포넌트를 포함한다.
>
> **Project**: mes-basic (`claude-code3/mes-basic/` — 문서·코드·bkit 상태 모두 이 폴더 안)
> **Version**: 0.1.0 (신규)
> **Author**: 준 (주영준) + 앨리
> **Date**: 2026-09-21
> **Status**: Draft

---

## Executive Summary

| Perspective | Content |
|-------------|---------|
| **Problem** | MES 화면을 하나씩 만들 때마다 레이아웃·메뉴·콤보를 다시 짜면 확장이 안 된다. Quasar(QSelect multiple 등)에 익숙하지만 React를 쓰는 순간 Quasar는 못 쓰므로, shadcn이 그 자리를 대신할 수 있는지 확인 안 된 상태다. |
| **Solution** | "메뉴 정의 한 곳(`menu.config.js`)에 항목 추가 → 페이지 파일 하나 추가"만으로 화면이 늘어나는 셸을 만든다. 멀티콤보는 shadcn 정식 `Combobox(multiple)`로, 트리콤보는 shadcn 프리미티브(Popover 등) 위에 자작한다. 데이터는 `data/` 하드코딩 → 나중에 저장소 레이어만 교체. |
| **Function/UX Effect** | 좌측 사이드바에 대메뉴 3개(기준정보·생산·품질), 각 1개 서브메뉴(품목관리·작업지시·검사결과). 클릭하면 우측에 해당 화면. 각 화면에 멀티콤보·트리콤보 데모 포함. 사이드바 접힘/다크모드는 로컬스토리지에 유지. |
| **Core Value** | "shadcn으로 Quasar 콤보를 대체 가능한가"에 대한 실증 답 + 이후 MES 화면을 붙일 때 다시 안 짜도 되는 확장 골격. |

---

## Context Anchor

> Design/Do 문서로 전파되는 앵커. 세션이 바뀌어도 "왜 만드는지"를 잃지 않기 위함.

| Key | Value |
|-----|-------|
| **WHY** | MES 화면을 늘려도 셸(레이아웃·메뉴·공용 콤보)을 다시 짜지 않게 하고, Quasar 없이 shadcn으로 멀티/트리 콤보가 되는지 실증한다 |
| **WHO** | 준 본인 (1인 기업용 MES 기반 확보, React/shadcn 학습 겸용) |
| **RISK** | 트리콤보를 자작하다 셸 목적을 잊고 트리 컴포넌트 완성도에 매몰되는 것 / TS 없는 JS라 데이터 형태가 문서화 안 되면 확장 시 깨짐 |
| **SUCCESS** | 새 서브메뉴 1개 추가가 "menu.config.js 항목 1줄 + 페이지 파일 1개"로 끝난다. 멀티콤보·트리콤보가 3개 화면에서 동일 컴포넌트로 동작한다. 빌드 에러 0 |
| **SCOPE** | 1단계(이번): 셸 + 메뉴 3×1 + 콤보 2종 + 하드코딩 데이터 + UI 상태 로컬스토리지. 제외: 백엔드/API, 인증, 그리드 CRUD 저장, TypeScript |

---

## 1. Overview

### 1.1 Purpose

- 🟢 초딩용: 집을 지을 때 "뼈대"부터 세운다. 방(화면)은 나중에 하나씩 붙인다. 이번엔 뼈대와 문(메뉴), 그리고 방마다 쓸 "고르기 상자(콤보)" 두 종류를 만든다.
- 🔵 개발자용: 라우팅·레이아웃·메뉴 레지스트리·공용 폼 컴포넌트를 갖춘 React SPA 셸을 만든다. 도메인 화면은 플러그인처럼 추가되도록 메뉴 정의와 페이지를 분리한다.

### 1.2 Background

- 준은 Quasar(Vue)의 QSelect(multiple), 트리 셀렉트에 익숙하다. React를 선택하면 Quasar는 Vue 전용이라 사용 불가.
- shadcn/ui는 "완성 라이브러리"가 아니라 "복사해 쓰는 소스 컴포넌트"라, 무엇이 되고 무엇이 자작인지 미리 판정해야 한다.
- 백엔드는 나중. 지금은 소스 하드코딩으로 화면을 먼저 세운다.

### 1.3 Related Documents

- 이전 표본: `../claude-code3/docs/01-plan/features/vue3-search-screen.plan.md` (상위 작업장 루트 docs, Output-first 읽기 훈련용 Vue3 조회화면)
- shadcn Combobox 공식 문서 (context7 `/shadcn-ui/ui`, 2026-09-21 확인): `multiple` prop + `ComboboxChips` 지원, `ComboboxGroup`은 1단계 그룹까지
- shadcn JavaScript 지원: CLI `TypeScript? no`, `jsconfig.json` `paths` alias

---

## 2. Scope

### 2.1 In Scope

- [ ] Vite + React 19.x(최신 안정판) + **JavaScript(JSX)** 프로젝트 초기화 (프로젝트 루트 = `mes-basic/`, 코드는 `mes-basic/src/`)
- [ ] shadcn/ui 초기화(JS 모드) + Tailwind, 다크모드 기본 + 토글
- [ ] 좌측 사이드바: 대메뉴 3개 × 서브메뉴 1개, 접힘/펼침, 현재 메뉴 하이라이트
- [ ] 메뉴 레지스트리 `menu.config.js` — 메뉴 항목이 라우트·아이콘·페이지 컴포넌트를 한 곳에서 선언
- [ ] 페이지 3개: 기준정보 › 품목관리, 생산 › 작업지시, 품질 › 검사결과 (검색조건 + 목록 표, 하드코딩 데이터)
- [ ] 공용 컴포넌트 `MultiCombo` (shadcn Combobox `multiple` 래핑)
- [ ] 공용 컴포넌트 `TreeCombo` (shadcn Popover + 자작 트리, 펼침/접힘, 검색)
- [ ] 저장소 추상화 `repositories/` — 지금은 `data/*.js` 하드코딩 반환, 나중에 API로 교체
- [ ] 로컬스토리지 훅 `useLocalStorage` — 사이드바 접힘, 테마만 저장 (필요한 곳만)
- [ ] 데이터 형태 문서화 — Design §3 **인터페이스 정의서(표)**. 코드에는 타입·JSDoc 없음(덕 타이핑)
- [ ] 응답 봉투 패턴 준비 — mock도 axios처럼 `{ data }` 봉투로 반환, `res.data` 언래핑은 repository만

### 2.2 Out of Scope

- 백엔드/API 연동, 인증/권한, 실제 CRUD 저장 (로컬스토리지에 레코드 저장도 제외 — "필요할 때만" 원칙)
- TypeScript, JSDoc 타입 주석 (둘 다 미사용 — 준 결정 2026-09-21)
- axios 설치 (2단계. 1단계는 봉투 모양만 맞춤)
- 페이징·정렬·엑셀 등 그리드 고급 기능
- 대메뉴 4개 이상, 서브메뉴 2개 이상 (구조만 확장 가능하게)

---

## 3. Requirements

### 3.1 Functional Requirements

| ID | Requirement | Priority | Status |
|----|-------------|----------|--------|
| FR-01 | 좌측 사이드바에 대메뉴 3개(기준정보·생산·품질)와 각 서브메뉴 1개가 `menu.config.js`에서 렌더링된다 | High | Pending |
| FR-02 | 서브메뉴 클릭 시 URL이 바뀌고 우측 콘텐츠 영역에 해당 페이지가 표시된다 (react-router) | High | Pending |
| FR-03 | 새 서브메뉴 추가가 `menu.config.js` 항목 1개 + 페이지 파일 1개로 끝난다 (라우트 자동 생성) | High | Pending |
| FR-04 | `MultiCombo`: 다중 선택, 선택값 칩 표시, 검색 필터, 값 배열 `onChange` | High | Pending |
| FR-05 | `TreeCombo`: 계층 데이터(N단계) 펼침/접힘, 단일 선택, 검색 시 매칭 경로만 표시, 선택값 경로 표시("공장A > 라인1") | High | Pending |
| FR-06 | 3개 페이지 각각 검색조건 영역(MultiCombo·TreeCombo 포함) + 목록 표(하드코딩 데이터) | High | Pending |
| FR-07 | 사이드바 접힘 상태·다크/라이트 테마가 새로고침 후 유지된다 (로컬스토리지) | Medium | Pending |
| FR-08 | 데이터 접근은 `repositories/*.js`를 통해서만 — 페이지가 `data/*.js`를 직접 import 하지 않는다 | Medium | Pending |
| FR-09 | 다크모드 기본 + 헤더에 토글 버튼 | Medium | Pending |
| FR-10 | 각 데이터 형태(품목·작업지시·검사결과·메뉴·트리노드)가 Design §3 인터페이스 정의서(표)로 문서화되고, mock 필드명이 정의서와 1:1 일치한다(테스트로 대조) | Medium | Pending |
| FR-11 | repository는 `res.data`로 봉투를 벗겨 배열/객체만 돌려준다. service·page는 봉투를 모른다 (2단계 axios 교체 시 repository만 수정) | Medium | Pending |

### 3.2 Non-Functional Requirements

| Category | Criteria | Measurement Method |
|----------|----------|-------------------|
| 확장성 | 서브메뉴 추가 시 수정 파일 ≤ 2개 | 4단계 실제로 1개 추가해 파일 수 세기 |
| 빌드 | `pnpm build` 에러 0, ESLint 에러 0 | CI 없이 로컬 실행 결과 첨부 |
| 안전성 | 로컬스토리지 접근은 try/catch, 실패 시 기본값 | 코드 리뷰 + 프라이빗 창 테스트 |
| 접근성 | 콤보 키보드 조작(↑↓ Enter Esc) 동작 | shadcn/Base UI 기본 + 트리는 수동 확인 |
| 반응형 | 모바일 폭에서 사이드바 오버레이 전환 | 브라우저 리사이즈 확인 |

---

## 4. Success Criteria

### 4.1 Definition of Done

- [ ] FR-01~FR-11 구현
- [ ] `pnpm build` 성공, lint 에러 0
- [ ] dev 서버에서 3개 페이지 + 콤보 2종 + 접힘/테마 유지를 직접 눈으로 확인 (스크린샷)
- [ ] "서브메뉴 1개 추가" 시연: 파일 2개 이내로 새 화면이 뜬다
- [ ] Design 문서에 인터페이스 정의서 및 확장 절차 기록

### 4.2 Quality Criteria

- [ ] 페이지 컴포넌트가 `data/`를 직접 import 하지 않음 (grep 검증)
- [ ] `TreeCombo`, `MultiCombo`가 페이지 3곳에서 동일 컴포넌트로 사용됨
- [ ] 파일 300줄 / 함수 50줄 초과 없음
- [ ] 콘솔 에러·경고 0 (dev 서버 기준)

---

## 5. Risks and Mitigation

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| 트리콤보 자작이 셸보다 커진다 (검색·다중선택·체크박스 등 욕심) | High | High | 1단계는 **단일 선택 + 펼침/접힘 + 검색**만. 나머지는 Out of Scope 명시 |
| shadcn 신형 `Combobox`(Base UI)와 구형 Popover+Command 혼용으로 스타일 불일치 | Medium | Medium | Design에서 프리미티브 계열을 하나로 고정 (Base UI 계열 우선, 트리도 같은 Popover 사용) |
| TS·JSDoc 없어서 데이터 형태가 암묵적 → 확장 시 필드명 오타로 깨짐 | Medium | High | Design §3 인터페이스 정의서를 유일한 계약으로 + mock 필드명 대조 테스트 + `res.data` 언래핑을 repository 한 곳에 고정(오타가 나면 한 파일만 본다) |
| React 19.x 최신에서 일부 서드파티(react-router 등) 호환 이슈 | Medium | Low | 초기화 시 `npm view` 로 버전 확인, peer 경고 시 문서에 기록 |
| 로컬스토리지가 "필요할 때만"인데 범위가 슬금슬금 늘어남 | Low | Medium | 저장 키를 `storageKeys.js` 한 곳에 상수로 관리, 추가 시 Plan 갱신 |
| 한국어 검색(초성 등) 요구가 나중에 나옴 | Low | Medium | 1단계는 `includes` 매칭. 필터 함수를 분리해 교체 가능하게 |

---

## 6. Impact Analysis

### 6.1 Changed Resources

| Resource | Type | Change Description |
|----------|------|--------------------|
| `mes-basic/` | 신규 프로젝트 폴더 | 전부 신규. 기존 코드 변경 없음. Vite 프로젝트 루트이자 docs/.bkit 루트 |
| `mes-basic/docs/01-plan/features/mes-basic.plan.md` | 문서 | 본 문서 |
| `mes-basic/.bkit/state/pdca-status.json` | 상태 | `mes-basic` 피처 (상위 작업장 상태 파일과 분리) |

### 6.2 Current Consumers

| Resource | Operation | Code Path | Impact |
|----------|-----------|-----------|--------|
| (없음) | — | 신규 폴더라 기존 소비자 없음 | None |

### 6.3 Verification

- [x] 기존 프로젝트(`vue3-search`, `gooji-react` 등)와 폴더가 겹치지 않음
- [x] 인증/권한 변경 없음
- [x] 기존 쿼리/스키마 변경 없음

---

## 7. Architecture Considerations

### 7.1 Project Level Selection

| Level | Characteristics | Recommended For | Selected |
|-------|-----------------|-----------------|:--------:|
| **Starter** | Simple structure (`components/`, `lib/`, `types/`) | Static sites, portfolios, landing pages | ☐ |
| **Dynamic** | Feature-based modules, BaaS integration | Web apps with backend, SaaS MVPs | ☑ |
| **Enterprise** | Strict layer separation, DI, microservices | High-traffic systems | ☐ |

> Dynamic 선택 이유: 지금은 백엔드가 없지만 **도메인별 feature 모듈 + 저장소 레이어**가 필요하다. bkend.ai는 쓰지 않고 저장소 인터페이스만 둔다.

### 7.2 Key Architectural Decisions

| Decision | Options | Selected | Rationale |
|----------|---------|----------|-----------|
| Framework | Next.js / Vite+React / Vue | **Vite + React 19.x (JS)** | 백엔드 없음 → SSR 불필요. 준 결정: TS 미사용 |
| UI Kit | Quasar / MUI / shadcn | **shadcn/ui (JS 모드)** | Quasar는 Vue 전용. shadcn `Combobox multiple` 정식 지원 확인 |
| Multi Combo | 자작 / shadcn Combobox | **shadcn `Combobox` + `multiple` 래핑** | 공식 지원, 조립 불필요 |
| Tree Combo | 커뮤니티 확장 / 자작 | **자작 (shadcn Popover + 재귀 트리)** | shadcn 코어에 트리 없음. 1단계 그룹(`ComboboxGroup`)으론 부족 |
| Routing | react-router / TanStack Router | **react-router** | 가장 보편적, 메뉴 레지스트리에서 라우트 자동 생성 |
| State Management | Context / Zustand | **Context + useState** (1단계) | 셸 상태(테마·접힘)만. 전역 스토어는 필요 생기면 |
| Data Access | 직접 import / repository | **`repositories/*.js`** | 하드코딩 → API 교체 지점을 한 곳으로 |
| HTTP Client | fetch / axios | **axios (2단계 설치)** | 준 결정. 1단계 mock도 axios 봉투 `{ data }` 모양으로 반환해 `res.data` 경로를 미리 고정 (응답 봉투 패턴) |
| Persistence | 없음 / localStorage / API | **localStorage (UI 상태만)** | 준 결정: 필요할 때만 |
| Styling | Tailwind | **Tailwind v4 (shadcn 기본)** | 다크모드 기본 + 토글 |
| Type Safety | TS / JSDoc / 없음 | **없음 — 인터페이스 정의서(문서) + 덕 타이핑** | 준 결정: TS·JSDoc 모두 미사용. SI 관례(I/F 정의서)로 계약, mock 필드명 대조 테스트로 안전망 |
| Testing | Vitest / Playwright | **Vitest (콤보 로직) + 수동 dev 검증** | 1단계 최소 |
| Backend | 없음 | **없음 (추후)** | 저장소 레이어만 준비 |

### 7.3 Clean Architecture Approach

> ⚠️ 아래는 Plan 시점의 C안(실용) 스케치. Design §2.0에서 **B안(SI 표준: `common/` + `biz/{md,pp,qm}`)** 이 선택되어 실제 폴더 구조는 **Design §11.1이 기준**이다. 확장 지점 2곳(menu.config / repositories)과 의존 방향 원칙은 동일.

```
Selected Level: Dynamic (BaaS 없이 저장소 레이어만)

mes-basic/src/
├── app/                # 셸: 라우터·레이아웃·테마 Provider
│   ├── App.jsx
│   ├── router.jsx      # menu.config → routes 자동 생성
│   └── layout/         # AppShell, Sidebar, Header
├── config/
│   ├── menu.config.js  # ★ 확장 지점: 대메뉴/서브메뉴/페이지 매핑
│   └── storageKeys.js  # 로컬스토리지 키 상수
├── components/
│   ├── ui/             # shadcn 생성 컴포넌트 (수정 최소)
│   └── form/           # MultiCombo.jsx, TreeCombo.jsx (공용)
├── features/           # 도메인별 화면
│   ├── master/         # 기준정보 › 품목관리
│   ├── production/     # 생산 › 작업지시
│   └── quality/        # 품질 › 검사결과
├── repositories/       # ★ 교체 지점: 지금은 data/ 반환, 나중엔 API
├── data/               # 하드코딩 샘플 데이터
├── hooks/              # useLocalStorage 등
└── api/                # mockClient.js (1단계) → httpClient.js (2단계 axios). 타입 파일 없음 — 형태는 Design §3 정의서

의존 방향: features → components/form → components/ui
           features → repositories → data
           (features가 data를 직접 import 금지)
```

---

## 8. Convention Prerequisites

### 8.1 Existing Project Conventions

- [x] 전역 `~/.claude/CLAUDE.md` 코딩 규칙 존재 (early return, 상수 추출, 300줄/50줄, pnpm)
- [ ] `docs/01-plan/conventions.md` 없음
- [ ] ESLint — Vite 템플릿 기본 생성 예정
- [ ] Prettier — 미정
- [ ] `tsconfig.json` — **사용 안 함** → `jsconfig.json`으로 대체

### 8.2 Conventions to Define/Verify

| Category | Current State | To Define | Priority |
|----------|---------------|-----------|:--------:|
| **Naming** | missing | 컴포넌트 PascalCase.jsx, 훅 `useXxx.js`, 저장소 `xxxRepository.js`, 메뉴 key는 `master.item` 형식 | High |
| **Folder structure** | missing | 7.3 구조 고정 | High |
| **Data shape** | missing | Design §3 인터페이스 정의서(표)가 유일한 계약. mock 필드명 1:1, 코드에 타입 주석 없음 | High |
| **Response handling** | missing | `res.data` 언래핑은 repository 안에서만. service/page는 배열·객체만 받음 | High |
| **Import order** | missing | react → 외부 → `@/` 절대경로 → 상대 | Medium |
| **Storage keys** | missing | `storageKeys.js` 단일 관리, prefix `mes.` | Medium |
| **Error handling** | missing | 로컬스토리지 try/catch 기본값, 저장소는 Promise 반환(추후 API 대비) | Medium |

### 8.3 Environment Variables Needed

| Variable | Purpose | Scope | To Be Created |
|----------|---------|-------|:-------------:|
| (없음) | 1단계는 백엔드 없음 | — | ☐ |
| `VITE_API_BASE_URL` | 추후 API 연동 시 | Client | ☐ (2단계) |

### 8.4 Pipeline Integration

| Phase | Status | Document Location | Command |
|-------|:------:|-------------------|---------|
| Phase 1 (Schema) | ☐ | Design §3 인터페이스 정의서로 대체 | — |
| Phase 2 (Convention) | ☐ | 8.2 표로 대체 | — |

---

## 9. Next Steps

1. [x] Design 문서 작성 (`/pdca design mes-basic`) — B안(SI 표준) 선택, 메뉴 레지스트리·트리콤보 구조·인터페이스 정의서 확정 (2026-09-21)
2. [ ] 프로젝트 초기화: `npx shadcn@latest init -t vite` (TypeScript: no), React 버전 `npm view react version`으로 재확인
3. [ ] 구현 순서: 셸/메뉴 → 페이지 3개(표만) → MultiCombo → TreeCombo → 로컬스토리지 → 서브메뉴 추가 시연
4. [ ] `/pdca analyze mes-basic`

### 미확정 사항 (Design 단계에서 결정)

| 항목 | 기본 가정 | 준 확인 필요 |
|------|-----------|-------------|
| 트리콤보 데이터 예시 | 공장 › 라인 › 설비 3단계 | 다른 계층(품목분류 등) 원하면 변경 |
| 멀티콤보 데이터 예시 | 품목유형·공정·검사항목 | — |
| 표 컴포넌트 | shadcn `Table` (페이징 없음) | 그리드 라이브러리(TanStack Table) 원하면 2단계 |
| 사이드바 폭/접힘 방식 | 아이콘만 남는 mini 모드 | 완전 숨김 원하면 변경 |

---

## Version History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 0.1 | 2026-09-21 | Initial draft — Quasar 불가 판정, shadcn 콤보 커버리지(멀티 ✅ / 트리 자작) 확정 | 준 + 앨리 |
