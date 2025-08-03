# Claude Review System - Quick Reference

## 🚀 Quick Start Commands

### Basic Reviews
```bash
/claude-review                    # Standard comprehensive review
/claude-review quick             # Fast review (< $0.30)
/claude-review deep              # In-depth analysis (> $1.00)
```

### Specialized Reviews
```bash
/claude-review security          # Security vulnerabilities focus
/claude-review performance       # Performance optimization focus
/claude-review architecture      # Design and structure focus
```

### Cost-Saving Options
```bash
/claude-review incremental       # Only review new changes (50-70% savings!)
/claude-review quick incremental # Fast + incremental (maximum savings)
```

### Advanced Filtering
```bash
/claude-review skip:*.test.js    # Skip test files
/claude-review skip:*.lock,dist/* # Skip multiple patterns
```

## 💰 Cost Estimates

| Command | Typical Cost | Use Case |
|---------|-------------|----------|
| `/claude-review quick` | $0.10-0.30 | Small fixes, hotfixes |
| `/claude-review` | $0.30-1.00 | Regular PRs |
| `/claude-review deep` | $1.00-3.00 | Major features |
| `/claude-review incremental` | 50% of full | PR updates |
| `/claude-review quick incremental` | $0.05-0.15 | Quick re-reviews |

## 📊 Cost Monitoring

### View Your PR Costs
Each review shows cost breakdown:
```
💰 Cost Information
- Input tokens: 150,000
- Output tokens: 25,000
- Estimated cost: $2.125
```

### Daily Reports
- Automated daily at 9 AM UTC
- Posted as GitHub issues with label `cost-report`
- Shows trends, totals, and projections

### On-Demand Reports
1. Go to Actions → "Claude Cost Report"
2. Run workflow manually
3. View visual charts and breakdowns

## 🎯 Best Practices

### For Maximum Value
1. **New Features**: `/claude-review` (standard)
2. **Updates to PR**: `/claude-review incremental`
3. **Quick Fixes**: `/claude-review quick`
4. **Security Changes**: `/claude-review security`
5. **Major Refactoring**: `/claude-review deep architecture`

### For Cost Savings
- ✅ Use `incremental` for all PR updates
- ✅ Use `quick` for simple changes
- ✅ Skip generated files: `skip:*.generated.ts`
- ✅ Batch small PRs together
- ❌ Avoid `deep` unless necessary
- ❌ Don't re-review without changes

## 🔧 Workflow Triggers

### Automatic
- ✅ New PRs (non-draft)
- ✅ PR marked ready for review
- ✅ Your `/claude-review` comments

### Manual
- GitHub Actions → Claude workflows
- PR comments with commands
- Batch review for multiple PRs

## 📈 Example Workflows

### Feature Development
```bash
# Initial review
/claude-review

# After addressing feedback
/claude-review incremental

# Final security check
/claude-review security incremental
```

### Hotfix
```bash
# Quick sanity check
/claude-review quick security
```

### Large Refactoring
```bash
# Architecture review
/claude-review architecture deep

# After changes
/claude-review incremental
```

## 🆘 Troubleshooting

**Review not starting?**
- Check PR isn't in draft mode
- Ensure exact command format
- Verify you have write access

**High costs?**
- Switch to `incremental` reviews
- Use `quick` for small changes
- Check monthly budget in reports

**Need help?**
- Full guide: `.github/CLAUDE_REVIEW_GUIDE.md`
- Check workflow logs in Actions tab
- Ask in #engineering channel

---

💡 **Pro Tip**: Always use `incremental` for PR updates to save 50-70% on costs!