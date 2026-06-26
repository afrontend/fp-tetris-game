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
