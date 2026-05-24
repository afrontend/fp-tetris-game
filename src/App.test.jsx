import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import fpTetris from 'fp-tetris';

jest.mock('keyboard-handler', () => ({ keyPressed: jest.fn(() => jest.fn()) }));

jest.mock('fp-tetris', () => {
  const actual = jest.requireActual('fp-tetris');
  return {
    ...actual,
    isBlankToolPanel: jest.fn().mockReturnValue(false),
  };
});

afterEach(() => {
  fpTetris.isBlankToolPanel.mockReturnValue(false);
  jest.clearAllTimers();
});

it('renders without crashing', () => {
  const div = document.createElement('div');
  let root;
  act(() => { root = createRoot(div); root.render(<App />); });
  act(() => { root.unmount(); });
});

it('unmount 시 타이머가 정리된다', () => {
  const spy = jest.spyOn(global, 'clearInterval');
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
  const spy = jest.spyOn(global, 'setInterval');
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
