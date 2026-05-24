import { getKeySymbol } from './keyMap';

describe('getKeySymbol - 키 매핑', () => {
  it('H키(72)는 help로 매핑된다', () => {
    expect(getKeySymbol(72)).toBe('help');
  });

  it('L키(76)는 reload로 매핑된다', () => {
    expect(getKeySymbol(76)).toBe('reload');
  });

  it('R키(82)는 r(배경 회전)로 매핑된다', () => {
    expect(getKeySymbol(82)).toBe('r');
  });

  it('R키는 더 이상 reload가 아니다', () => {
    expect(getKeySymbol(82)).not.toBe('reload');
  });

  it('P키(80)는 p(일시정지)로 매핑된다', () => {
    expect(getKeySymbol(80)).toBe('p');
  });

  it('S키(83)는 save로 매핑된다', () => {
    expect(getKeySymbol(83)).toBe('save');
  });

  it('Space(32)는 space로 매핑된다', () => {
    expect(getKeySymbol(32)).toBe('space');
  });

  it('화살표 키가 올바르게 매핑된다', () => {
    expect(getKeySymbol(37)).toBe('left');
    expect(getKeySymbol(38)).toBe('up');
    expect(getKeySymbol(39)).toBe('right');
    expect(getKeySymbol(40)).toBe('down');
  });

  it('매핑되지 않은 키는 null을 반환한다', () => {
    expect(getKeySymbol(999)).toBeNull();
  });
});
