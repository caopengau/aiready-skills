/**
 * DynamoDB Single-Table Design for AIReady Platform
 * 
 * Table: aiready-platform
 * 
 * PK Patterns:
 *   USER#<userId>           - User record
 *   TEAM#<teamId>           - Team record
 *   REPO#<repoId>           - Repository record
 *   ANALYSIS#<repoId>       - Analysis records for a repo
 *   REMEDIATION#<remId>     - Remediation request
 * 
 * SK Patterns:
 *   #METADATA               - Entity metadata
 *   #MEMBER#<userId>        - Team membership
 *   <timestamp>             - Analysis/remediation timestamp (sorted)
 * 
 * GSI1: List all repos for a user / List members for a team
 *   GSI1PK: USER#<userId> | TEAM#<teamId>
 *   GSI1SK: REPO#<repoId> | MEMBER#<userId>
 * 
 * GSI2: List all analyses for a repo / List remediations
 *   GSI2PK: ANALYSIS#<repoId> | REMEDIATION#<repoId>
 *   GSI2SK: <timestamp>
 */

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, GetCommand, QueryCommand, UpdateCommand, DeleteCommand, BatchWriteCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';

// Initialize DynamoDB client
const client = new DynamoDBClient({ region: process.env.AWS_REGION || 'ap-southeast-2' });
const doc = DynamoDBDocumentClient.from(client, {
  marshallOptions: { convertEmptyValues: true, removeUndefinedValues: true },
  unmarshallOptions: { wrapNumbers: false },
});

const TABLE_NAME = process.env.DYNAMO_TABLE || 'aiready-platform';

// Types
export interface User {
  id: string;
  email: string;
  name?: string;
  image?: string;
  githubId?: string;
  googleId?: string;
  passwordHash?: string;
  emailVerified?: string;
  teamId?: string;
  role?: 'owner' | 'admin' | 'member';
  createdAt: string;
  updatedAt: string;
}

export interface Team {
  id: string;
  name: string;
  slug: string;
  plan: 'free' | 'pro' | 'enterprise';
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  memberCount: number;
  repoLimit: number;
  createdAt: string;
  updatedAt: string;
}

export interface TeamMember {
  teamId: string;
  userId: string;
  role: 'owner' | 'admin' | 'member';
  joinedAt: string;
}

export interface Repository {
  id: string;
  teamId?: string;
  userId: string;
  name: string;
  url: string;
  description?: string;
  defaultBranch: string;
  lastAnalysisAt?: string;
  aiScore?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Analysis {
  id: string;
  repoId: string;
  userId: string;
  timestamp: string;
  aiScore: number;
  breakdown: {
    semanticDuplicates: number;
    contextFragmentation: number;
    namingConsistency: number;
    documentationHealth: number;
  };
  rawKey: string; // S3 key for raw JSON
  summary: {
    totalFiles: number;
    totalIssues: number;
    criticalIssues: number;
    warnings: number;
  };
  createdAt: string;
}

export interface RemediationRequest {
  id: string;
  repoId: string;
  teamId?: string;
  userId: string;
  type: 'consolidation' | 'rename' | 'restructure' | 'refactor';
  risk: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'reviewing' | 'approved' | 'rejected' | 'completed';
  title: string;
  description: string;
  affectedFiles: string[];
  estimatedSavings: number; // tokens
  assignedTo?: string; // expert ID
  createdAt: string;
  updatedAt: string;
}

export interface MagicLinkToken {
  token: string;
  email: string;
  expiresAt: string;
  used: boolean;
  createdAt: string;
}

// User operations
export async function createUser(user: User): Promise<User> {
  const now = new Date().toISOString();
  const item = {
    PK: `USER#${user.id}`,
    SK: '#METADATA',
    GSI1PK: 'USERS',
    GSI1SK: user.email,
    ...user,
    createdAt: user.createdAt || now,
    updatedAt: now,
  };

  await doc.send(new PutCommand({ TableName: TABLE_NAME, Item: item }));
  return user;
}

export async function getUser(userId: string): Promise<User | null> {
  const result = await doc.send(new GetCommand({
    TableName: TABLE_NAME,
    Key: { PK: `USER#${userId}`, SK: '#METADATA' },
  }));

  return result.Item ? result.Item as User : null;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const result = await doc.send(new QueryCommand({
    TableName: TABLE_NAME,
    IndexName: 'GSI1',
    KeyConditionExpression: 'GSI1PK = :pk AND GSI1SK = :email',
    ExpressionAttributeValues: {
      ':pk': 'USERS',
      ':email': email,
    },
  }));

  return result.Items?.[0] as User | null;
}

export async function updateUser(userId: string, updates: Partial<User>): Promise<void> {
  const updateExpressions: string[] = [];
  const expressionAttributeNames: Record<string, string> = {};
  const expressionAttributeValues: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(updates)) {
    if (key === 'id') continue;
    updateExpressions.push(`#${key} = :${key}`);
    expressionAttributeNames[`#${key}`] = key;
    expressionAttributeValues[`:${key}`] = value;
  }

  if (updateExpressions.length === 0) return;

  updateExpressions.push('#updatedAt = :updatedAt');
  expressionAttributeNames['#updatedAt'] = 'updatedAt';
  expressionAttributeValues[':updatedAt'] = new Date().toISOString();

  await doc.send(new UpdateCommand({
    TableName: TABLE_NAME,
    Key: { PK: `USER#${userId}`, SK: '#METADATA' },
    UpdateExpression: `SET ${updateExpressions.join(', ')}`,
    ExpressionAttributeNames: expressionAttributeNames,
    ExpressionAttributeValues: expressionAttributeValues,
  }));
}

// Team operations
export async function createTeam(team: Team, ownerId: string): Promise<Team> {
  const now = new Date().toISOString();
  
  // Create team record
  const teamItem = {
    PK: `TEAM#${team.id}`,
    SK: '#METADATA',
    GSI1PK: 'TEAMS',
    GSI1SK: team.slug,
    ...team,
    createdAt: team.createdAt || now,
    updatedAt: now,
  };

  // Create owner membership
  const memberItem = {
    PK: `TEAM#${team.id}`,
    SK: `#MEMBER#${ownerId}`,
    GSI1PK: `TEAM#${team.id}`,
    GSI1SK: `MEMBER#${ownerId}`,
    teamId: team.id,
    userId: ownerId,
    role: 'owner',
    joinedAt: now,
  };

  await doc.send(new BatchWriteCommand({
    RequestItems: {
      [TABLE_NAME]: [
        { PutRequest: { Item: teamItem } },
        { PutRequest: { Item: memberItem } },
      ],
    },
  }));

  // Update user with teamId
  await updateUser(ownerId, { teamId: team.id, role: 'owner' });

  return team;
}

export async function getTeam(teamId: string): Promise<Team | null> {
  const result = await doc.send(new GetCommand({
    TableName: TABLE_NAME,
    Key: { PK: `TEAM#${teamId}`, SK: '#METADATA' },
  }));

  return result.Item ? result.Item as Team : null;
}

export async function getTeamBySlug(slug: string): Promise<Team | null> {
  const result = await doc.send(new QueryCommand({
    TableName: TABLE_NAME,
    IndexName: 'GSI1',
    KeyConditionExpression: 'GSI1PK = :pk AND GSI1SK = :slug',
    ExpressionAttributeValues: {
      ':pk': 'TEAMS',
      ':slug': slug,
    },
  }));

  return result.Items?.[0] as Team | null;
}

export async function listTeamMembers(teamId: string): Promise<(TeamMember & { user: User })[]> {
  const result = await doc.send(new QueryCommand({
    TableName: TABLE_NAME,
    KeyConditionExpression: 'PK = :pk AND begins_with(SK, :prefix)',
    ExpressionAttributeValues: {
      ':pk': `TEAM#${teamId}`,
      ':prefix': '#MEMBER#',
    },
  }));

  // Fetch user details for each member
  const members = result.Items || [];
  const enrichedMembers = await Promise.all(
    members.map(async (member) => {
      const user = await getUser(member.userId);
      return { ...member, user } as TeamMember & { user: User };
    })
  );

  return enrichedMembers;
}

export async function addTeamMember(teamId: string, userId: string, role: 'admin' | 'member' = 'member'): Promise<void> {
  const now = new Date().toISOString();
  
  const memberItem = {
    PK: `TEAM#${teamId}`,
    SK: `#MEMBER#${userId}`,
    GSI1PK: `TEAM#${teamId}`,
    GSI1SK: `MEMBER#${userId}`,
    teamId,
    userId,
    role,
    joinedAt: now,
  };

  await doc.send(new PutCommand({ TableName: TABLE_NAME, Item: memberItem }));
  await updateUser(userId, { teamId, role });
}

export async function removeTeamMember(teamId: string, userId: string): Promise<void> {
  await doc.send(new DeleteCommand({
    TableName: TABLE_NAME,
    Key: { PK: `TEAM#${teamId}`, SK: `#MEMBER#${userId}` },
  }));
  await updateUser(userId, { teamId: undefined, role: undefined });
}

export async function updateTeam(teamId: string, updates: Partial<Team>): Promise<void> {
  const updateExpressions: string[] = [];
  const expressionAttributeNames: Record<string, string> = {};
  const expressionAttributeValues: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(updates)) {
    if (key === 'id') continue;
    updateExpressions.push(`#${key} = :${key}`);
    expressionAttributeNames[`#${key}`] = key;
    expressionAttributeValues[`:${key}`] = value;
  }

  if (updateExpressions.length === 0) return;

  updateExpressions.push('#updatedAt = :updatedAt');
  expressionAttributeNames['#updatedAt'] = 'updatedAt';
  expressionAttributeValues[':updatedAt'] = new Date().toISOString();

  await doc.send(new UpdateCommand({
    TableName: TABLE_NAME,
    Key: { PK: `TEAM#${teamId}`, SK: '#METADATA' },
    UpdateExpression: `SET ${updateExpressions.join(', ')}`,
    ExpressionAttributeNames: expressionAttributeNames,
    ExpressionAttributeValues: expressionAttributeValues,
  }));
}

// Repository operations
export async function createRepository(repo: Repository): Promise<Repository> {
  const now = new Date().toISOString();
  const item = {
    PK: `REPO#${repo.id}`,
    SK: '#METADATA',
    GSI1PK: repo.teamId ? `TEAM#${repo.teamId}` : `USER#${repo.userId}`,
    GSI1SK: `REPO#${repo.id}`,
    ...repo,
    createdAt: repo.createdAt || now,
    updatedAt: now,
  };

  await doc.send(new PutCommand({ TableName: TABLE_NAME, Item: item }));
  return repo;
}

export async function getRepository(repoId: string): Promise<Repository | null> {
  const result = await doc.send(new GetCommand({
    TableName: TABLE_NAME,
    Key: { PK: `REPO#${repoId}`, SK: '#METADATA' },
  }));

  return result.Item ? result.Item as Repository : null;
}

export async function listUserRepositories(userId: string): Promise<Repository[]> {
  const result = await doc.send(new QueryCommand({
    TableName: TABLE_NAME,
    IndexName: 'GSI1',
    KeyConditionExpression: 'GSI1PK = :pk AND begins_with(GSI1SK, :prefix)',
    ExpressionAttributeValues: {
      ':pk': `USER#${userId}`,
      ':prefix': 'REPO#',
    },
    ScanIndexForward: false,
  }));

  return (result.Items || []) as Repository[];
}

export async function listTeamRepositories(teamId: string): Promise<Repository[]> {
  const result = await doc.send(new QueryCommand({
    TableName: TABLE_NAME,
    IndexName: 'GSI1',
    KeyConditionExpression: 'GSI1PK = :pk AND begins_with(GSI1SK, :prefix)',
    ExpressionAttributeValues: {
      ':pk': `TEAM#${teamId}`,
      ':prefix': 'REPO#',
    },
    ScanIndexForward: false,
  }));

  return (result.Items || []) as Repository[];
}

export async function updateRepository(repoId: string, updates: Partial<Repository>): Promise<void> {
  const updateExpressions: string[] = [];
  const expressionAttributeNames: Record<string, string> = {};
  const expressionAttributeValues: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(updates)) {
    if (key === 'id' || key === 'userId') continue;
    updateExpressions.push(`#${key} = :${key}`);
    expressionAttributeNames[`#${key}`] = key;
    expressionAttributeValues[`:${key}`] = value;
  }

  if (updateExpressions.length === 0) return;

  updateExpressions.push('#updatedAt = :updatedAt');
  expressionAttributeNames['#updatedAt'] = 'updatedAt';
  expressionAttributeValues[':updatedAt'] = new Date().toISOString();

  await doc.send(new UpdateCommand({
    TableName: TABLE_NAME,
    Key: { PK: `REPO#${repoId}`, SK: '#METADATA' },
    UpdateExpression: `SET ${updateExpressions.join(', ')}`,
    ExpressionAttributeNames: expressionAttributeNames,
    ExpressionAttributeValues: expressionAttributeValues,
  }));
}

export async function deleteRepository(repoId: string): Promise<void> {
  await doc.send(new DeleteCommand({
    TableName: TABLE_NAME,
    Key: { PK: `REPO#${repoId}`, SK: '#METADATA' },
  }));
}

// Analysis operations
export async function createAnalysis(analysis: Analysis): Promise<Analysis> {
  const now = new Date().toISOString();
  const item = {
    PK: `ANALYSIS#${analysis.repoId}`,
    SK: analysis.timestamp,
    GSI1PK: `USER#${analysis.userId}`,
    GSI1SK: `ANALYSIS#${analysis.timestamp}`,
    GSI2PK: `ANALYSIS#${analysis.repoId}`,
    GSI2SK: analysis.timestamp,
    ...analysis,
    createdAt: analysis.createdAt || now,
  };

  await doc.send(new PutCommand({ TableName: TABLE_NAME, Item: item }));
  
  // Update repo's lastAnalysisAt and aiScore
  await updateRepository(analysis.repoId, {
    lastAnalysisAt: analysis.timestamp,
    aiScore: analysis.aiScore,
  });

  return analysis;
}

export async function getAnalysis(repoId: string, timestamp: string): Promise<Analysis | null> {
  const result = await doc.send(new GetCommand({
    TableName: TABLE_NAME,
    Key: { PK: `ANALYSIS#${repoId}`, SK: timestamp },
  }));

  return result.Item ? result.Item as Analysis : null;
}

export async function listRepositoryAnalyses(repoId: string, limit = 10): Promise<Analysis[]> {
  const result = await doc.send(new QueryCommand({
    TableName: TABLE_NAME,
    KeyConditionExpression: 'PK = :pk',
    ExpressionAttributeValues: {
      ':pk': `ANALYSIS#${repoId}`,
    },
    Limit: limit,
    ScanIndexForward: false,
  }));

  return (result.Items || []) as Analysis[];
}

export async function getLatestAnalysis(repoId: string): Promise<Analysis | null> {
  const result = await doc.send(new QueryCommand({
    TableName: TABLE_NAME,
    KeyConditionExpression: 'PK = :pk',
    ExpressionAttributeValues: {
      ':pk': `ANALYSIS#${repoId}`,
    },
    Limit: 1,
    ScanIndexForward: false,
  }));

  return result.Items?.[0] as Analysis | null;
}

// Remediation operations
export async function createRemediation(remediation: RemediationRequest): Promise<RemediationRequest> {
  const now = new Date().toISOString();
  const item = {
    PK: `REMEDIATION#${remediation.id}`,
    SK: '#METADATA',
    GSI1PK: remediation.teamId ? `TEAM#${remediation.teamId}` : `USER#${remediation.userId}`,
    GSI1SK: `REMEDIATION#${remediation.id}`,
    GSI2PK: `REMEDIATION#${remediation.repoId}`,
    GSI2SK: remediation.createdAt,
    ...remediation,
    createdAt: remediation.createdAt || now,
    updatedAt: now,
  };

  await doc.send(new PutCommand({ TableName: TABLE_NAME, Item: item }));
  return remediation;
}

export async function getRemediation(remediationId: string): Promise<RemediationRequest | null> {
  const result = await doc.send(new GetCommand({
    TableName: TABLE_NAME,
    Key: { PK: `REMEDIATION#${remediationId}`, SK: '#METADATA' },
  }));

  return result.Item ? result.Item as RemediationRequest : null;
}

export async function listRemediations(repoId: string, limit = 20): Promise<RemediationRequest[]> {
  const result = await doc.send(new QueryCommand({
    TableName: TABLE_NAME,
    IndexName: 'GSI2',
    KeyConditionExpression: 'GSI2PK = :pk',
    ExpressionAttributeValues: {
      ':pk': `REMEDIATION#${repoId}`,
    },
    Limit: limit,
    ScanIndexForward: false,
  }));

  return (result.Items || []) as RemediationRequest[];
}

export async function listTeamRemediations(teamId: string, limit = 50): Promise<RemediationRequest[]> {
  const result = await doc.send(new QueryCommand({
    TableName: TABLE_NAME,
    IndexName: 'GSI1',
    KeyConditionExpression: 'GSI1PK = :pk AND begins_with(GSI1SK, :prefix)',
    ExpressionAttributeValues: {
      ':pk': `TEAM#${teamId}`,
      ':prefix': 'REMEDIATION#',
    },
    Limit: limit,
    ScanIndexForward: false,
  }));

  return (result.Items || []) as RemediationRequest[];
}

export async function updateRemediation(remediationId: string, updates: Partial<RemediationRequest>): Promise<void> {
  const updateExpressions: string[] = [];
  const expressionAttributeNames: Record<string, string> = {};
  const expressionAttributeValues: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(updates)) {
    if (key === 'id') continue;
    updateExpressions.push(`#${key} = :${key}`);
    expressionAttributeNames[`#${key}`] = key;
    expressionAttributeValues[`:${key}`] = value;
  }

  if (updateExpressions.length === 0) return;

  updateExpressions.push('#updatedAt = :updatedAt');
  expressionAttributeNames['#updatedAt'] = 'updatedAt';
  expressionAttributeValues[':updatedAt'] = new Date().toISOString();

  await doc.send(new UpdateCommand({
    TableName: TABLE_NAME,
    Key: { PK: `REMEDIATION#${remediationId}`, SK: '#METADATA' },
    UpdateExpression: `SET ${updateExpressions.join(', ')}`,
    ExpressionAttributeNames: expressionAttributeNames,
    ExpressionAttributeValues: expressionAttributeValues,
  }));
}

// Magic Link Token operations
export async function createMagicLinkToken(token: MagicLinkToken): Promise<MagicLinkToken> {
  const now = new Date().toISOString();
  const item = {
    PK: `MAGICLINK#${token.token}`,
    SK: '#METADATA',
    email: token.email,
    expiresAt: token.expiresAt,
    used: false,
    createdAt: now,
  };

  await doc.send(new PutCommand({ TableName: TABLE_NAME, Item: item }));
  return token;
}

export async function getMagicLinkToken(token: string): Promise<MagicLinkToken | null> {
  const result = await doc.send(new GetCommand({
    TableName: TABLE_NAME,
    Key: { PK: `MAGICLINK#${token}`, SK: '#METADATA' },
  }));

  return result.Item ? result.Item as MagicLinkToken : null;
}

export async function markMagicLinkUsed(token: string): Promise<void> {
  await doc.send(new UpdateCommand({
    TableName: TABLE_NAME,
    Key: { PK: `MAGICLINK#${token}`, SK: '#METADATA' },
    UpdateExpression: 'SET #used = :used',
    ExpressionAttributeNames: { '#used': 'used' },
    ExpressionAttributeValues: { ':used': true },
  }));
}

export { doc, TABLE_NAME };
