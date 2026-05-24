import getInterval from './getInterval';

describe('getInterval', () => {
  it('score 0에서 700ms를 반환한다', () => {
    expect(getInterval(0)).toBe(700);
  });

  it('score 9에서 700ms를 반환한다 (10줄 미만은 속도 변화 없음)', () => {
    expect(getInterval(9)).toBe(700);
  });

  it('score 10에서 650ms를 반환한다', () => {
    expect(getInterval(10)).toBe(650);
  });

  it('score 11에서 650ms를 반환한다 (같은 구간)', () => {
    expect(getInterval(11)).toBe(650);
  });

  it('score 20에서 600ms를 반환한다', () => {
    expect(getInterval(20)).toBe(600);
  });

  it('score 100에서 200ms를 반환한다', () => {
    expect(getInterval(100)).toBe(200);
  });

  it('score 110에서 최소값 150ms에 도달한다', () => {
    expect(getInterval(110)).toBe(150);
  });

  it('score 200에서도 최소값 150ms를 반환한다 (하한 보장)', () => {
    expect(getInterval(200)).toBe(150);
  });
});
