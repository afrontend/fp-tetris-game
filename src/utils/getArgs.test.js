import getArgs from './getArgs';

describe('getArgs', () => {
  it('빈 문자열이면 빈 객체를 반환한다', () => {
    expect(getArgs('')).toEqual({});
  });

  it('? 만 있으면 빈 객체를 반환한다', () => {
    expect(getArgs('?')).toEqual({});
  });

  it('단일 파라미터를 파싱한다', () => {
    expect(getArgs('?debug=true')).toEqual({ debug: 'true' });
  });

  it('복수 파라미터를 파싱한다', () => {
    expect(getArgs('?debug=true&speed=5')).toEqual({ debug: 'true', speed: '5' });
  });

  it('undefined 입력 시 빈 객체를 반환한다', () => {
    expect(getArgs(undefined)).toEqual({});
  });
});
