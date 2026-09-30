// Design Ref: §11.1 ★ 확장 지점 1 — 대메뉴/서브메뉴/화면 매핑. 라우터·사이드바·헤더가 모두 이 배열에서 파생된다.
// Plan SC (FR-03): 서브메뉴 추가 = 여기 1줄 + biz/{모듈}/pages/{화면}.jsx 1개
// 형태: Design §3.1 MenuGroup / MenuItem 정의서
//   key       "{모듈}.{업무}"            예: "md.item"
//   screenId  "{모듈}_{업무}_{순번4}"     예: "MD_ITEM_0010"
//   icon      lucide 아이콘명 (Sidebar 가 lucide-react 에서 찾는다)
//   page      lazy import 함수 — React.lazy 가 그대로 받는다

export const MENU = [
  {
    key: 'md',
    label: '기준정보',
    icon: 'Database',
    order: 1,
    children: [
      {
        key: 'md.item',
        screenId: 'MD_ITEM_0010',
        label: '품목관리',
        path: '/md/item',
        page: () => import('@/biz/md/pages/ItemPage.jsx'),
      },
    ],
  },
  {
    key: 'pp',
    label: '생산',
    icon: 'Factory',
    order: 2,
    children: [
      {
        key: 'pp.work-order',
        screenId: 'PP_WO_0010',
        label: '작업지시',
        path: '/pp/work-order',
        page: () => import('@/biz/pp/pages/WorkOrderPage.jsx'),
      },
    ],
  },
  {
    key: 'qm',
    label: '품질',
    icon: 'ClipboardCheck',
    order: 3,
    children: [
      {
        key: 'qm.inspection',
        screenId: 'QM_INSP_0010',
        label: '검사결과',
        path: '/qm/inspection',
        page: () => import('@/biz/qm/pages/InspectionPage.jsx'),
      },
    ],
  },
]

/** 첫 화면 — `/` 접속 시 redirect 대상 */
export const DEFAULT_PATH = MENU[0].children[0].path

/** 모든 서브메뉴를 { ...item, group } 평탄 배열로 */
export function flattenMenu(menu = MENU) {
  return [...menu]
    .sort((a, b) => a.order - b.order)
    .flatMap((group) => group.children.map((item) => ({ ...item, group })))
}

/** 현재 경로에 해당하는 서브메뉴(+ group). 없으면 null */
export function findMenuByPath(pathname, menu = MENU) {
  return flattenMenu(menu).find((item) => item.path === pathname) ?? null
}
