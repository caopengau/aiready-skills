import InvisibleCodebase from './invisible-codebase';
import invisibleCodebaseMeta from './invisible-codebase.meta';
import AiCodeDebtTsunami from './ai-code-debt-tsunami';
import aiCodeDebtTsunamiMeta from './ai-code-debt-tsunami.meta';
import MetricsThatMatter from './metrics-that-actually-matter';
import metricsThatMatterMeta from './metrics-that-actually-matter.meta';
import SemanticDuplicateDetection from './semantic-duplicate-detection';
import semanticDuplicateDetectionMeta from './semantic-duplicate-detection.meta';

export const posts = [
  {
    slug: invisibleCodebaseMeta.slug,
    title: invisibleCodebaseMeta.title,
    date: invisibleCodebaseMeta.date,
    excerpt: invisibleCodebaseMeta.excerpt,
    author: invisibleCodebaseMeta.author,
    tags: invisibleCodebaseMeta.tags || [],
    readingTime: invisibleCodebaseMeta.readingTime || '5 min read',
    Content: InvisibleCodebase,
  },
  {
    slug: aiCodeDebtTsunamiMeta.slug,
    title: aiCodeDebtTsunamiMeta.title,
    date: aiCodeDebtTsunamiMeta.date,
    excerpt: aiCodeDebtTsunamiMeta.excerpt,
    author: aiCodeDebtTsunamiMeta.author,
    tags: aiCodeDebtTsunamiMeta.tags || [],
    readingTime: aiCodeDebtTsunamiMeta.readingTime || '5 min read',
    Content: AiCodeDebtTsunami,
  },
  {
    slug: metricsThatMatterMeta.slug,
    title: metricsThatMatterMeta.title,
    date: metricsThatMatterMeta.date,
    excerpt: metricsThatMatterMeta.excerpt,
    author: metricsThatMatterMeta.author,
    tags: metricsThatMatterMeta.tags || [],
    readingTime: metricsThatMatterMeta.readingTime || '5 min read',
    Content: MetricsThatMatter,
  },
  {
    slug: semanticDuplicateDetectionMeta.slug,
    title: semanticDuplicateDetectionMeta.title,
    date: semanticDuplicateDetectionMeta.date,
    excerpt: semanticDuplicateDetectionMeta.excerpt,
    author: semanticDuplicateDetectionMeta.author,
    tags: semanticDuplicateDetectionMeta.tags || [],
    readingTime: semanticDuplicateDetectionMeta.readingTime || '5 min read',
    Content: SemanticDuplicateDetection,
  },
];
