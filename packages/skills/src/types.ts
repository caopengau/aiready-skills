/**
 * Type definitions for skill rules and document structure
 */

export type ImpactLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'

export interface Rule {
  id: string // e.g., "1.1", "2.3"
  title: string
  section: number
  subsection?: number
  impact: ImpactLevel
  impactDescription?: string
  explanation: string
  examples: Array<{
    type: 'incorrect' | 'correct'
    code: string
    language: string
    description?: string
  }>
  references?: string[]
  tags?: string[]
}

export interface Section {
  number: number
  title: string
  impact: ImpactLevel
  introduction?: string
  rules: Rule[]
}

export interface GuidelinesDocument {
  version: string
  organization: string
  date: string
  abstract: string
  sections: Section[]
  references?: string[]
}

export interface Metadata {
  version: string
  organization: string
  date: string
  abstract: string
  references?: string[]
}

export interface TestCase {
  ruleId: string
  ruleTitle: string
  type: 'bad' | 'good'
  code: string
  language: string
  description?: string
}
