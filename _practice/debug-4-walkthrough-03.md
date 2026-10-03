# 따라하기 디버깅 — 03번 "품목명 검색 0건"을 브레이크포인트로 잡기

> 작성: 2026-10-02 · 대상: 준 · **반복 연습용**
> 읽는 순서: `debug-1-principle.md`(원칙) → `debug-2-breakpoint.md`(도구) → `debug-3-ctrl-p.md`(파일 찾기) → **4 따라하기(이 문서)**
> ⚠️ 03번 정답이 들어 있습니다. `_practice/`(git 제외) 밖으로 옮기지 마세요.

---

## 0. 이 문서의 목표

- 브레이크포인트 **입구·출구 카메라**로 범위를 좁히고, **터널 안 카메라**로 범인을 잡는 흐름을 **손에 익힌다**
- 매 단계마다 **✅ 확인**이 있다. 안 맞으면 그 단계에서 멈추고 다시 본다
- 실측값은 2026-10-02 준과 앨리가 **실제로 본 값**이다

### 전체 흐름 한 장

```
[화면] 키워드 "모듈" → 조회
   │
   ▼
① useSearch 17줄  return searchFn(criteria)     ← 입구 카메라   "모듈" 들어왔나?
   │
   │   searchFn = itemService.searchItems  (터널)
   │     ③ itemService  return rows.filter(  ← 창고 카메라   데이터에 ITM-0009 있나?
   │     ④ criteria.js  return fields.some(  ← 검사 카메라   왜 탈락했나? (조건부)
   │
   ▼
② useSearch 19줄  setRows(result)              ← 출구 카메라   몇 건 나왔나?
   │
   ▼
[화면] 표 0건
```

🧸 터널 **입구**(①)에 들어간 사과가 **출구**(②)에서 사라졌다 → **터널 안**(③④)에 카메라를 단다.

---

## 1. 시작 전 준비

1. **실험 브랜치** (공개 저장소와 연결된 폴더라 필수)
   ```bash
   git switch -c practice/03-try1
   git status          # 깨끗한지 확인
   ```
2. 03번 버그가 살아 있는지 확인 — `src/biz/md/services/itemService.js`의 키워드 검사 대상 목록이 **품목코드만** 있는 상태여야 한다. 이미 고쳤다면 8장 "다시 연습하기"로 되돌린다.
3. `pnpm dev` → 브라우저에서 **기준정보 › 품목관리**

---

## 2. 1단계 — 입구 카메라 1대 (STEP 1~5)

### STEP 1. 깨끗하게 시작
1. **F12** → **Sources** 탭
2. 오른쪽 **Breakpoints** 목록에서 우클릭 → **Remove all breakpoints**

✅ Breakpoints 목록이 비어 있다

### STEP 2. 파일 열기
3. 개발자도구 안쪽을 **한 번 클릭** (안 하면 Ctrl+P가 인쇄 창이 됨)
4. **Ctrl+P** → `useSearch` → `useSearch.js`

✅ `export function useSearch(searchFn, initialCriteria) {` 가 보인다

### STEP 3. 입구에 브레이크포인트
5. **Ctrl+G** → `17`
6. 17줄이 `return searchFn(criteria)` 인지 확인 → **줄 번호 숫자 클릭**

✅ 파란 표시 + Breakpoints에 `useSearch.js` **1개**

> ❌ **7줄 `useState([])`에 걸면 안 된다.** 그 줄은 **화면을 그릴 때마다** 실행된다.
> 실측: 타이핑 4글자에 **8번**, 조회 후 **6번** 멈추고, 조회 값은 안 보였다.
> 17줄은 **조회를 눌렀을 때만** 실행된다. 실측: 조회 1번에 **1번** 멈춤.

### STEP 4. 조회
7. 키워드 칸에 `0001` 입력 → **안 멈춰야 정상**
8. **조회** 클릭

✅ "Paused in debugger" + 17줄 파란 배경

### STEP 5. 값 보기
9. **Scope → Local → `criteria`** 펼치기

✅ 실측값
```
equipmentId: null
itemTypes: []
keyword: "0001"
```
10. **F8** → 화면 1건 (ITM-0001)

---

## 3. 2단계 — 출구 카메라 추가, 비교하기 (STEP 6~9)

### STEP 6. 출구에 브레이크포인트
1. `useSearch.js`에서 **Ctrl+G** → `19`
2. `if (id === requestId.current) setRows(result)` 줄 번호 클릭

✅ Breakpoints에 `useSearch.js` **2개** (17, 19)

### STEP 7~8. 0001로 조회
3. **조회** → 17줄 멈춤 → **F8**
4. 잠깐 뒤 19줄 멈춤 (목업이 일부러 늦게 응답 — 정상)
5. **Scope → Local → `result`** 펼치기

✅ 실측값: `result: Array(1)` → `0: {itemCode: 'ITM-0001', ...}`, `length: 1`

6. **F8**

### STEP 9. ⭐ 모듈로 같은 카메라 비교
7. 키워드 `모듈` → **조회**
8. 17줄: `criteria.keyword` 메모 → **F8**
9. 19줄: `result.length` 메모 → **F8**

✅ 실측 표 (준이 직접 채운 값)

| | 17줄 입구 `keyword` | 19줄 출구 `result.length` |
|---|---|---|
| `0001` | `"0001"` | `1` |
| `모듈` | **`"모듈"`** | **`0`** |

### 판정
- 입구에 `"모듈"`이 제대로 들어옴 → **키워드 입력 칸은 무죄** (관리자 추측 배제, 답안 8번)
- 출구에서 0건 → **범인은 17줄과 19줄 사이 = `searchItems` 안**

---

## 4. 3단계 — 터널 안 카메라 (STEP 10~12)

### STEP 10. 정리 + 창고 카메라
1. Breakpoints에서 `useSearch.js` 2개 **체크 해제** (끄기만)
2. **Ctrl+P** → `itemService` → `itemService.js`
3. `return rows.filter(` 줄 번호 클릭

### STEP 11. 검사 카메라 (조건부)
4. **Ctrl+P** → `criteria` → `criteria.js`
5. `matchesKeyword` 안 `return fields.some(` 줄 번호 **우클릭** → **Add conditional breakpoint**
6. 조건: `row.itemCode === 'ITM-0009'`

> 조건을 왜 거나? 안 걸면 **품목 12건마다** 멈춘다.
> `ITM-0009`(완제품 모듈 X100)는 **나와야 하는데 안 나온** 품목이다. 그것만 본다.

✅ Breakpoints: `itemService.js` 1개 + `criteria.js` 1개(주황색 = 조건부)

### STEP 12. 모듈로 조회
7. 키워드 `모듈` → **조회**
8. **itemService에서 멈춤** → **Scope → Block → `rows`** 펼치기
   - 💡 `rows`는 Local이 아니라 **Block**에 있다 (`const`로 만든 변수)
9. **F8** → **criteria.js에서 멈춤** → **Scope → Local** 확인
10. **Console**(Esc) 입력:
    ```js
    String(row.itemName).toLowerCase().includes(term)
    ```

✅ 실측 표 (준이 직접 채운 값)

| 확인 | 값 | 뜻 |
|---|---|---|
| `rows`에 ITM-0009 | **있음** | 데이터 창고 무죄 |
| `row.itemName` | `완제품 모듈 X100` | 이름에 "모듈" 있음 |
| `fields` | **`["itemCode"]`** | ❗ **품목코드만 검사** |
| Console 결과 | **`true`** | 이름으로 비교하면 찾을 수 있었음 |

---

## 5. 4단계 — 설정한 곳 찾기 (STEP 13)

`criteria.js`는 받은 `fields`로 검사만 한다. **목록을 정한 곳**을 찾아야 고친다.

1. criteria.js에서 멈춘 상태로 **Call Stack**에서 `matchesKeyword` **바로 아래 (익명)** 클릭
2. `itemService.js`의 `matchesKeyword(row, KEYWORD_FIELDS, criteria.keyword)` 줄로 이동
3. 같은 파일 위쪽 `const KEYWORD_FIELDS = ['itemCode']` ← **범인**
4. **F8**, 브레이크포인트 전부 체크 해제

> **Call Stack 클릭 = 답안 4번의 `←` 한 칸 거슬러 올라가기**

---

## 6. 수정과 확인

### 수정 (`itemService.js`)
```js
const KEYWORD_FIELDS = ['itemCode', 'itemName']
```
- 공통 함수 `matchesKeyword`는 **건드리지 않는다.** 로직은 정상이고(0001에서 `true`), 같은 함수를 작업지시·검사 화면도 쓴다.
- 고칠 곳은 **호출부가 넘기는 설정값**이다.

### 확인
| 확인 | 기대 |
|---|---|
| 키워드 `모듈` | **3건** (ITM-0009, 0010, 0011) |
| 키워드 `강판` | 2건 (ITM-0001, 0002) |
| 키워드 `ITM-0009` | **여전히 1건** (원래 되던 것 안 깨짐) |
| `pnpm test` | 전부 통과 (2026-10-02 수정 후 62개 통과 확인) |

추가하면 좋은 테스트 (`src/biz/services.test.js`):
- `searchItems({ keyword: '모듈' })` → 3건
- `searchItems({ keyword: 'ITM-0009' })` → 1건

---

## 7. 답안 정리 (03.md)

| 번호 | 내용 |
|---|---|
| 1. 증상 | 품목코드로는 검색되는데, 품목명 키워드(`모듈`, `강판`)로는 0건 |
| 2. rows/columns | **rows.** 0건이라 그릴 게 없음 → columns 배제 |
| 3. 출발점 | `useSearch.js` 17줄(입구) / 19줄(출구) |
| 4. 경로 | `DataTable rows(0건)` ← `useSearch 19줄 result(0건 — 이상)` ← `useSearch 17줄 keyword("모듈" — 정상)` ← `itemService.searchItems rows(ITM-0009 있음 — 정상)` ← `criteria.matchesKeyword(fields ["itemCode"] — 이상)` ← `itemService KEYWORD_FIELDS` |
| 5. 범인 | `itemService.js`의 `KEYWORD_FIELDS`에 `itemName`이 없음 |
| 6. 수정안 | `['itemCode', 'itemName']`. 이유: Console에서 이름 비교 시 `true` 확인 |
| 7. 확인 | 6장 표 + `pnpm test` |
| 8. 관리자 추측 | **입력 칸은 무죄** (17줄에 `"모듈"` 정상 도착). 원인은 검사 대상 설정. "칸을 붙이면서 설정을 빠뜨렸다"는 뜻이면 반쯤 맞을 수 있으나 **변경 이력이 없어 확인 불가** |

---

## 8. 다시 연습하기 (반복용)

### 버그 상태로 되돌리기
```bash
git stash                                        # 내 수정 보관 (버리지 않음)
# 또는 연습 브랜치를 버리고 새로:
git switch main
git switch -c practice/03-try2
```

### 연습 목표 (회차별)
| 회차 | 목표 | 체크 |
|---|---|---|
| 1회 | 이 문서를 보면서 STEP 1~13 | 전 단계 ✅ |
| 2회 | **문서 안 보고** STEP 1~13, 막히면 해당 STEP만 보기 | 막힌 STEP 번호 메모 |
| 3회 | 10분 안에 범인까지 | 시간 기록 |
| 4회 | **02번에 같은 방법 적용**: 입구 = DataTable 셀 렌더링 줄, 검사 카메라 = `typeLabel` (조건부 `value === 'RAW'`) | 범인까지 |

### 막히면 볼 곳
| 증상 | 원인 / 해결 |
|---|---|
| Ctrl+P 누르니 인쇄 창 | 개발자도구 안을 먼저 클릭 |
| 파일이 Ctrl+P에 없음 | 그 화면을 먼저 열기 (lazy loading) → `debug-3-ctrl-p.md` |
| 타이핑만 해도 계속 멈춤 | **그리는 줄**에 걸었음 (예: `useState` 줄) → 이벤트 때 도는 줄로 옮기기 |
| `rows`가 Local에 없음 | **Block** 펼치기 |
| 12번씩 멈춤 | **조건부 브레이크포인트** 사용 |
| 17줄과 19줄 사이 텀 | 목업 지연, 정상 |

---

## 9. 왜 UI 디버깅이 Java보다 어려운가 (메모)

| Java 서버 | React UI |
|---|---|
| 요청 하나 = 위에서 아래로 **한 줄기** 실행 | **그리기**(렌더)와 **이벤트**(클릭)가 섞여서 실행 |
| 한 메서드는 요청당 **한 번** | 컴포넌트·훅 본문은 상태가 바뀔 때마다 **여러 번** (StrictMode면 2배) |
| 대부분 동기 실행 | `.then`, 지연 응답 등 **비동기** — 17줄과 19줄이 시간 차를 두고 실행 |
| 클래스가 처음부터 다 로딩 | 화면 파일이 **열 때 로딩** (lazy) |
| 로그로 순서가 보임 | 함수를 **값으로 넘김**(콜백) → 누가 부르는지 Call Stack으로 봐야 함 |

**핵심 기준 하나:** 브레이크포인트를 걸기 전에 **"이 줄은 그릴 때 도나, 눌렀을 때 도나?"**를 먼저 묻는다.
