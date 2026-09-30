// Design Ref: §3.1 CodeOption / §8.5 Seed — 코드그룹별 { value, label }
import { CODE_GROUPS } from '@/config/codeGroups'

export const CODES_MOCK = {
  [CODE_GROUPS.ITEM_TYPE]: [
    { value: 'RAW', label: '원자재' },
    { value: 'SEMI', label: '반제품' },
    { value: 'FIN', label: '완제품' },
  ],
  [CODE_GROUPS.WO_STATUS]: [
    { value: 'PLANNED', label: '계획' },
    { value: 'RUNNING', label: '진행' },
    { value: 'DONE', label: '완료' },
  ],
  [CODE_GROUPS.INSP_ITEM]: [
    { value: 'DIM', label: '치수' },
    { value: 'VIS', label: '외관' },
    { value: 'FUNC', label: '기능' },
    { value: 'PACK', label: '포장' },
  ],
}
