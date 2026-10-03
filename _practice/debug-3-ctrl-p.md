# 크롬 개발자도구 Ctrl+P — 왜 파일이 안 나올까? (lazy loading 이해하기)

> 작성: 2026-10-02 · 대상: 준
> 읽는 순서: `debug-1-principle.md`(배제법 원칙) → `debug-2-breakpoint.md`(브레이크포인트) → **3 파일 찾기(이 문서)** → `debug-4-walkthrough-03.md`(따라하기)
> 계기: 품목관리 화면만 열어 둔 상태에서 Ctrl+P로 `inspectionService.js`를 찾았는데 안 나옴

---

## 0. 한 줄 정답

> **Ctrl+P는 "내 컴퓨터 폴더"가 아니라 "브라우저가 지금까지 받은 파일"에서 찾는다.**
> 이 프로젝트는 화면 파일을 **메뉴를 눌렀을 때 받는다(lazy loading).** 그래서 안 연 화면의 파일은 안 나온다.

---

## 1. 🧸 도서관으로 이해하기

| 도서관 | 개발 환경 |
|---|---|
| 📚 **도서관 서고** — 책이 전부 있음 | **개발 서버** (`pnpm dev`) — `src/` 파일이 전부 있음 |
| 🪑 **내 책상** — 빌려 온 책만 있음 | **브라우저 탭** — 받은 파일만 있음 |
| 🔍 **책상 위에서 책 찾기** | **Ctrl+P** (개발자도구 Sources) |
| 📖 **필요할 때 빌리러 가기** | **lazy loading** — 화면을 열 때 그 화면 파일을 받음 |

- 품목관리 화면을 열면 → 품목관리 책들(`ItemPage.jsx`, `itemService.js` …)을 빌려 옴
- 검사 화면은 안 열었음 → 검사 책들(`InspectionPage.jsx`, `inspectionService.js` …)은 **아직 서고에 있음**
- 그래서 책상(Ctrl+P)에서 `inspectionService`를 찾으면 → **없음**

**해결은 간단하다: 검사 화면을 한 번 연다 = 책을 빌려 온다.**

---

## 2. 왜 이렇게 만들까? (lazy loading을 쓰는 이유)

🧸 도서관 책을 **처음부터 전부** 책상에 쌓으면?
- 다 옮기는 데 오래 걸린다 → **첫 화면이 늦게 뜬다**
- 안 읽을 책까지 쌓인다 → **낭비**

MES는 화면이 수십~수백 개다. 작업자는 보통 **몇 개 화면만** 쓴다. 그래서 "**첫 화면은 빨리, 나머지는 열 때**" 받는다.

| | 한 번에 다 받기 | 필요할 때 받기 (lazy) |
|---|---|---|
| 첫 화면 속도 | 느림 | **빠름** |
| 처음 여는 화면 | 바로 뜸 | 아주 잠깐 로딩 |
| 디버깅할 때 | Ctrl+P에 다 나옴 | **연 화면만 나옴** ← 이번에 겪은 것 |

> 오라클로 치면: 한 번도 실행 안 한 쿼리는 Shared Pool에 실행계획이 없는 것과 비슷하다. **한 번 실행해야** 올라온다.

---

## 3. 이 프로젝트에서는 어떻게 되어 있나

### 3-1. 코드 위치

`src/config/menu.config.js` — 메뉴마다 화면을 **함수로** 들고 있다.

```js
page: () => import('@/biz/md/pages/ItemPage.jsx'),
page: () => import('@/biz/pp/pages/WorkOrderPage.jsx'),
page: () => import('@/biz/qm/pages/InspectionPage.jsx'),
```

`src/app/router.jsx` — 그 함수를 `lazy`에 넘긴다.

```js
const Page = lazy(item.page)
```

### 3-2. 읽는 법

- `import('...')` (괄호 있는 import) = **"부르면 그때 가져와"** (동적 import)
- `() => import(...)` = 그걸 **함수로 감싸서 아직 안 부름** (일급 함수 — 함수를 값으로 들고 있음)
- `lazy(...)` = React가 **그 화면을 처음 그릴 때** 함수를 불러서 파일을 가져옴

비교: 파일 맨 위의 `import { useState } from 'react'` (괄호 없는 import)는 **처음부터 바로** 가져온다.

### 3-3. 언제 무엇이 내려오나

| 언제 | 내려오는 파일 (예) |
|---|---|
| 처음 접속 | `main.jsx`, `App.jsx`, `router.jsx`, `menu.config.js`, 레이아웃(`AppShell`, `Sidebar`, `Header` …) |
| **품목관리 메뉴를 처음 열 때** | `ItemPage.jsx` + 그 파일이 import하는 것들: `itemService.js`, `itemRepository.js`, `items.mock.js`, 그리고 아직 안 받은 공통 파일(`DataTable.jsx`, `useSearch.js` …) |
| **검사 메뉴를 처음 열 때** | `InspectionPage.jsx`, `inspectionService.js`, `inspectionRepository.js`, `inspections.mock.js` … (공통 파일은 이미 있으면 다시 안 받음) |

> 화면 파일이 오면 **그 파일이 import하는 파일들이 줄줄이** 같이 온다. 그래서 `ItemPage.jsx`만 받는 게 아니라 `itemService.js`도 같이 온다.

---

## 4. 눈으로 확인하는 실험 (5분, 강력 추천)

lazy loading을 **직접 보는** 방법이다.

1. 품목관리 화면을 연 상태에서 **F12 → Network 탭**
2. 필터 칸 옆 **JS** 클릭 (자바스크립트 파일만 보기)
3. 🚫 아이콘(Clear)으로 목록 비우기
4. 왼쪽 메뉴에서 **검사** 화면 클릭
5. Network 목록에 `InspectionPage.jsx`, `inspectionService.js` … 가 **새로 나타난다** ← 이 순간 빌려 온 것
6. 이제 **Sources → Ctrl+P → `inspectionService`** → 나온다
7. 다시 **품목관리 → 검사**를 왔다 갔다 해 보기 → 두 번째부터는 **새로 안 받는다** (이미 책상에 있음)

---

## 5. Ctrl+P 자세히

### 5-1. 무엇을 하는 키인가

| 키 (개발자도구 안에서) | 이름 | 하는 일 |
|---|---|---|
| **Ctrl+P** (= Ctrl+O) | Open file | 받은 파일 중에서 **파일 이름**으로 찾기 |
| **Ctrl+Shift+F** | Search | 받은 파일 **전체 내용**에서 글자 찾기 (예: `typeLabel`, `matchesKeyword`) |
| Ctrl+Shift+P | Command menu | 개발자도구 기능 찾기 (예: "Disable cache", "Show Network") |
| Ctrl+F | Find | **지금 열린 파일 안**에서 글자 찾기 |
| Ctrl+G | Go to line | 지금 파일에서 줄 번호로 이동 |
| Ctrl+Shift+O | Go to member | 지금 파일의 **함수 목록**으로 이동 (예: `typeLabel`, `searchItems`) |

> Ctrl+Shift+F도 **받은 파일 안에서만** 찾는다. 안 연 화면의 코드는 여기서도 안 나온다.

### 5-2. ⚠️ 가장 흔한 함정: 인쇄 창이 뜬다

Ctrl+P는 원래 브라우저의 **인쇄** 단축키다.
**개발자도구 안을 한 번 클릭해서 포커스를 준 뒤** 눌러야 파일 찾기가 된다. 화면(웹페이지) 쪽에 포커스가 있으면 인쇄 창이 뜬다.

### 5-3. 이름 일부만 쳐도 된다 (퍼지 검색)

- `itemserv` → `itemService.js`
- `insp` → `InspectionPage.jsx`, `inspectionService.js`, `inspectionRepository.js` …
- `isv` → 대문자·단어 첫 글자로도 찾아 준다 (`inspection`**S**er**v**ice)

### 5-4. 같은 이름이 여러 개 나올 때

| 보이는 이름 | 뜻 | 고를까? |
|---|---|---|
| `src/biz/md/pages/ItemPage.jsx` | 우리가 쓴 원본 (소스맵으로 복원된 것) | ⭕ **이걸 고른다** |
| `ItemPage.jsx?t=1727...` | 저장할 때마다 Vite가 새로 보낸 버전 (`t` = 시간) | 가장 최근 것이 현재 코드. 헷갈리면 **F5 새로고침** 후 다시 찾기 |
| `node_modules/.vite/deps/...` | 라이브러리 파일 | ❌ 우리 코드 아님 |
| `.vue?vue&type=script…` (Vue 프로젝트) | Vue 파일을 쪼갠 조각 | `type=script`가 있는 쪽 |

### 5-5. 왼쪽 파일 트리로 확인하기

Sources 탭 왼쪽 **Page** 패널 → `localhost:5173` (Vite 기본 주소) → `src` 폴더를 펼치면 **지금 받은 파일만** 트리로 보인다.
안 연 화면의 폴더(예: `biz/qm`)는 **트리에 아예 없거나 비어 있다.** lazy loading을 눈으로 확인하는 또 다른 방법이다.

---

## 6. 브레이크포인트와 lazy loading

### 6-1. 안 연 화면에는 미리 걸 수 없다
파일이 책상에 없으니 브레이크포인트도 걸 수 없다. **순서: 화면 열기 → Ctrl+P → 브레이크포인트.**

### 6-2. 걸어 둔 브레이크포인트는 새로고침해도 남는다
크롬은 **파일 주소 기준**으로 기억한다. 검사 화면에서 걸어 두고 F5를 눌러도, 그 화면이 다시 열리면 그 자리에서 멈춘다.

### 6-3. 화면이 처음 열릴 때 실행되는 코드를 잡고 싶다면
화면 진입과 동시에 실행되는 코드(예: 첫 조회)는 "열고 나서 걸면" 이미 지나가 버린다.
1. 화면을 한 번 열어 파일을 받는다
2. 브레이크포인트를 건다
3. **그 화면에 있는 상태로 F5** → 다시 열리면서 멈춘다

또는 코드에 `debugger;`를 한 줄 넣으면 파일이 오는 순간 실행되면서 멈춘다. (**커밋 전 반드시 삭제**)

---

## 7. Ctrl+P로 파일을 못 찾을 때 체크리스트

순서대로 확인한다.

1. [ ] **개발자도구에 포커스**를 주고 눌렀나? (인쇄 창이 뜨면 이것)
2. [ ] 그 파일을 쓰는 **화면을 열었나?** (lazy loading) → 메뉴를 열고 다시 찾기
3. [ ] **이름 철자**가 맞나? 일부만 쳐 보기 (`insp`)
4. [ ] 그 파일이 **정말 그 화면에서 쓰이나?** → VSCode에서 import를 거꾸로 검색 (Shift+F12)
5. [ ] 코드를 저장한 직후인가? → **F5**로 새로고침 후 다시 찾기
6. [ ] `pnpm dev`(개발 서버)로 띄웠나? `pnpm build` 결과물(`dist`)은 파일이 압축·합쳐져 원래 이름으로 안 나올 수 있음
7. [ ] 왼쪽 **Page 트리**에 그 폴더가 있나? 없으면 2번으로

---

## 8. lazy loading이 아닌 경우 — 그땐 Ctrl+P가 어떻게 되나?

### 8-1. 🧸 도서관으로

| 방식 | 도서관 비유 | Ctrl+P (책상에서 찾기) |
|---|---|---|
| **lazy loading** (지금 프로젝트) | 필요한 책만 **그때그때** 빌려 옴 | **빌려 온 책만** 보임 |
| **eager loading** (한 번에 다 받기) | 도서관에 들어가자마자 책을 **전부** 책상에 쌓음 | **처음부터 전부** 보임 |

eager = "열심히, 미리". lazy = "게으르게, 필요할 때".

### 8-2. 코드 모양으로 구별하기

```js
// eager — 괄호 없는 import, 파일 맨 위
import InspectionPage from '@/biz/qm/pages/InspectionPage.jsx'
page: InspectionPage

// lazy — 괄호 있는 import(), 함수로 감쌈 (지금 프로젝트)
page: () => import('@/biz/qm/pages/InspectionPage.jsx')
```

eager로 바꾸면 처음 접속할 때 `main.jsx → router → menu.config → 모든 화면 → 각 화면의 service·repository·mock`이 **줄줄이 전부** 내려온다.
→ 품목관리만 열어 놨어도 Ctrl+P에 `inspectionService.js`가 **바로 나온다.**

프로젝트에서 lazy인지 확인하는 검색어 (VSCode Ctrl+Shift+F):
- React: `lazy(`, `import(`
- Vue: `() => import(`, `defineAsyncComponent`

### 8-3. 경우별 정리 (준이 만날 수 있는 환경들)

| 환경 | 언제 파일을 받나 | Ctrl+P에 보이는 것 |
|---|---|---|
| **React/Vue + lazy** (이 프로젝트) | 메뉴를 **처음 열 때** 그 화면 파일 | **연 화면의 파일만** |
| **React/Vue + eager** | **첫 접속 때 전부** | **처음부터 전부** |
| **JSP + jQuery** (옛 SI 방식) | 페이지가 열릴 때 그 페이지의 `<script src="...">`만 | **지금 페이지의 js만.** 다른 메뉴로 가면 페이지가 통째로 바뀌어서 **이전 페이지 js는 사라짐** (책상을 비우고 새 책을 쌓는 것) |
| **운영 빌드** (`pnpm build` 결과 `dist/`) | 파일들을 **묶고 압축한 덩어리** | 소스맵이 **있으면** 원래 파일 이름이 보임. **없으면** `index-abc123.js` 같은 덩어리만 보이고 `inspectionService.js`라는 이름은 **안 나옴** |

> 이 프로젝트의 실제 예: `dist/assets/` 안에 `ItemPage-C_-PqbUn.js` 같은 파일이 있다. 화면별로 덩어리가 따로 나뉜 것이 **lazy loading의 흔적**이다. (빌드 기본값은 소스맵 없음 → 운영 빌드에서는 원래 파일명으로 찾기 어렵다)

### 8-4. 그럼 eager가 더 좋은 거 아냐?

| | eager | lazy |
|---|---|---|
| 디버깅 (Ctrl+P) | **편함** — 다 보임 | 화면을 먼저 열어야 함 |
| 첫 화면 속도 | 화면이 많을수록 **느려짐** | **빠름** |
| 어울리는 곳 | 화면 몇 개짜리 작은 앱 | **화면이 많은 업무 시스템 (MES, ERP)** |

디버깅 편하자고 eager로 바꾸지는 않는다. **"화면을 먼저 열고 Ctrl+P"** 순서만 기억하면 lazy의 불편은 사라진다.

---

## 9. Vue에서도 똑같다

Vue Router도 보통 이렇게 쓴다.

```js
{ path: '/inspection', component: () => import('@/views/InspectionPage.vue') }
```

`() => import(...)`가 보이면 **lazy loading**이다. 화면을 열어야 Ctrl+P에 나온다. 원리는 똑같다.

---

## 10. 한 장 요약

```
pnpm dev (서고: 파일 전부)
   │  메뉴 클릭 = 빌리러 감 (lazy loading, import())
   ▼
브라우저 탭 (책상: 받은 파일만)
   │
   ├─ Ctrl+P        : 책상 위 파일 "이름"으로 찾기
   ├─ Ctrl+Shift+F  : 책상 위 파일 "내용"으로 찾기
   └─ 브레이크포인트 : 책상 위 파일에만 걸 수 있음

안 나오면 → ① 개발자도구 포커스 ② 그 화면 열기 ③ F5

lazy  (import()) : 연 화면만 책상에 있음   ← 이 프로젝트
eager (import)   : 처음부터 전부 책상에 있음
JSP              : 지금 페이지 것만 (이동하면 책상 비움)
운영 빌드         : 소스맵 없으면 원래 이름이 안 보임
```
