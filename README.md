# Tetris Game

> 자바스크립트로 만든 테트리스 게임

[![tetris game screenshot](https://agvim.files.wordpress.com/2019/01/fp-tetris-game.png?w=100 "tetris game screenshot")](https://afrontend.github.io/fp-tetris-game/)

[블로그](https://agvim.wordpress.com/2019/01/08/tetris-game-with-javascript/)에서 간단한 설명을 볼 수 있으며 아래 라이브러리를 사용했다.

- [fp-tetris](https://www.npmjs.com/package/fp-tetris)
- [vite](https://vite.dev/)
- [keyboard-handler](https://github.com/emiljohansson/keyboard-handler)
- [lodash](https://lodash.com/)
- [react](https://react.dev/) 19

# Features

- 12×17 그리드 게임 보드
- 상태 저장 및 복원
- 다크 모드 자동 지원 (`prefers-color-scheme`)
- 접근성 지원 (ARIA 역할 및 레이블)
- `prefers-reduced-motion` 지원

# Controls

| Key | Action |
|-----|--------|
| `←` `→` | 좌우 이동 |
| `↑` | 회전 |
| `↓` | 빠르게 내리기 |
| `Space` | 즉시 낙하 |
| `S` | 현재 상태 저장 |
| `R` | 저장된 상태 복원 |

# Debug Mode

URL에 `?debug` 쿼리 파라미터를 추가하면 보드, 블록, 합성 뷰를 나란히 볼 수 있다.

    https://afrontend.github.io/fp-tetris-game/?debug

# Installation

    git clone https://github.com/afrontend/fp-tetris-game
    cd fp-tetris-game
    npm install

# Run

    npm start

# Test

    npm test

# Build

    npm run build

# Preview

    npm run preview

# Deploy

    npm run deploy

# Web

https://afrontend.github.io/fp-tetris-game/
