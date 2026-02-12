// Global shims to help the editor resolve workspace packages and some third-party libs
// Prefer installing proper types and publishing d.ts from packages for a long-term fix.

declare module '@aiready/*';

declare module 'd3' {
  const d3: any;
  export = d3;
}

export {};
