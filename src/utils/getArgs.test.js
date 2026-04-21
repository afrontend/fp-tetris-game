import getArgs from './getArgs';

describe('getArgs', () => {
  it('쿼리 파라미터를 객체로 반환한다', () => {
    expect(getArgs('?foo=bar&baz=qux')).toEqual({ foo: 'bar', baz: 'qux' });
  });

  it('단일 파라미터를 처리한다', () => {
    expect(getArgs('?debug=true')).toEqual({ debug: 'true' });
  });

  it('값 없는 키는 undefined로 반환한다', () => {
    expect(getArgs('?onlykey')).toEqual({ onlykey: undefined });
  });

  it('쿼리스트링이 없으면 빈 객체를 반환한다', () => {
    expect(getArgs('')).toEqual({});
  });

  it('undefined 입력 시 빈 객체를 반환한다', () => {
    // window.location.search가 없는 환경에서도 오류 없이 동작
    expect(getArgs(undefined)).toEqual({});
  });

  it('해시가 포함된 URL에서 쿼리 파라미터를 추출한다', () => {
    expect(getArgs('?foo=bar#section')).toEqual({ foo: 'bar' });
  });
});
