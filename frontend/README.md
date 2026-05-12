# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Testing

| Command | What it runs |
| --- | --- |
| `npm test` | Vitest unit + component tests (`src/**/*.test.{js,jsx}`) in jsdom |
| `npm run test:watch` | Vitest in watch mode |
| `npm run test:coverage` | Vitest with V8 coverage report |
| `npm run test:e2e:install` | Download the Playwright Chromium browser (run once) |
| `npm run test:e2e` | Playwright E2E tests in `e2e/` — starts the FastAPI backend and Vite dev server automatically |

The Playwright config starts both servers via its `webServer` setting, so `npm run test:e2e` is the only command needed for full-stack browser tests. The E2E suite uses an isolated `e2e-app.db` SQLite file so it never touches the development database.
