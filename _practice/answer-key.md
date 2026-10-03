# 🔒 정답지 — 준은 답안 제출 전에 열지 말 것

- 출제일: 2026-09-30
- 출제자: 앨리
- 문제 파일: `src/biz/md/pages/02.md`, `src/biz/md/pages/03.md`
- 추가 출제 (2026-10-02): `src/biz/qm/pages/04.md`(초급 상), `src/biz/pp/pages/05.md`(중급), `src/biz/qm/pages/06.md`(중급)
- 출제 원칙(04~06): 이 프로젝트 전용 구조(목업, 클라이언트 필터)에 기대지 않고 **실무 백엔드 연동 화면에서도 똑같이 생기는** 버그만 출제. 5개 버그는 서로 간섭하지 않도록 화면을 나눴고, `pnpm test` 62/62는 그대로 통과함 (테스트로 정답이 드러나지 않음)
- 연습 목표: **틀린 값에서 출발해 그 값을 만든 재료만 거꾸로 따라가기** + `rows`/`columns` 갈림길 구분

---

## #02 유형 칸이 영어로 나옴 → `columns`(표시) 쪽

- **심은 위치**: `src/biz/md/pages/ItemPage.jsx` → `ItemPage` 안의 `typeLabel`
- **원본**: `itemTypeCodes.find((c) => c.value === value)?.label ?? value`
- **버그**: `itemTypeCodes.find((c) => c.label === value)?.label ?? value`
- **왜 영어가 나오나**: `row.itemType`은 `'RAW'`인데 `label`(`'원자재'`)과 비교하니 못 찾음 → `?? value` 로 코드가 그대로 나감
- **모범 경로**: `DataTable`의 `col.render ? col.render(row) : row[col.key]` ← `buildColumns`의 `itemType` render ← `typeLabel` ← (`useCodes`는 정상이므로 여기서 멈춤)
- **결정적 단서**: "선택 박스는 한글, 필터도 정상" → `useCodes` 데이터는 멀쩡하다 → 코드 목록 **소비하는 쪽**(`typeLabel`)이 범인
- **함정**: `useCodes` / `codeRepository` / `codes.mock.js`로 깊이 들어가면 시간 낭비
- **검증**: unit 테스트(`vitest run`)는 통과함(표시 로직 테스트 없음). e2e `#2 품목관리 — 유형 RAW, FIN 선택` 이 잡아냄 → 테스트 공백 지적 가능하면 가점

## #03 품목명 검색 0건 → `rows`(조회) 쪽

- **심은 위치**: `src/biz/md/services/itemService.js` → `KEYWORD_FIELDS`
- **원본**: `const KEYWORD_FIELDS = ['itemCode', 'itemName']`
- **버그**: `const KEYWORD_FIELDS = ['itemCode']`
- **모범 경로**: 0건 = `rows` 문제 → `DataTable rows` ← `useSearch` ← `searchItems` ← `matchesKeyword(row, KEYWORD_FIELDS, keyword)` ← `KEYWORD_FIELDS`
- **결정적 단서**: "코드는 되고 이름만 안 됨" → 입력칸·전달 경로는 정상(코드로는 되니까) → 필터 대상 필드가 문제
- **관리자 추측 판정**: ❌ 틀림. 키워드 칸(`ItemPage.jsx` `Input#keyword`)은 정상. 관리자 추측을 그대로 믿고 `ItemPage`만 보면 못 찾음
- **파일 내 단서**: 같은 파일 `searchItems` 주석에 "코드/이름 키워드"라고 되어 있음 → 주석과 코드 불일치
- **검증**: unit 테스트 통과함. `services.test.js`의 `keyword: '완제품'` 검사가 `every()`라서 **0건이어도 통과**하는 허점이 있음 → 이걸 찾아내면 큰 가점. e2e `#keyword` 에 `'모듈'` 입력하는 케이스가 잡아냄

## #04 🟡 초급 상 — 검사결과 초기화 후 검색조건이 남음 → **화면 상태·이벤트** 쪽

- **심은 위치**: `src/biz/qm/pages/InspectionPage.jsx` → `handleReset`
- **원본**: `setCriteria(EMPTY_CRITERIA)` + `search(EMPTY_CRITERIA)`
- **버그**: `setCriteria(EMPTY_CRITERIA)` 줄 삭제 → **조회만 빈 조건으로** 다시 하고, 화면이 들고 있는 조건(`criteria`)은 안 비움
- **실측 (2026-10-02)**: 키워드 `INS-0001` 조회 1건 → 초기화 → 표 10건 + 키워드 칸 `"INS-0001"` 그대로 → 바로 조회 1건
- **모범 경로**: 초기화 버튼 → `SearchBar`의 `onReset` ← `InspectionPage`의 `handleReset` (이벤트 출발점에서 시작) → `search(EMPTY)`는 했는데 `criteria` 상태는 그대로
- **결정적 단서**: "작업지시는 된다" → `WorkOrderPage`의 `handleReset`과 **나란히 비교**(차이 칼)하면 한 줄 차이로 바로 보임
- **범위 줄이기 포인트**: rows도 columns도 아님. 표는 정상(10건). 틀린 건 **입력 칸이 보여 주는 화면 상태** → 02·03에 없던 세 번째 갈래. 이걸 스스로 말하면 합격
- **실무 연결**: JSP `form.reset()`만 하고 hidden 조건 변수는 안 비움 / 그리드만 `clearData()`하고 조회조건 객체는 남김 — SI 화면에서 가장 흔한 초기화 버그
- **브레이크포인트**: `handleReset` 첫 줄 → 초기화 클릭 → Scope의 `criteria`가 그대로인지 확인
- **검증**: unit 테스트 없음(페이지 미테스트). e2e `#4`는 작업지시 화면만 초기화를 검사 → 검사결과 화면은 테스트 공백 (지적하면 가점)

## #05 🟠 중급 — 작업지시 조건을 넣어도 항상 전체 → **화면 상태·이벤트** 쪽 (stale closure)

- **심은 위치**: `src/biz/pp/pages/WorkOrderPage.jsx` → `handleSearch`
- **원본**: `<SearchBar onSearch={() => search(criteria)} ...>`
- **버그**: `const handleSearch = useCallback(() => search(criteria), [search]) // 렌더마다 함수 재생성 방지` + `onSearch={handleSearch}`
- **왜 전체가 나오나**: `useCallback`의 의존성 배열에 `criteria`가 없음 → 함수가 **첫 렌더 때 한 번만** 만들어지고, 그때의 `criteria`(= `EMPTY_CRITERIA`)를 **영원히 기억**함. 화면 칸은 최신 값을 보여 주지만 조회 함수는 옛날 값으로 호출
- **실측 (2026-10-02)**: 키워드 `20260921` 조회 → 10건 (정상이면 3건: WO-20260921-001~003)
- **모범 경로**: `useSearch` 17줄 `return searchFn(criteria)`에 브레이크포인트 → `criteria.keyword`가 `""` (**입구에서 이미 비어 있음**) → 서비스 무죄 → Call Stack 한 칸 위 `handleSearch` → `useCallback` 의존성 배열
- **결정적 단서**: 화면 칸에는 값이 **보이는데** 입구 카메라(17줄)에는 **빈 값** → "화면이 보여 주는 값 ≠ 함수가 쓰는 값"
- **관리자 추측 판정**: ❌ 틀림. 서비스(`searchWorkOrders`)는 정상 (`services.test.js`의 statuses 테스트 통과). 서비스에 도착하기 **전에** 조건이 이미 비어 있음
- **"성능 개선"과의 관계**: 성능 개선으로 붙인 `useCallback`이 원인. 주석 "렌더마다 함수 재생성 방지"가 단서. 최적화가 동작을 바꾸면 안 된다는 교훈
- **고치는 법 (둘 다 정답)**: ① 의존성에 `criteria` 추가 `[search, criteria]` ② `useCallback` 제거하고 원래대로 `() => search(criteria)` (이 화면 규모에선 최적화 이득 없음 — ②를 고르고 이유를 쓰면 가점)
- **고급 단서**: `pnpm lint` 경고 `React Hook useCallback has a missing dependency: 'criteria'` — 린트 경고를 먼저 확인하는 습관이 있으면 1분 컷. 실무에서도 정답 경로로 인정
- **실무 연결**: React `useCallback`/`useEffect` 의존성 누락, Vue `watch`·debounce 함수가 생성 시점 값을 캡처, jQuery 이벤트 바인딩 때 변수를 복사해 둔 경우 — "이벤트 함수가 만들어질 때의 값을 기억" 유형
- **검증**: unit 테스트 통과(서비스는 정상이니까). e2e `#4 작업지시 — 상태 RUNNING → 조회 → 건수 감소`가 잡아냄

## #06 🟠 중급 — 검사결과 공장·라인 선택 시 0건 → **rows** 쪽 (계층 하위 포함 누락)

- **심은 위치**: `src/biz/qm/services/inspectionService.js` → `searchInspections`의 `equipmentIds`
- **원본**: `const [rows, tree] = await Promise.all([inspectionRepository.findAll(), equipmentTreeRepository.findAll()])` + `const equipmentIds = resolveEquipmentIds(tree, criteria.equipmentId)`
- **버그**: `const rows = await inspectionRepository.findAll()` + `const equipmentIds = criteria.equipmentId ? new Set([criteria.equipmentId]) : null` (트리 조회를 빼고 **선택한 노드 하나만** 비교. import 2개도 함께 제거됨)
- **왜 0건인가**: `1공장`(`F1`)을 고르면 `{'F1'}`과 비교 → 검사 데이터의 설비는 전부 `F1-L1-E03` 같은 **말단 설비 id** → 일치하는 행 없음. 말단 설비를 고르면 우연히 맞아서 정상처럼 보임
- **실측 (2026-10-02)**: `조립#1` 2건(정상) / `1공장` 0건 / 같은 `1공장`을 품목관리에서 고르면 7건
- **기대값**: `1공장` 5건(INS-0001·0002·0006·0008·0009), `1공장 › 2라인` 2건(INS-0002·0009), `조립#1` 2건
- **모범 경로**: 0건 = rows → `useSearch` 17줄 `criteria.equipmentId = "F1"` 정상 → 19줄 0건 → `searchInspections` 안 → `equipmentIds`가 `Set{'F1'}` 하나뿐 (하위 설비 없음)
- **결정적 단서**: ① "설비는 되고 공장·라인은 안 됨" (차이 칼) ② "다른 화면은 됨" → `itemService.js` / `workOrderService.js`와 **나란히 비교**하면 `resolveEquipmentIds` 호출이 빠진 게 보임 ③ 주석은 아직 "설비 하위 포함"이라고 되어 있음 (주석-코드 불일치)
- **관리자 추측 판정**: ❌ 틀림. 설비 트리는 공통(`useEquipmentTree`)이고 콤보에 공장·라인이 정상 표시됨. 문제는 트리 **데이터**가 아니라 서비스가 트리를 **쓰지 않는 것**
- **실무 연결 (9번 답)**: 오라클 계층 조회에서 `START WITH equip_id = :id CONNECT BY PRIOR equip_id = parent_id` 없이 `WHERE equip_id = :id` 만 쓴 것과 같음. 말단 설비만 맞고 상위 노드는 0건 — MES 설비·조직·BOM 조회에서 자주 나오는 유형
- **함정**: `TreeCombo`, `useEquipmentTree`, `tree.js`로 깊이 들어가면 시간 낭비. 전부 공통이고 다른 화면에서 정상 동작 → 배제
- **검증**: unit 테스트 통과 — `services.test.js`의 검사결과 설비 테스트가 **말단 설비(F1-L1-E03)만** 검사함. 라인·공장 선택 테스트가 없는 공백을 지적하면 큰 가점

---

## 원상 복구 방법 (연습 끝나면)

1. `ItemPage.jsx`의 `typeLabel`: `c.label === value` → `c.value === value`
2. `itemService.js`의 `KEYWORD_FIELDS`: `['itemCode']` → `['itemCode', 'itemName']`
3. `InspectionPage.jsx`의 `handleReset`: 첫 줄에 `setCriteria(EMPTY_CRITERIA)` 다시 추가
4. `WorkOrderPage.jsx`: `handleSearch`/`useCallback` 제거, `onSearch={() => search(criteria)}`, import를 `useState`만
5. `inspectionService.js`: `equipmentTreeRepository`·`resolveEquipmentIds` import 복구, `Promise.all`로 트리 함께 조회, `resolveEquipmentIds(tree, criteria.equipmentId)` 사용
6. `pnpm test` 62/62, `pnpm lint` 경고 0 확인
