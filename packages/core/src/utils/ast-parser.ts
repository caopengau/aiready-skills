import { parse } from '@typescript-eslint/typescript-estree';
import type { TSESTree } from '@typescript-eslint/typescript-estree';

export interface ExportWithImports {
  name: string;
  type: 'function' | 'class' | 'const' | 'type' | 'interface' | 'default';
  imports: string[]; // Imports used within this export's scope
  dependencies: string[]; // Other exports from same file this depends on
  loc?: {
    start: { line: number; column: number };
    end: { line: number; column: number };
  };
}

export interface FileImport {
  source: string; // Module being imported from
  specifiers: string[]; // What's being imported
  isTypeOnly: boolean;
}

/**
 * Parse TypeScript/JavaScript file and extract exports with their import dependencies
 */
export function parseFileExports(code: string, filePath: string): {
  exports: ExportWithImports[];
  imports: FileImport[];
} {
  try {
    const ast = parse(code, {
      loc: true,
      range: true,
      jsx: filePath.endsWith('.tsx') || filePath.endsWith('.jsx'),
      filePath,
    });

    const imports = extractFileImports(ast);
    const exports = extractExportsWithDependencies(ast, imports);

    return { exports, imports };
  } catch (error) {
    // Fallback to empty if parsing fails
    return { exports: [], imports: [] };
  }
}

/**
 * Extract all imports from the file
 */
function extractFileImports(ast: TSESTree.Program): FileImport[] {
  const imports: FileImport[] = [];

  for (const node of ast.body) {
    if (node.type === 'ImportDeclaration') {
      const source = node.source.value as string;
      const specifiers: string[] = [];
      const isTypeOnly = node.importKind === 'type';

      for (const spec of node.specifiers) {
        if (spec.type === 'ImportSpecifier') {
          const imported = spec.imported;
          const importName = imported.type === 'Identifier' ? imported.name : imported.value;
          specifiers.push(importName);
        } else if (spec.type === 'ImportDefaultSpecifier') {
          specifiers.push('default');
        } else if (spec.type === 'ImportNamespaceSpecifier') {
          specifiers.push('*');
        }
      }

      imports.push({ source, specifiers, isTypeOnly });
    }
  }

  return imports;
}

/**
 * Extract exports and their import dependencies
 */
function extractExportsWithDependencies(
  ast: TSESTree.Program,
  fileImports: FileImport[]
): ExportWithImports[] {
  const exports: ExportWithImports[] = [];
  const importedNames = new Set(fileImports.flatMap(imp => imp.specifiers));

  for (const node of ast.body) {
    if (node.type === 'ExportNamedDeclaration') {
      if (node.declaration) {
        const exportNodes = extractFromDeclaration(node.declaration);
        for (const exp of exportNodes) {
          const usedImports = findUsedImports(node.declaration, importedNames);
          exports.push({
            ...exp,
            imports: usedImports,
            dependencies: [],
            loc: node.loc,
          });
        }
      }
    } else if (node.type === 'ExportDefaultDeclaration') {
      const usedImports = findUsedImports(node.declaration, importedNames);
      exports.push({
        name: 'default',
        type: 'default',
        imports: usedImports,
        dependencies: [],
        loc: node.loc,
      });
    }
  }

  return exports;
}

/**
 * Extract export information from a declaration
 */
function extractFromDeclaration(
  declaration: TSESTree.Node
): Array<{ name: string; type: ExportWithImports['type'] }> {
  const results: Array<{ name: string; type: ExportWithImports['type'] }> = [];

  if (declaration.type === 'FunctionDeclaration' && 'id' in declaration && declaration.id) {
    results.push({ name: declaration.id.name, type: 'function' });
  } else if (declaration.type === 'ClassDeclaration' && 'id' in declaration && declaration.id) {
    results.push({ name: declaration.id.name, type: 'class' });
  } else if (declaration.type === 'VariableDeclaration') {
    for (const declarator of declaration.declarations) {
      if (declarator.id.type === 'Identifier') {
        results.push({ name: declarator.id.name, type: 'const' });
      }
    }
  } else if (declaration.type === 'TSTypeAliasDeclaration') {
    results.push({ name: declaration.id.name, type: 'type' });
  } else if (declaration.type === 'TSInterfaceDeclaration') {
    results.push({ name: declaration.id.name, type: 'interface' });
  }

  return results;
}

/**
 * Find which imports are used within a node
 */
function findUsedImports(
  node: TSESTree.Node,
  importedNames: Set<string>
): string[] {
  const usedImports = new Set<string>();

  function visit(n: TSESTree.Node) {
    if (n.type === 'Identifier' && importedNames.has(n.name)) {
      usedImports.add(n.name);
    }

    // Recursively visit child nodes
    for (const key in n) {
      const value = (n as any)[key];
      if (value && typeof value === 'object') {
        if (Array.isArray(value)) {
          value.forEach(child => {
            if (child && typeof child === 'object' && 'type' in child) {
              visit(child);
            }
          });
        } else if ('type' in value) {
          visit(value);
        }
      }
    }
  }

  visit(node);
  return Array.from(usedImports);
}

/**
 * Calculate import-based similarity between two exports (Jaccard index)
 */
export function calculateImportSimilarity(
  export1: ExportWithImports,
  export2: ExportWithImports
): number {
  if (export1.imports.length === 0 && export2.imports.length === 0) {
    return 1; // Both have no imports = perfectly similar
  }

  const set1 = new Set(export1.imports);
  const set2 = new Set(export2.imports);

  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);

  return intersection.size / union.size;
}

// Legacy exports for backwards compatibility
export interface ASTNode {
  type: string;
  loc?: {
    start: { line: number; column: number };
    end: { line: number; column: number };
  };
}

export function parseCode(code: string, language: string): ASTNode | null {
  // Deprecated: Use parseFileExports instead
  return null;
}

export function extractFunctions(ast: ASTNode): ASTNode[] {
  // Deprecated
  return [];
}

export function extractImports(ast: ASTNode): string[] {
  // Deprecated
  return [];
}
