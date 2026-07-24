import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import fpTetris from 'fp-tetris';
import * as keyboard from 'keyboard-handler';

vi.mock('keyboard-handler', () => ({ keyPressed: vi.fn(cb => vi.fn()) }));

vi.mock('fp-tetris', async () => {
  const actual = await vi.importActual('fp-tetris');
  return {
    ...actual,
    default: {
      ...actual.default,
      isBlankToolPanel: vi.fn().mockReturnValue(false),
    },
  };
});

afterEach(() => {
  fpTetris.isBlankToolPanel.mockReturnValue(false);
  keyboard.keyPressed.mockClear();
  vi.clearAllTimers();
  vi.useRealTimers();
});

const getKeyboardCallback = () => keyboard.keyPressed.mock.calls[0][0];

function fireTouch(el, type, x, y) {
  const event = new Event(type, { bubbles: true, cancelable: true });
  event.touches = [{ clientX: x, clientY: y }];
  event.changedTouches = [{ clientX: x, clientY: y }];
  el.dispatchEvent(event);
}

function swipe(el, x1, y1, x2, y2) {
  fireTouch(el, 'touchstart', x1, y1);
  fireTouch(el, 'touchend', x2, y2);
}

it('renders without crashing', () => {
  const div = document.createElement('div');
  let root;
  act(() => { root = createRoot(div); root.render(<App />); });
  act(() => { root.unmount(); });
});

it('unmount 시 타이머가 정리된다', () => {
  const spy = vi.spyOn(global, 'clearInterval');
  const div = document.createElement('div');
  let root;
  act(() => { root = createRoot(div); root.render(<App />); });
  act(() => { root.unmount(); });
  expect(spy).toHaveBeenCalled();
  spy.mockRestore();
});

it('게임오버 상태에서 GAME OVER 오버레이가 표시된다', () => {
  fpTetris.isBlankToolPanel.mockReturnValue(true);
  const div = document.createElement('div');
  let root;
  act(() => { root = createRoot(div); root.render(<App />); });
  expect(div.querySelector('.game-over-overlay')).not.toBeNull();
  act(() => { root.unmount(); });
});

it('게임오버 상태에서 타이머가 시작되지 않는다', () => {
  fpTetris.isBlankToolPanel.mockReturnValue(true);
  const spy = vi.spyOn(global, 'setInterval');
  const div = document.createElement('div');
  let root;
  act(() => { root = createRoot(div); root.render(<App />); });
  expect(spy).not.toHaveBeenCalled();
  spy.mockRestore();
  act(() => { root.unmount(); });
});

it('정상 상태에서 GAME OVER 오버레이가 표시되지 않는다', () => {
  const div = document.createElement('div');
  let root;
  act(() => { root = createRoot(div); root.render(<App />); });
  expect(div.querySelector('.game-over-overlay')).toBeNull();
  act(() => { root.unmount(); });
});

// ── 도움말 오버레이 (H 키) ──────────────────────────────────────────

it('H키(72)를 누르면 도움말 오버레이가 표시된다', () => {
  const div = document.createElement('div');
  let root;
  act(() => { root = createRoot(div); root.render(<App />); });

  act(() => { getKeyboardCallback()({ which: 72 }); });

  expect(div.querySelector('.help-overlay')).not.toBeNull();
  act(() => { root.unmount(); });
});

it('H키를 두 번 누르면 도움말 오버레이가 닫힌다', () => {
  const div = document.createElement('div');
  let root;
  act(() => { root = createRoot(div); root.render(<App />); });

  const cb = getKeyboardCallback();
  act(() => { cb({ which: 72 }); });
  act(() => { cb({ which: 72 }); });

  expect(div.querySelector('.help-overlay')).toBeNull();
  act(() => { root.unmount(); });
});

it('도움말이 열려 있는 동안 tick이 실행되지 않는다', () => {
  vi.useFakeTimers();
  const div = document.createElement('div');
  let root;
  act(() => { root = createRoot(div); root.render(<App />); });

  act(() => { getKeyboardCallback()({ which: 72 }); });

  const tickSpy = vi.spyOn(fpTetris, 'tick');
  act(() => { vi.advanceTimersByTime(800); });

  expect(tickSpy).not.toHaveBeenCalled();
  tickSpy.mockRestore();
  act(() => { root.unmount(); });
});

// ── 터치/스와이프 동작 ──────────────────────────────────────────────

describe('터치/스와이프 동작', () => {
  let div, root, el, keySpy;

  beforeEach(() => {
    window.ontouchstart = null;
    vi.useFakeTimers();
    div = document.createElement('div');
    act(() => { root = createRoot(div); root.render(<App />); });
    el = div.querySelector('.App');
    keySpy = vi.spyOn(fpTetris, 'key');
  });

  afterEach(() => {
    keySpy.mockRestore();
    act(() => { root.unmount(); });
    delete window.ontouchstart;
    vi.useRealTimers();
  });

  it('오른쪽으로 스와이프하면 right 이동이 호출된다', () => {
    act(() => { swipe(el, 0, 0, 50, 0); vi.advanceTimersByTime(0); });
    expect(keySpy).toHaveBeenCalledWith('right', expect.anything());
  });

  it('왼쪽으로 스와이프하면 left 이동이 호출된다', () => {
    act(() => { swipe(el, 50, 0, 0, 0); vi.advanceTimersByTime(0); });
    expect(keySpy).toHaveBeenCalledWith('left', expect.anything());
  });

  it('위로 스와이프하면 up(회전)이 호출된다', () => {
    act(() => { swipe(el, 0, 50, 0, 0); vi.advanceTimersByTime(0); });
    expect(keySpy).toHaveBeenCalledWith('up', expect.anything());
  });

  it('아래로 스와이프하면 down(빠르게 내리기)이 호출된다', () => {
    act(() => { swipe(el, 0, 0, 0, 50); vi.advanceTimersByTime(0); });
    expect(keySpy).toHaveBeenCalledWith('down', expect.anything());
  });

  it('제자리 탭(움직임 10px 미만)은 space(즉시 낙하)로 처리된다', () => {
    act(() => { swipe(el, 0, 0, 2, 2); vi.advanceTimersByTime(0); });
    expect(keySpy).toHaveBeenCalledWith('space', expect.anything());
  });

  it('10~30px 사이의 애매한 움직임은 무시된다', () => {
    act(() => { swipe(el, 0, 0, 20, 0); vi.advanceTimersByTime(0); });
    expect(keySpy).not.toHaveBeenCalled();
  });

  it('터치를 지원하지 않는 환경에서는 스와이프가 동작하지 않는다', () => {
    act(() => { root.unmount(); });
    delete window.ontouchstart;
    const div2 = document.createElement('div');
    let root2;
    act(() => { root2 = createRoot(div2); root2.render(<App />); });
    const el2 = div2.querySelector('.App');
    act(() => { swipe(el2, 0, 0, 100, 0); vi.advanceTimersByTime(0); });
    expect(keySpy).not.toHaveBeenCalled();
    act(() => { root2.unmount(); });
  });

  it('언마운트 시 터치 리스너가 정리된다', () => {
    const removeSpy = vi.spyOn(el, 'removeEventListener');
    act(() => { root.unmount(); });
    expect(removeSpy).toHaveBeenCalledWith('touchstart', expect.any(Function));
    expect(removeSpy).toHaveBeenCalledWith('touchend', expect.any(Function));
    removeSpy.mockRestore();
  });
});
