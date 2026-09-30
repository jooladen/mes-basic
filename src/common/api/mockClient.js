// Design Ref: §4.1 — 1단계 데이터 출처. axios 응답 봉투 { data } 모양을 흉내 낸다.
// 2단계에 repository 안의 mockGet(...) 을 httpClient.get(...) 으로 바꾸면 끝 (호출부 무변경).
// Plan FR-11: res.data 언래핑은 repository 만 한다. 이 모듈은 봉투를 "만들" 뿐 벗기지 않는다.

const DEFAULT_DELAY_MS = 0

/** 원본 mock 배열을 깊은 복사해 { data } 봉투로 감싼 Promise 를 돌려준다 */
export function mockGet(rows, delayMs = DEFAULT_DELAY_MS) {
  const envelope = { data: structuredClone(rows), status: 200 }
  if (delayMs <= 0) return Promise.resolve(envelope)
  return new Promise((resolve) => setTimeout(() => resolve(envelope), delayMs))
}
