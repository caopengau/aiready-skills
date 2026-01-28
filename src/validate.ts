#!/usr/bin/env node
/**
 * Validation script for rule files
 */

import { readdir } from 'fs/promises'
import { join } from 'path'
import { parseRuleFile } from './parser.js'
import { SKILL_CONFIG } from './config.js'

async function validate() {
  console.log('Validating rule files...')

  const files = await readdir(SKILL_CONFIG.rulesDir)
  const ruleFiles = files.filter(
    (f) => f.endsWith('.md') && !f.startsWith('_') && f !== 'README.md'
  )

  let errors = 0
  let warnings = 0

  for (const file of ruleFiles) {
    const filePath = join(SKILL_CONFIG.rulesDir, file)
    console.log(`\nValidating ${file}...`)

    try {
      const { rule, section } = await parseRuleFile(
        filePath,
        SKILL_CONFIG.sectionMap
      )

      // Check required fields
      if (!rule.title || rule.title === 'Untitled Rule') {
        console.error(`  ❌ Error: Missing or invalid title`)
        errors++
      }

      if (!rule.explanation || rule.explanation.length < 20) {
        console.error(`  ❌ Error: Missing or too short explanation`)
        errors++
      }

      if (rule.examples.length === 0) {
        console.error(`  ❌ Error: No code examples found`)
        errors++
      } else {
        const hasIncorrect = rule.examples.some((e) => e.type === 'incorrect')
        const hasCorrect = rule.examples.some((e) => e.type === 'correct')

        if (!hasIncorrect) {
          console.warn(`  ⚠️  Warning: No "Incorrect" example`)
          warnings++
        }

        if (!hasCorrect) {
          console.warn(`  ⚠️  Warning: No "Correct" example`)
          warnings++
        }
      }

      if (section === 0) {
        console.warn(`  ⚠️  Warning: Could not infer section from filename`)
        warnings++
      }

      if (!rule.references || rule.references.length === 0) {
        console.warn(`  ⚠️  Warning: No references provided`)
        warnings++
      }

      if (!rule.impactDescription) {
        console.warn(`  ⚠️  Warning: No impact description`)
        warnings++
      }

      console.log(`  ✅ Valid`)
      console.log(`     Title: ${rule.title}`)
      console.log(`     Section: ${section}`)
      console.log(`     Impact: ${rule.impact}`)
      console.log(`     Examples: ${rule.examples.length}`)
    } catch (error) {
      console.error(`  ❌ Parse error:`, error)
      errors++
    }
  }

  console.log(`\n${'='.repeat(60)}`)
  console.log(`Validation complete:`)
  console.log(`  Files checked: ${ruleFiles.length}`)
  console.log(`  Errors: ${errors}`)
  console.log(`  Warnings: ${warnings}`)

  if (errors > 0) {
    console.log(`\n❌ Validation failed with ${errors} error(s)`)
    process.exit(1)
  } else if (warnings > 0) {
    console.log(`\n⚠️  Validation passed with ${warnings} warning(s)`)
  } else {
    console.log(`\n✅ All rules valid!`)
  }
}

validate()
