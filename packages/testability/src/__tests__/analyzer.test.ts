import { analyzeTestability } from '../analyzer';
import { join } from 'path';
import { writeFileSync, mkdirSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';

describe('Testability Analyzer', () => {
  const tmpDir = join(tmpdir(), 'aiready-testability-tests');

  beforeAll(() => {
    mkdirSync(tmpDir, { recursive: true });
  });

  afterAll(() => {
    rmSync(tmpDir, { recursive: true, force: true });
  });

  function createTestFile(name: string, content: string): string {
    const filePath = join(tmpDir, name);
    const dir = join(filePath, '..');
    mkdirSync(dir, { recursive: true });
    writeFileSync(filePath, content, 'utf8');
    return filePath;
  }

  describe('Test Coverage Ratio', () => {
    it('should calculate ratio of test files to source files', async () => {
      createTestFile('src/math.ts', 'export const add = (a, b) => a + b;');
      createTestFile(
        'src/math.test.ts',
        'import { add } from "./math"; test("add", () => {});'
      );
      createTestFile(
        'src/string.ts',
        'export const upper = (s) => s.toUpperCase();'
      );

      const report = await analyzeTestability({ rootDir: tmpDir });

      expect(report.rawData.sourceFiles).toBeGreaterThanOrEqual(2);
      expect(report.rawData.testFiles).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Pure Functions and State Mutations', () => {
    it('should detect state mutations inside functions', async () => {
      createTestFile(
        'src/mutations.ts',
        `
        const globalState = { value: 0 };
        
        export function impureAdd(a: number) {
          globalState.value += a; // mutation here
          return globalState.value;
        }

        export function pureAdd(a: number, b: number) {
          return a + b;
        }
      `
      );

      const report = await analyzeTestability({ rootDir: tmpDir });

      expect(report.rawData.externalStateMutations).toBeGreaterThanOrEqual(1);
      expect(report.rawData.pureFunctions).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Bloated Interfaces', () => {
    it('should detect interfaces with too many methods', async () => {
      createTestFile(
        'src/interfaces.ts',
        `
        export interface BloatedService {
          m1(): void;
          m2(): void;
          m3(): void;
          m4(): void;
          m5(): void;
          m6(): void;
          m7(): void;
          m8(): void;
          m9(): void;
          m10(): void;
          m11(): void;
        }
      `
      );

      const report = await analyzeTestability({ rootDir: tmpDir });

      expect(report.rawData.bloatedInterfaces).toBeGreaterThanOrEqual(1);
    });
  });
});
