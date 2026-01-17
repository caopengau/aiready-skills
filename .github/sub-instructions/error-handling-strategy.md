# Error Handling Strategy

## Principle: Fail Fast, Log Clearly, Recover Gracefully

This document defines the AIReady monorepo's error handling strategy to ensure consistency across all packages.

---

## 🎯 Strategy by Context

### 1. **CLI Entry Points** (`packages/*/src/cli.ts`)

**Pattern:** Catch all errors at the top level, log user-friendly messages, exit with code.

```typescript
try {
  // Command execution
  await analyzer.analyze(directory, options);
} catch (error) {
  console.error(
    chalk.red(`Error: ${error instanceof Error ? error.message : String(error)}`)
  );
  process.exit(1);
}
```

**Rules:**
- ✅ Wrap main logic in try-catch
- ✅ Log with chalk.red for visibility
- ✅ Type-guard errors: `error instanceof Error`
- ✅ Exit with code 1 on failure
- ❌ Don't throw unhandled errors to user

---

### 2. **Core Logic** (`packages/*/src/analyzer.ts`, `packages/*/src/detector.ts`)

**Pattern:** Throw typed errors with context, let caller decide recovery.

```typescript
export async function analyzeFile(filePath: string): Promise<Result> {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }
  
  try {
    const content = await fs.promises.readFile(filePath, 'utf-8');
    return parseContent(content);
  } catch (error) {
    throw new Error(
      `Failed to analyze ${filePath}: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
```

**Rules:**
- ✅ Throw errors with descriptive messages
- ✅ Include file paths in error context
- ✅ Wrap lower-level errors with additional context
- ✅ Let caller decide how to handle
- ❌ Don't swallow errors silently

---

### 3. **Utilities** (`packages/core/src/utils/**`)

**Pattern:** Return default values for non-critical failures, throw for critical ones.

```typescript
// Non-critical: Return default
export function loadConfig(dir: string): Config | null {
  try {
    const configPath = findConfig(dir);
    if (!configPath) return null;
    return parseConfig(configPath);
  } catch (error) {
    console.warn(`Failed to load config: ${error instanceof Error ? error.message : String(error)}`);
    return null;
  }
}

// Critical: Throw
export function parseAST(code: string): AST {
  try {
    return parse(code, { sourceType: 'module' });
  } catch (error) {
    throw new Error(`Failed to parse code: ${error instanceof Error ? error.message : String(error)}`);
  }
}
```

**Rules:**
- ✅ Return `null` or default for optional operations
- ✅ Throw for required operations
- ✅ Log warnings for non-critical failures
- ❌ Don't fail silently on critical operations

---

### 4. **File System Operations**

**Pattern:** Handle common errors gracefully, fail fast on unexpected ones.

```typescript
export async function readFiles(pattern: string): Promise<string[]> {
  try {
    const files = await glob(pattern);
    
    if (files.length === 0) {
      console.warn(`No files found matching: ${pattern}`);
      return [];
    }
    
    return files;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      throw new Error(`Directory not found: ${pattern}`);
    }
    throw error; // Re-throw unexpected errors
  }
}
```

**Rules:**
- ✅ Handle ENOENT, EACCES gracefully
- ✅ Return empty arrays for zero matches
- ✅ Warn users about common issues
- ❌ Don't hide unexpected errors

---

## 📋 Checklist for New Code

When adding error handling:

1. ☐ Is this a CLI entry point? → Catch all, log, exit(1)
2. ☐ Is this core logic? → Throw with context
3. ☐ Is this a utility? → Return null/default OR throw based on criticality
4. ☐ Is this file I/O? → Handle ENOENT/EACCES gracefully
5. ☐ Did I type-guard with `instanceof Error`?
6. ☐ Did I include file paths in error messages?
7. ☐ Did I test error paths?

---

## 🔧 Migration Guidance

For existing code violating this strategy:

1. **Identify context:** CLI, core logic, utility, or file I/O
2. **Apply pattern:** Follow the appropriate pattern above
3. **Test:** Verify error messages are helpful
4. **Document:** Add JSDoc comments explaining error scenarios

---

## ❌ Anti-Patterns

Avoid these common mistakes:

```typescript
// ❌ DON'T: Swallow errors silently
try {
  doSomething();
} catch {}

// ❌ DON'T: Catch without type-guarding
catch (error) {
  console.error(error.message); // error is unknown!
}

// ❌ DON'T: Generic error messages
throw new Error('Something went wrong');

// ❌ DON'T: Mix return null and throw in same function
function loadFile(path: string): string | null {
  if (!fs.existsSync(path)) return null; // Inconsistent!
  if (!canRead(path)) throw new Error('Permission denied'); // Pick one!
}
```

---

## ✅ Best Practices

```typescript
// ✅ DO: Type-guard errors
catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(chalk.red(`Error: ${message}`));
}

// ✅ DO: Provide context
throw new Error(`Failed to parse ${filePath} at line ${lineNum}: ${originalError.message}`);

// ✅ DO: Document error scenarios
/**
 * Analyzes a file for patterns.
 * @throws {Error} If file doesn't exist or isn't readable
 * @throws {Error} If file contains invalid syntax
 */
export async function analyzeFile(path: string): Promise<Result>

// ✅ DO: Be consistent within a module
// All functions in file-scanner.ts either throw or return null, never mix
```

---

## 🧪 Testing Errors

Always test error paths:

```typescript
describe('analyzeFile', () => {
  it('throws on non-existent file', async () => {
    await expect(analyzeFile('/fake/path')).rejects.toThrow('File not found');
  });
  
  it('throws on invalid syntax', async () => {
    await expect(analyzeFile('invalid.ts')).rejects.toThrow('Failed to parse');
  });
});
```

---

## 🔄 Review Questions

When reviewing PRs:

1. Does the code follow the appropriate pattern for its context?
2. Are errors type-guarded with `instanceof Error`?
3. Do error messages include enough context (file paths, line numbers)?
4. Are error paths tested?
5. Is the behavior consistent with similar functions in the same module?

---

## 🎓 Training Examples

See these files for reference implementations:

- **CLI:** [packages/cli/src/cli.ts](../../../packages/cli/src/cli.ts) - Top-level error handling
- **Core Logic:** [packages/pattern-detect/src/detector.ts](../../../packages/pattern-detect/src/detector.ts) - Throws with context
- **Utilities:** [packages/core/src/utils/config.ts](../../../packages/core/src/utils/config.ts) - Returns null for optional configs

---

**Last Updated:** 2026-01-17  
**Maintainer:** AIReady Team  
**Questions:** Discuss in team meeting or open a GitHub issue
