// Temporary shim to satisfy editor/TS when @types/react is not available
// You can remove this file after installing proper types: `pnpm add -D @types/react @types/react-dom`

declare module 'react/jsx-runtime' {
  export const jsx: any;
  export const jsxs: any;
  export const Fragment: any;
}

// Minimal global JSX fallback so TS doesn't complain about IntrinsicElements
declare global {
  namespace JSX {
    interface IntrinsicElements {
      [name: string]: any;
    }
  }
}

export {};
