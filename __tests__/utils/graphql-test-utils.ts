import { ApolloServer } from '@apollo/server';
import { gql } from 'graphql-tag';
import { DocumentNode } from 'graphql';
import jwt from 'jsonwebtoken';

// GraphQL test utilities for comprehensive testing

/**
 * Creates a test Apollo Server instance with mocked context
 */
export const createTestServer = async (typeDefs: DocumentNode, resolvers: any) => {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: async ({ req }: { req: any }) => {
      const token = req?.headers?.authorization?.replace('Bearer ', '');
      let user = null;
      
      if (token) {
        try {
          user = jwt.verify(token, process.env.JWT_SECRET || 'test-secret');
        } catch (error) {
          // Invalid token, user remains null
        }
      }
      
      return {
        user,
        db: createMockDatabase(),
        req,
      };
    },
  });
  
  return server;
};

/**
 * Mock database interface for testing GraphQL resolvers
 */
export const createMockDatabase = () => {
  const mockData = {
    users: new Map([
      ['user-1', {
        id: 'user-1',
        email: 'john@candlefish.ai',
        name: 'John Doe',
        role: 'USER',
        organizationId: 'org-1',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      }],
      ['user-2', {
        id: 'user-2',
        email: 'admin@candlefish.ai',
        name: 'Admin User',
        role: 'ADMIN',
        organizationId: 'org-1',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      }],
    ]),
    
    documents: new Map([
      ['doc-1', {
        id: 'doc-1',
        title: 'Test Document',
        content: 'This is a test document',
        authorId: 'user-1',
        organizationId: 'org-1',
        status: 'PUBLISHED',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      }],
    ]),
    
    organizations: new Map([
      ['org-1', {
        id: 'org-1',
        name: 'Test Organization',
        slug: 'test-org',
        plan: 'PROFESSIONAL',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      }],
    ]),
    
    collaborationSessions: new Map(),
    comments: new Map(),
    subscriptions: new Map(),
  };
  
  return {
    // User operations
    findUserById: jest.fn((id: string) => mockData.users.get(id)),
    findUserByEmail: jest.fn((email: string) => {
      for (const user of mockData.users.values()) {
        if (user.email === email) return user;
      }
      return null;
    }),
    createUser: jest.fn((userData: any) => {
      const id = `user-${Date.now()}`;
      const user = { ...userData, id, createdAt: new Date(), updatedAt: new Date() };
      mockData.users.set(id, user);
      return user;
    }),
    updateUser: jest.fn((id: string, updates: any) => {
      const user = mockData.users.get(id);
      if (!user) return null;
      const updated = { ...user, ...updates, updatedAt: new Date() };
      mockData.users.set(id, updated);
      return updated;
    }),
    
    // Document operations
    findDocumentById: jest.fn((id: string) => mockData.documents.get(id)),
    findDocumentsByAuthor: jest.fn((authorId: string) => {
      return Array.from(mockData.documents.values())
        .filter(doc => doc.authorId === authorId);
    }),
    createDocument: jest.fn((docData: any) => {
      const id = `doc-${Date.now()}`;
      const document = { ...docData, id, createdAt: new Date(), updatedAt: new Date() };
      mockData.documents.set(id, document);
      return document;
    }),
    updateDocument: jest.fn((id: string, updates: any) => {
      const doc = mockData.documents.get(id);
      if (!doc) return null;
      const updated = { ...doc, ...updates, updatedAt: new Date() };
      mockData.documents.set(id, updated);
      return updated;
    }),
    
    // Organization operations
    findOrganizationById: jest.fn((id: string) => mockData.organizations.get(id)),
    createOrganization: jest.fn((orgData: any) => {
      const id = `org-${Date.now()}`;
      const org = { ...orgData, id, createdAt: new Date(), updatedAt: new Date() };
      mockData.organizations.set(id, org);
      return org;
    }),
    
    // Collaboration operations
    createCollaborationSession: jest.fn((sessionData: any) => {
      const id = `session-${Date.now()}`;
      const session = { ...sessionData, id, createdAt: new Date() };
      mockData.collaborationSessions.set(id, session);
      return session;
    }),
    
    // Comment operations
    createComment: jest.fn((commentData: any) => {
      const id = `comment-${Date.now()}`;
      const comment = { ...commentData, id, createdAt: new Date(), updatedAt: new Date() };
      mockData.comments.set(id, comment);
      return comment;
    }),
    
    // Subscription operations
    createSubscription: jest.fn((subData: any) => {
      const id = `sub-${Date.now()}`;
      const subscription = { ...subData, id, createdAt: new Date() };
      mockData.subscriptions.set(id, subscription);
      return subscription;
    }),
    
    // Reset mock data
    reset: jest.fn(() => {
      mockData.users.clear();
      mockData.documents.clear();
      mockData.organizations.clear();
      mockData.collaborationSessions.clear();
      mockData.comments.clear();
      mockData.subscriptions.clear();
    }),
  };
};

/**
 * GraphQL query testing utilities
 */
export const graphqlTestUtils = {
  // Test GraphQL queries with authentication
  async executeQuery(
    server: ApolloServer,
    query: DocumentNode | string,
    variables: Record<string, any> = {},
    user?: any
  ) {
    let token = '';
    if (user) {
      token = jwt.sign(user, process.env.JWT_SECRET || 'test-secret');
    }
    
    const response = await server.executeOperation({
      query,
      variables,
    }, {
      contextValue: {
        user,
        db: createMockDatabase(),
        req: {
          headers: {
            authorization: user ? `Bearer ${token}` : undefined,
          },
        },
      },
    });
    
    return response;
  },
  
  // Create test user with specific role
  createTestUser(overrides: Partial<any> = {}) {
    return {
      id: 'test-user-id',
      email: 'test@candlefish.ai',
      name: 'Test User',
      role: 'USER',
      organizationId: 'test-org-id',
      ...overrides,
    };
  },
  
  // Create admin user for testing
  createAdminUser(overrides: Partial<any> = {}) {
    return this.createTestUser({ role: 'ADMIN', ...overrides });
  },
};

/**
 * Common GraphQL test queries and mutations
 */
export const TEST_QUERIES = {
  GET_USER: gql`
    query GetUser($id: ID!) {
      user(id: $id) {
        id
        email
        name
        role
        organization {
          id
          name
        }
      }
    }
  `,
  
  GET_DOCUMENTS: gql`
    query GetDocuments($authorId: ID) {
      documents(authorId: $authorId) {
        id
        title
        content
        status
        author {
          id
          name
        }
        createdAt
      }
    }
  `,
  
  CREATE_DOCUMENT: gql`
    mutation CreateDocument($input: CreateDocumentInput!) {
      createDocument(input: $input) {
        id
        title
        content
        status
        author {
          id
          name
        }
      }
    }
  `,
  
  LOGIN: gql`
    mutation Login($email: String!, $password: String!) {
      login(email: $email, password: $password) {
        token
        user {
          id
          email
          name
          role
        }
      }
    }
  `,
  
  DOCUMENT_UPDATED: gql`
    subscription DocumentUpdated($documentId: ID!) {
      documentUpdated(documentId: $documentId) {
        id
        title
        content
        updatedAt
        lastEditedBy {
          id
          name
        }
      }
    }
  `,
};

/**
 * Error testing utilities
 */
export const errorTestUtils = {
  expectGraphQLError(response: any, expectedErrorMessage: string) {
    expect(response.body.singleResult.errors).toBeDefined();
    expect(response.body.singleResult.errors).toHaveLength(1);
    expect(response.body.singleResult.errors[0].message).toContain(expectedErrorMessage);
  },
  
  expectUnauthorizedError(response: any) {
    this.expectGraphQLError(response, 'Not authenticated');
  },
  
  expectForbiddenError(response: any) {
    this.expectGraphQLError(response, 'Forbidden');
  },
  
  expectValidationError(response: any) {
    this.expectGraphQLError(response, 'Validation error');
  },
};

/**
 * Performance testing utilities
 */
export const performanceTestUtils = {
  async measureQueryPerformance(
    server: ApolloServer,
    query: DocumentNode | string,
    variables: Record<string, any> = {},
    iterations: number = 10
  ) {
    const times: number[] = [];
    
    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      await server.executeOperation({ query, variables });
      const end = performance.now();
      times.push(end - start);
    }
    
    const average = times.reduce((sum, time) => sum + time, 0) / times.length;
    const min = Math.min(...times);
    const max = Math.max(...times);
    
    return {
      average,
      min,
      max,
      times,
    };
  },
};
