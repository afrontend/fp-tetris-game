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
vi.mock('keyboard-handler', () => ({ keyPressed: vi.fn() }));

// ─── index.jsx — root element null 체크 ──────────────────────────────────────

describe('index.jsx — root element null 체크', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.resetModules();
  });

  it('#root 요소가 없으면 명시적 에러를 throw', async () => {
    vi.spyOn(document, 'getElementById').mockReturnValue(null);

    await expect(import('./index')).rejects.toThrow(
      'Root element "#root" not found in document',
    );
  });
});
