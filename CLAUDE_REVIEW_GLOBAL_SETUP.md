# Claude Review System - Global Organization Setup

## 🌐 Applying Claude Reviews Across All Candlefish.ai Projects

This guide explains how to implement the Claude review system organization-wide for all candlefish.ai repositories.

## 📋 Overview

Transform your individual Claude review implementation into an organization-wide automated code review system that:
- Works automatically on all repositories
- Shares costs and configurations
- Provides centralized monitoring
- Scales with your organization

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   GitHub Organization                         │
│                    (candlefish.ai)                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────┐    ┌─────────────────┐                │
│  │ Org Secrets     │    │ Org Workflows   │                │
│  │ - AWS_ROLE_ARN  │    │ - .github/      │                │
│  │ - AWS_REGION    │    │   workflows/    │                │
│  └─────────────────┘    └─────────────────┘                │
│           │                      │                           │
│           ▼                      ▼                           │
│  ┌─────────────────────────────────────────┐               │
│  │         All Organization Repos           │               │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐             │
│  │  │ Repo A   │  │ Repo B   │  │ Repo C   │ ...         │
│  │  └──────────┘  └──────────┘  └──────────┘             │
│  └─────────────────────────────────────────┘               │
│                      │                                      │
│                      ▼                                      │
│           ┌──────────────────────┐                        │
│           │ Centralized DynamoDB │                        │
│           │   Cost Tracking      │                        │
│           └──────────────────────┘                        │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 Implementation Steps

### 1. Create Organization Template Repository

Create `.github` repository in your organization for shared workflows:

```bash
# Create the special .github repository
gh repo create candlefish-ai/.github --public --description "Organization-wide GitHub Actions workflows and configs"

# Clone it locally
git clone https://github.com/candlefish-ai/.github.git
cd .github
```

### 2. Set Up Organization Secrets

Configure secrets at the organization level:

```bash
# Set organization-wide secrets
gh secret set AWS_ROLE_ARN --org candlefish-ai --visibility all
gh secret set AWS_REGION --org candlefish-ai --value "us-east-1" --visibility all

# Optional: Restrict to specific repositories
gh secret set AWS_ROLE_ARN --org candlefish-ai --visibility selected --repos "repo1,repo2"
```

### 3. Create Reusable Workflows

Create shared workflows that all repos can use:

#### `.github/workflows/claude-review-reusable.yml`
```yaml
name: Claude Review (Reusable)

on:
  workflow_call:
    inputs:
      review_type:
        required: false
        type: string
        default: 'standard'
      incremental:
        required: false
        type: boolean
        default: false
      skip_patterns:
        required: false
        type: string
        default: ''
    secrets:
      AWS_ROLE_ARN:
        required: true

jobs:
  review:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pull-requests: write
      id-token: write
    
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: ${{ secrets.AWS_ROLE_ARN }}
          aws-region: us-east-1
      
      - name: Get API key from Secrets Manager
        id: get-api-key
        run: |
          API_KEY=$(aws secretsmanager get-secret-value \
            --secret-id "candlefish-ai/anthropic/api-key" \
            --query SecretString --output text)
          echo "::add-mask::$API_KEY"
          echo "api-key=$API_KEY" >> $GITHUB_OUTPUT
      
      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'
      
      - name: Download review scripts
        run: |
          # Download scripts from template repository
          curl -sL https://raw.githubusercontent.com/candlefish-ai/.github/main/scripts/claude_review_enhanced.py -o claude_review_enhanced.py
          curl -sL https://raw.githubusercontent.com/candlefish-ai/.github/main/scripts/claude_cost_tracker.py -o claude_cost_tracker.py
          chmod +x *.py
      
      - name: Install dependencies
        run: |
          pip install anthropic>=0.39.0 boto3>=1.34.0 PyGithub>=2.4.0 requests>=2.32.0 tenacity>=8.5.0
      
      - name: Run Claude review
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          ANTHROPIC_API_KEY: ${{ steps.get-api-key.outputs.api-key }}
          PR_NUMBER: ${{ github.event.pull_request.number }}
          REVIEW_TYPE: ${{ inputs.review_type }}
          INCREMENTAL: ${{ inputs.incremental }}
          SKIP_PATTERNS: ${{ inputs.skip_patterns }}
        run: |
          python claude_review_enhanced.py
```

### 4. Organization Workflow Templates

Create workflow templates that appear in all repos:

#### `workflow-templates/claude-review.yml`
```yaml
name: Claude AI Review

on:
  pull_request:
    types: [opened, synchronize, ready_for_review]
  issue_comment:
    types: [created]

jobs:
  check-comment:
    if: |
      (github.event_name == 'pull_request' && github.event.pull_request.draft == false) ||
      (github.event_name == 'issue_comment' && contains(github.event.comment.body, '/claude-review'))
    runs-on: ubuntu-latest
    outputs:
      should_run: ${{ steps.check.outputs.should_run }}
      review_type: ${{ steps.check.outputs.review_type }}
      incremental: ${{ steps.check.outputs.incremental }}
    steps:
      - id: check
        run: |
          # Parse review command
          echo "should_run=true" >> $GITHUB_OUTPUT
          # Add parsing logic here

  review:
    needs: check-comment
    if: needs.check-comment.outputs.should_run == 'true'
    uses: candlefish-ai/.github/.github/workflows/claude-review-reusable.yml@main
    with:
      review_type: ${{ needs.check-comment.outputs.review_type }}
      incremental: ${{ needs.check-comment.outputs.incremental }}
    secrets:
      AWS_ROLE_ARN: ${{ secrets.AWS_ROLE_ARN }}
```

#### `workflow-templates/claude-review.properties.json`
```json
{
    "name": "Claude AI Review",
    "description": "Automated AI code review using Claude Opus-4",
    "iconName": "code-review",
    "categories": ["Code Review", "AI", "Automation"],
    "filePatterns": ["package.json", "pyproject.toml", "Cargo.toml", "go.mod"]
}
```

### 5. Centralized Cost Tracking

Modify DynamoDB schema for multi-repo tracking:

```python
# Enhanced DynamoDB schema
{
    'TableName': 'candlefish-claude-reviews',
    'KeySchema': [
        {'AttributeName': 'org_repo_review', 'KeyType': 'HASH'},  # org#repo#review_id
        {'AttributeName': 'timestamp', 'KeyType': 'RANGE'}
    ],
    'GlobalSecondaryIndexes': [
        {
            'IndexName': 'org-cost-index',
            'Keys': [
                {'AttributeName': 'organization', 'KeyType': 'HASH'},
                {'AttributeName': 'month', 'KeyType': 'RANGE'}
            ]
        },
        {
            'IndexName': 'repo-cost-index',
            'Keys': [
                {'AttributeName': 'repository', 'KeyType': 'HASH'},
                {'AttributeName': 'timestamp', 'KeyType': 'RANGE'}
            ]
        }
    ]
}
```

### 6. Automated Setup Script

Create a script to onboard new repositories:

#### `scripts/setup-claude-review.sh`
```bash
#!/bin/bash

REPO=$1
ORG="candlefish-ai"

if [ -z "$REPO" ]; then
    echo "Usage: ./setup-claude-review.sh <repository-name>"
    exit 1
fi

echo "🚀 Setting up Claude reviews for $ORG/$REPO"

# Create .github/workflows directory
gh api -X PUT "/repos/$ORG/$REPO/contents/.github/workflows/claude-review.yml" \
  --field message="Add Claude AI review workflow" \
  --field content="$(base64 < workflow-templates/claude-review.yml)"

# Enable GitHub Actions if needed
gh api -X PUT "/repos/$ORG/$REPO/actions/permissions" \
  --field enabled=true \
  --field allowed_actions=all

# Add repository to cost tracking
aws dynamodb put-item \
  --table-name candlefish-claude-reviews \
  --item '{
    "org_repo_review": {"S": "candlefish-ai#'$REPO'#setup"},
    "timestamp": {"S": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"},
    "setup_date": {"S": "'$(date -u +%Y-%m-%d)'"},
    "repository": {"S": "'$REPO'"},
    "organization": {"S": "'$ORG'"}
  }'

echo "✅ Claude reviews enabled for $REPO"
```

### 7. Organization Dashboard

Create a centralized dashboard:

#### `dashboard/claude-costs.html`
```html
<!DOCTYPE html>
<html>
<head>
    <title>Candlefish AI - Claude Review Costs</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
</head>
<body>
    <h1>Organization-wide Claude Review Costs</h1>
    <canvas id="costChart"></canvas>
    <div id="repoBreakdown"></div>
    
    <script>
    // Fetch data from API Gateway connected to DynamoDB
    fetch('https://api.candlefish.ai/claude-costs')
        .then(response => response.json())
        .then(data => {
            // Render charts
            new Chart(document.getElementById('costChart'), {
                type: 'line',
                data: {
                    labels: data.months,
                    datasets: [{
                        label: 'Total Monthly Cost',
                        data: data.costs,
                        borderColor: 'rgb(139, 92, 246)',
                        tension: 0.1
                    }]
                }
            });
        });
    </script>
</body>
</html>
```

## 🎯 Quick Start for New Projects

### Option 1: Automatic Setup
```bash
# For any new repository
./scripts/setup-claude-review.sh my-new-repo
```

### Option 2: GitHub UI
1. Go to repository → Actions → New workflow
2. Search for "Claude AI Review"
3. Click "Set up this workflow"
4. Commit the workflow file

### Option 3: Bulk Setup
```bash
# Setup for all repos without Claude reviews
for repo in $(gh repo list candlefish-ai --limit 100 --json name -q '.[].name'); do
  if ! gh api "/repos/candlefish-ai/$repo/contents/.github/workflows" | grep -q claude; then
    ./scripts/setup-claude-review.sh "$repo"
  fi
done
```

## 💰 Cost Management

### Organization Limits
```yaml
# .github/claude-config.yml
organization:
  name: candlefish-ai
  limits:
    monthly_budget: 500.00  # USD
    per_repo_daily: 10.00   # USD
    per_pr_maximum: 5.00    # USD
  
  defaults:
    review_type: quick      # Default to quick reviews
    auto_incremental: true  # Always use incremental for updates
    skip_patterns:
      - "*.lock"
      - "*.generated.*"
      - "dist/*"
      - "build/*"
```

### Cost Allocation
Track costs by team/project:
```python
# Tag reviews with team/project
metadata = {
    'team': os.environ.get('GITHUB_CODEOWNERS', 'unassigned'),
    'project': repo.split('-')[0],  # e.g., 'platform' from 'platform-api'
    'cost_center': 'engineering'
}
```

## 🔧 Advanced Features

### 1. Custom Rules per Repository
```yaml
# .claude-review.yml in each repo
version: 1
rules:
  - pattern: "*.sql"
    review_type: "security"
    required: true
  
  - pattern: "src/api/*"
    review_type: "deep"
    
  - pattern: "*.test.*"
    skip: true
```

### 2. Scheduled Reviews
```yaml
# Weekly architecture review
on:
  schedule:
    - cron: '0 9 * * 1'  # Every Monday at 9 AM
jobs:
  architecture-review:
    uses: candlefish-ai/.github/.github/workflows/claude-review-reusable.yml@main
    with:
      review_type: 'architecture'
      branch: 'main'
```

### 3. Integration with Other Tools
```yaml
# Combine with other checks
jobs:
  claude-review:
    uses: candlefish-ai/.github/.github/workflows/claude-review-reusable.yml@main
  
  sonarqube:
    runs-on: ubuntu-latest
    needs: claude-review
    steps:
      - uses: sonarsource/sonarqube-scan-action@master
```

## 📊 Monitoring & Reporting

### Slack Integration
```python
# Send daily org summary to Slack
def send_org_summary():
    costs = get_org_costs_today()
    
    slack_webhook(
        f"📊 Daily Claude Review Summary\n"
        f"Total Cost: ${costs['total']:.2f}\n"
        f"Reviews: {costs['count']}\n"
        f"Top Repos: {costs['top_repos']}"
    )
```

### GitHub Insights
Create organization-wide insights:
```bash
# Generate monthly report
gh api graphql -f query='
  query($org: String!) {
    organization(login: $org) {
      repositories(first: 100) {
        nodes {
          name
          pullRequests(states: MERGED, first: 100) {
            nodes {
              reviews(first: 10) {
                totalCount
              }
            }
          }
        }
      }
    }
  }
' -f org=candlefish-ai
```

## 🚨 Governance & Compliance

### Required Reviews Policy
```yaml
# GitHub branch protection rule
protection_rules:
  - pattern: "main"
    required_status_checks:
      - "Claude Review / review"
    dismiss_stale_reviews: true
    require_code_owner_reviews: true
```

### Audit Trail
All reviews are logged with:
- Timestamp
- Repository
- PR number
- Review type
- Cost
- Reviewer (bot)
- Outcome

## 🎓 Team Training

### Documentation Hub
Create internal docs site:
```markdown
# docs.candlefish.ai/claude-reviews

1. [Getting Started](./getting-started)
2. [Command Reference](./commands)
3. [Cost Optimization](./cost-optimization)
4. [Troubleshooting](./troubleshooting)
5. [Best Practices](./best-practices)
```

### Onboarding Checklist
- [ ] Read Claude review documentation
- [ ] Test `/claude-review` on a sample PR
- [ ] Review cost dashboard
- [ ] Configure repository rules
- [ ] Join #claude-reviews Slack channel

## 🔄 Migration Path

For existing repositories:

1. **Audit Current State**
   ```bash
   ./scripts/audit-repos.sh > current-state.json
   ```

2. **Gradual Rollout**
   - Week 1: Platform team repos
   - Week 2: Backend services
   - Week 3: Frontend applications
   - Week 4: All remaining repos

3. **Monitor Adoption**
   ```sql
   SELECT repository, COUNT(*) as reviews
   FROM claude_reviews
   WHERE timestamp > NOW() - INTERVAL 7 DAYS
   GROUP BY repository
   ORDER BY reviews DESC;
   ```

## 📈 Success Metrics

Track organization-wide impact:

- **Code Quality**: Bugs caught before production
- **Review Time**: Average time to review
- **Cost Efficiency**: Cost per bug caught
- **Developer Satisfaction**: Survey scores
- **Coverage**: % of PRs with Claude review

## 🛠️ Maintenance

### Regular Tasks
- **Weekly**: Review cost reports
- **Monthly**: Update skip patterns
- **Quarterly**: Evaluate ROI
- **Yearly**: Renegotiate API limits

### Automation
```yaml
# Automated maintenance workflow
on:
  schedule:
    - cron: '0 0 * * 0'  # Weekly
jobs:
  maintenance:
    runs-on: ubuntu-latest
    steps:
      - name: Clean old reviews
        run: |
          aws dynamodb query \
            --table-name candlefish-claude-reviews \
            --index-name timestamp-index \
            --key-condition-expression "timestamp < :cutoff" \
            --expression-attribute-values '{":cutoff":{"S":"'$(date -d '90 days ago' -u +%Y-%m-%d)'"}}' \
            | jq -r '.Items[].org_repo_review.S' \
            | xargs -I {} aws dynamodb delete-item \
              --table-name candlefish-claude-reviews \
              --key '{{"org_repo_review":{{"S":"{}"}}}}'
```

## 🎉 Getting Started Today

1. **Create Template Repository**
   ```bash
   gh repo create candlefish-ai/.github --public
   ```

2. **Copy Workflows**
   ```bash
   cp -r .github/workflows/* ../candlefish-ai/.github/.github/workflows/
   ```

3. **Set Organization Secrets**
   ```bash
   gh secret set AWS_ROLE_ARN --org candlefish-ai
   ```

4. **Enable for First Repository**
   ```bash
   ./scripts/setup-claude-review.sh platform-api
   ```

5. **Monitor Results**
   - Check PR reviews
   - View cost dashboard
   - Gather team feedback

---

## Need Help?

- 📚 Documentation: `docs.candlefish.ai/claude-reviews`
- 💬 Slack: `#claude-reviews`
- 🐛 Issues: `github.com/candlefish-ai/.github/issues`
- 📧 Email: `platform@candlefish.ai`