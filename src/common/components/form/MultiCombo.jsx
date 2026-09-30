// Design Ref: §5.3 MultiCombo — Quasar QSelect(multiple, use-chips) 대응. shadcn Combobox(Base UI) `multiple` 래핑.
// Plan FR-04: 다중 선택 · 칩 표시 · 검색 필터 · 값 배열 onChange
// props (정의서): options: CodeOption[] · value: string[] · onChange(next: string[]) · placeholder · disabled
// 바깥은 value 문자열 배열만 다루고, Base UI 가 요구하는 객체 배열 변환은 여기서만 한다.
import { useMemo } from 'react'
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
} from '@/common/components/ui/combobox'

const DEFAULT_PLACEHOLDER = '선택'
const EMPTY_TEXT = '검색 결과가 없습니다'

export function MultiCombo({ options, value, onChange, placeholder = DEFAULT_PLACEHOLDER, disabled = false, id }) {
  const selectedOptions = useMemo(
    () => (value ?? []).map((v) => options.find((o) => o.value === v)).filter(Boolean),
    [options, value],
  )

  return (
    <Combobox
      items={options}
      multiple
      disabled={disabled}
      value={selectedOptions}
      onValueChange={(next) => onChange(next.map((o) => o.value))}
      itemToStringValue={(o) => o.label}
      isItemEqualToValue={(a, b) => a.value === b.value}
    >
      <ComboboxChips data-testid="multi-combo">
        <ComboboxValue>
          {selectedOptions.map((o) => (
            <ComboboxChip key={o.value}>{o.label}</ComboboxChip>
          ))}
        </ComboboxValue>
        <ComboboxChipsInput id={id} placeholder={selectedOptions.length ? '' : placeholder} />
      </ComboboxChips>
      <ComboboxContent>
        <ComboboxEmpty>{EMPTY_TEXT}</ComboboxEmpty>
        <ComboboxList>
          {(o) => (
            <ComboboxItem key={o.value} value={o}>
              {o.label}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}
