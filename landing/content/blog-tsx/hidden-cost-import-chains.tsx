import meta from './hidden-cost-import-chains.meta';
import React from 'react';
import CodeBlock from '../../components/CodeBlock';

const Post = () => (
  <>
    <p>
      You open a seemingly simple file in your codebase — a short API handler
      with a few imports. It looks harmless. But when your AI assistant loads
      the file, those imports cascade into dozens of transitive files and
      thousands of tokens.
    </p>

    <CodeBlock lang="typescript">{`// src/api/user-profile.ts (52 lines)
import { validateUser } from './validators';
import { formatResponse } from './formatters';
import { logRequest } from './logger';

export async function getUserProfile(userId: string) {
  validateUser(userId);
  const user = await fetchUser(userId);
  logRequest('getUserProfile', userId);
  return formatResponse(user);
}`}</CodeBlock>

    <p>
      That 52-line file can expand into a 19,000+ token context load once the
      dependency graph is traversed. This is the hidden cost of import chains —
      and it kills AI assistants' ability to reason about your code.
    </p>

    <h3>The Context Window Crisis</h3>
    <p>
      Every import creates a cascading context cost: direct dependencies,
      transitive dependencies, type dependencies, and implementation depth.
      Models with 32K–128K token windows quickly run out of useful context in
      real repositories.
    </p>

    <p>
      `@aiready/context-analyzer` measures import depth, token budget,
      fragmentation, and cohesion to help you find and prioritize the worst
      offenders.
    </p>

  </>
);

export default Post;
