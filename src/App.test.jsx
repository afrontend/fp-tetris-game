import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

jest.mock('keyboard-handler', () => ({ keyPressed: jest.fn() }));

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
