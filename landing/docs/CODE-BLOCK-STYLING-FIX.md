# Code Block Styling Fix - Documentation

## Issue
Code blocks in blog posts (e.g., `/blog/semantic-duplicate-detection`) had dark, hard-to-read text that couldn't be changed through CSS customization.

## Root Cause

The `CodeBlock` component (`landing/components/CodeBlock.tsx`) was importing the highlight.js default theme:

```typescript
import 'highlight.js/styles/github-dark.css';
```

This external stylesheet was **overriding** any custom CSS rules defined in `landing/app/globals.css` due to:
1. **CSS Loading Order**: The highlight.js stylesheet loaded after our custom styles
2. **CSS Specificity**: The highlight.js rules had equal or higher specificity
3. **!important flags**: Even with `!important` in our custom CSS, the order of loading meant the highlight.js styles took precedence

## Solution

### Step 1: Remove the Blocking Import
Removed the highlight.js CSS import from `landing/components/CodeBlock.tsx`:

```diff
import hljs from 'highlight.js/lib/core';
import typescript from 'highlight.js/lib/languages/typescript';
import javascript from 'highlight.js/lib/languages/javascript';
import bash from 'highlight.js/lib/languages/bash';
import json from 'highlight.js/lib/languages/json';
- import 'highlight.js/styles/github-dark.css';
import { CodeBlockCopyButton } from './CodeBlockCopyButton';
```

### Step 2: Add Complete Syntax Highlighting CSS
Added comprehensive syntax highlighting rules in `landing/app/globals.css` to replace the removed theme:

```css
/* Code block base styles (used by CodeBlock component) */
.code-block {
  background: #0d1117;
  color: #f0f6fc;
  border: 1px solid #30363d;
}

.code-block code {
  color: #f0f6fc !important;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, "Roboto Mono", "Helvetica Neue", monospace;
  font-size: 0.92rem;
  line-height: 1.35;
}

/* Base hljs syntax highlighting (replaces github-dark.css) */
.code-block .hljs {
  color: #f0f6fc !important;
}

.code-block .hljs-keyword { color: #ff7b72 !important; }
.code-block .hljs-title { color: #d2a8ff !important; }
.code-block .hljs-string { color: #a5d6ff !important; }
.code-block .hljs-number { color: #ffa657 !important; }
.code-block .hljs-comment { color: #8b949e !important; }
/* ... and many more syntax token types */
```

## Color Scheme

The new syntax highlighting uses GitHub Dark theme-inspired colors with enhanced brightness:

| Element | Color | Description |
|---------|-------|-------------|
| Base text | `#f0f6fc` | Very bright white-blue |
| Keywords | `#ff7b72` | Bright coral red |
| Functions | `#d2a8ff` | Bright purple |
| Strings | `#a5d6ff` | Bright light blue |
| Numbers | `#ffa657` | Bright orange |
| Comments | `#8b949e` | Medium gray (good contrast) |
| Types/Classes | `#7ee787` | Bright green |
| Operators | `#e6edf3` | Bright white |

## Why This Works

1. **No External Conflicts**: By removing the external CSS import, we eliminate the override issue
2. **Full Control**: We now have complete control over all syntax highlighting colors
3. **Proper Cascade**: Our CSS rules load in the correct order and aren't overridden
4. **Customizable**: Easy to adjust colors in one place (`globals.css`)

## Testing

After making these changes:
1. Restart the dev server (important for CSS changes to take effect)
2. Hard refresh browser (`Cmd+Shift+R` on Mac, `Ctrl+Shift+R` on Windows/Linux)
3. Check code blocks have bright, readable text with proper syntax highlighting

## Key Lesson

When using third-party syntax highlighting libraries:
- **Option A**: Use their CSS theme (less control, potential override issues)
- **Option B**: Use only their parser/tokenizer and define your own CSS (full control)

We chose Option B for maximum flexibility and consistency with our design system.

## Related Files

- `landing/components/CodeBlock.tsx` - CodeBlock component (removed import)
- `landing/app/globals.css` - Custom syntax highlighting CSS
- `landing/content/blog/*.mdx` - Blog posts using code blocks

## Date
June 2, 2026