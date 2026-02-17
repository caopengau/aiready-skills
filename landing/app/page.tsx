import Script from 'next/script'
import AnimatedHero from '../components/AnimatedHero'
import AnimatedStats from '../components/AnimatedStats'
import { Benefits } from '../components/Benefits'
import FloatingElements from '../components/FloatingElements'
import ParallaxSection from '../components/ParallaxSection'
import ChartsClient from '../components/ChartsClient'
import RequestForm from '../components/RequestForm'
import LiveScanDemo from '../components/LiveScanDemo'
import { Header } from '../components/Header'
import { Features } from '../components/Features'
import { AIReadinessScore } from '../components/AIReadinessScore'
import { NotAnotherLinter } from '../components/NotAnotherLinter'
import { Testimonials } from '../components/Testimonials'
import { CTA } from '../components/CTA'
import { FAQ } from '../components/FAQ'
import { Footer } from '../components/Footer'
import { AIOptimizedContent } from '../components/AIOptimizedContent'
import { generateBreadcrumbSchema, generateWebsiteSchema, generateProductSchema, generateHowToSchema } from '../lib/seo'

export default function HomePage() {
  // SEO Structured Data
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: '/' },
  ]);

  const websiteSchema = generateWebsiteSchema();
  
  const productSchema = generateProductSchema();

  const howToSchema = generateHowToSchema({
    name: 'How to Make Your Codebase AI-Ready',
    description: 'Step-by-step guide to optimize your codebase for AI collaboration',
    totalTime: 'PT5M',
    steps: [
      {
        name: 'Install AIReady CLI',
        text: 'Run npx @aiready/cli scan . in your project directory',
        url: '/#get-started',
      },
      {
        name: 'Review Analysis Results',
        text: 'Check the detailed report showing semantic duplicates, context analysis, and consistency issues',
      },
      {
        name: 'Fix Issues',
        text: 'Address the identified issues to improve AI collaboration',
      },
      {
        name: 'Track Progress',
        text: 'Run regular scans to maintain your AI Readiness Score',
      },
    ],
  });

  return (
    <>
      {/* SEO Structured Data */}
      <Script
        id="breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <Script
        id="website-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <Script
        id="product-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <Script
        id="howto-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />

      <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 overflow-x-hidden">
        {/* AI-Optimized Hidden Content for Search Engines */}
        <AIOptimizedContent />
        
        <FloatingElements />
      
      <Header />

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32 relative">
        <AnimatedHero />
      </section>

      {/* Getting Started (anchor for hero CTA) */}
      <section id="get-started" className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Getting started — two quick commands</h2>
          <p className="text-slate-600 mb-6">Run a scan to produce a JSON report, then open an interactive visualization of the results.</p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
            <pre className="bg-slate-100 rounded-xl p-4 font-mono text-sm text-slate-800">aiready scan .</pre>
            <pre className="bg-slate-100 rounded-xl p-4 font-mono text-sm text-slate-800">aiready visualise . --open</pre>
          </div>

          <p className="text-sm text-slate-500">Notes: <strong>`aiready scan`</strong> now defaults to JSON output so reports are easy to save or pipe. The Visualizer is included in the repo at <code>packages/visualizer</code> and can be run in dev mode with <code>pnpm --filter @aiready/visualizer dev:web</code> or invoked via <code>aiready visualise</code>.</p>
        </div>
      </section>

      {/* Live Scan Demo Section */}
      <LiveScanDemo />

      {/* Benefits Section (white) to replace standalone stats */}
      <Benefits />

      {/* Charts Section - Split layout (client-only) */}
      <ChartsClient />

      <Features />

      <AIReadinessScore />

      <NotAnotherLinter />

      <Testimonials />

      <CTA />

      {/* Request Report Form */}
      <section className="container mx-auto px-4 py-20">
        <ParallaxSection offset={10}>
          <RequestForm />
        </ParallaxSection>
      </section>

      <FAQ />

      <Footer />
      </div>
    </>
  )
}
