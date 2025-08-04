// Mock data for testing
export const mockRepositories = [
  {
    id: 'repo-1',
    name: 'claude-resources-setup',
    organization: 'candlefish-ai',
    url: 'https://github.com/candlefish-ai/claude-resources-setup',
    status: 'synced',
    lastSync: '2025-01-04T10:30:00Z',
    hasClaudeResources: true,
    symlinkStatus: 'complete',
    metadata: {
      branch: 'main',
      commit: 'abc123',
      syncDuration: 45,
      fileCount: 23
    }
  },
  {
    id: 'repo-2',
    name: 'project-alpha',
    organization: 'candlefish-ai',
    url: 'https://github.com/candlefish-ai/project-alpha',
    status: 'syncing',
    hasClaudeResources: false,
    symlinkStatus: 'partial',
    metadata: {
      branch: 'main',
      commit: 'def456',
      fileCount: 15
    }
  },
  {
    id: 'repo-3',
    name: 'legacy-project',
    organization: 'candlefish-ai',
    url: 'https://github.com/candlefish-ai/legacy-project',
    status: 'error',
    lastError: 'Authentication failed - please check credentials',
    hasClaudeResources: false,
    symlinkStatus: 'error',
    metadata: {
      branch: 'main',
      commit: 'ghi789'
    }
  }
]

export const mockSystemStatus = {
  overallHealth: 'healthy',
  totalRepositories: 12,
  syncedRepositories: 9,
  pendingSyncs: 2,
  failedSyncs: 1,
  lastGlobalSync: '2025-01-04T10:00:00Z',
  resourcesVersion: 'v2.1.0',
  components: {
    syncService: 'healthy',
    distributionService: 'healthy',
    storageService: 'healthy'
  }
}

export const mockSyncOperations = [
  {
    id: 'sync-1',
    repositoryId: 'repo-1',
    status: 'completed',
    progress: 100,
    startTime: '2025-01-04T10:25:00Z',
    endTime: '2025-01-04T10:30:00Z',
    logs: [
      {
        timestamp: '2025-01-04T10:25:00Z',
        level: 'info',
        message: 'Starting repository sync...'
      },
      {
        timestamp: '2025-01-04T10:27:00Z',
        level: 'info',
        message: 'Fetching remote resources...'
      },
      {
        timestamp: '2025-01-04T10:29:00Z',
        level: 'info',
        message: 'Creating symlinks...'
      },
      {
        timestamp: '2025-01-04T10:30:00Z',
        level: 'info',
        message: 'Sync completed successfully'
      }
    ],
    metadata: {
      filesProcessed: 23,
      totalFiles: 23,
      currentStep: 'Completed'
    }
  },
  {
    id: 'sync-2',
    repositoryId: 'repo-2',
    status: 'running',
    progress: 65,
    startTime: '2025-01-04T10:35:00Z',
    logs: [
      {
        timestamp: '2025-01-04T10:35:00Z',
        level: 'info',
        message: 'Starting repository sync...'
      },
      {
        timestamp: '2025-01-04T10:37:00Z',
        level: 'info',
        message: 'Processing files...'
      }
    ],
    metadata: {
      filesProcessed: 10,
      totalFiles: 15,
      currentStep: 'Processing files'
    }
  },
  {
    id: 'sync-3',
    repositoryId: 'repo-3',
    status: 'failed',
    progress: 25,
    startTime: '2025-01-04T10:15:00Z',
    endTime: '2025-01-04T10:17:00Z',
    error: 'Authentication failed - please check credentials',
    logs: [
      {
        timestamp: '2025-01-04T10:15:00Z',
        level: 'info',
        message: 'Starting repository sync...'
      },
      {
        timestamp: '2025-01-04T10:16:00Z',
        level: 'error',
        message: 'Failed to authenticate with repository'
      }
    ],
    metadata: {
      filesProcessed: 0,
      totalFiles: 0,
      currentStep: 'Authentication'
    }
  }
]

export const mockDistributionJobs = [
  {
    id: 'dist-1',
    status: 'completed',
    targetRepositories: ['repo-1', 'repo-2'],
    progress: 100,
    startTime: '2025-01-04T09:00:00Z',
    endTime: '2025-01-04T09:05:00Z',
    results: [
      {
        repositoryId: 'repo-1',
        status: 'success'
      },
      {
        repositoryId: 'repo-2',
        status: 'success'
      }
    ]
  },
  {
    id: 'dist-2',
    status: 'running',
    targetRepositories: ['repo-3'],
    progress: 50,
    startTime: '2025-01-04T10:40:00Z',
    results: [
      {
        repositoryId: 'repo-3',
        status: 'pending'
      }
    ]
  }
]

export const mockTeamMembers = [
  {
    id: 'member-1',
    username: 'john-doe',
    email: 'john@example.com',
    role: 'admin',
    status: 'active',
    lastActivity: '2025-01-04T10:30:00Z',
    repositoryAccess: ['repo-1', 'repo-2', 'repo-3'],
    onboardingStatus: {
      completed: true,
      currentStep: 5,
      steps: [
        { id: 'step-1', title: 'Account Setup', status: 'completed', required: true },
        { id: 'step-2', title: 'SSH Keys', status: 'completed', required: true },
        { id: 'step-3', title: 'Repository Access', status: 'completed', required: true },
        { id: 'step-4', title: 'CLI Setup', status: 'completed', required: false },
        { id: 'step-5', title: 'First Sync', status: 'completed', required: false }
      ]
    }
  },
  {
    id: 'member-2',
    username: 'jane-smith',
    email: 'jane@example.com',
    role: 'developer',
    status: 'invited',
    repositoryAccess: ['repo-1'],
    onboardingStatus: {
      completed: false,
      currentStep: 1,
      steps: [
        { id: 'step-1', title: 'Account Setup', status: 'pending', required: true },
        { id: 'step-2', title: 'SSH Keys', status: 'pending', required: true },
        { id: 'step-3', title: 'Repository Access', status: 'pending', required: true }
      ]
    }
  }
]

export const mockDeploymentActions = [
  {
    id: 'action-1',
    type: 'sync',
    title: 'Sync All Repositories',
    description: 'Synchronize Claude resources across all repositories',
    status: 'idle',
    lastRun: '2025-01-04T10:00:00Z',
    estimatedDuration: 120
  },
  {
    id: 'action-2',
    type: 'distribute',
    title: 'Distribute Resources',
    description: 'Push updated resources to target repositories',
    status: 'idle',
    lastRun: '2025-01-04T09:30:00Z',
    estimatedDuration: 60
  },
  {
    id: 'action-3',
    type: 'setup_local',
    title: 'Setup Local Symlinks',
    description: 'Configure local development environment',
    status: 'idle',
    estimatedDuration: 30
  },
  {
    id: 'action-4',
    type: 'validate',
    title: 'Validate Configuration',
    description: 'Check system health and configuration',
    status: 'completed',
    lastRun: '2025-01-04T10:30:00Z',
    estimatedDuration: 15
  }
]