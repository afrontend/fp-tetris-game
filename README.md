# Tetris Game
> 자바스크립트로 만든 테트리스 게임

[![tetris game demo](https://github.com/afrontend/fp-tetris-game/releases/download/screenshots/demo.gif "tetris game demo")](https://afrontend.github.io/fp-tetris-game/)

[블로그](https://agvim.wordpress.com/2019/01/08/tetris-game-with-javascript/)에서 간단한 설명을 볼 수 있으며 아래 라이브러리를 사용했다.

* [fp-tetris](https://www.npmjs.com/package/fp-tetris)
* [vite](https://vite.dev/)
* [keyboard-handler](https://github.com/emiljohansson/keyboard-handler)
* [react](https://react.dev/)

# Debug Mode

URL에 `?debug` 쿼리 파라미터를 추가하면 보드, 블록, 합성 뷰를 나란히 볼 수 있다.

    https://afrontend.github.io/fp-tetris-game/?debug

# 조작

| 입력 | 동작 |
|------|------|
| `←` `→` | 좌우 이동 |
| `↑` / 위로 스와이프 | 회전 |
| `↓` / 아래로 스와이프 | 빠르게 내리기 |
| `Space` / 화면 탭 | 즉시 낙하 |
| `P` | 일시정지 / 재개 |
| `S` / `L` | 빠른 저장 / 빠른 불러오기 |
| `D` | 디버그 모드 전환 |
| `H` | 도움말 열기 / 닫기 |

게임은 3초 카운트다운 후 시작한다. 빠른 저장 상태는 페이지를 새로 고치면 사라진다.

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

`master`에 push하면 GitHub Actions가 테스트를 통과한 뒤 자동으로 GitHub Pages에 배포한다.

수동/로컬 배포가 필요하면:

    npm run deploy

# Web

https://afrontend.github.io/fp-tetris-game/

# License
MIT © [Bob Hwang](https://afrontend.github.io)
