# Git Workflow Automation Setup

This project has been configured with automated Git workflow rules to ensure proper branch management and commit practices.

## 🚀 Quick Start

### Starting a New Feature
```bash
# Create a new feature branch for your work
./scripts/create-feature-branch.sh "description of your feature"
```

### Committing Changes
```bash
# Commit your changes with a proper message
./scripts/commit-changes.sh "feat(component): add new feature"
```

## 📋 Workflow Rules

### 1. Branch Creation
- **Always create a new feature branch** when starting work
- Branch naming format: `feature/YYYY-MM-DD-description`
- Use the provided script: `./scripts/create-feature-branch.sh`

### 2. Commit Management
- **Commit changes regularly** at the end of each development iteration
- Use conventional commit format: `type(scope): description`
- Commit types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`
- Use the provided script: `./scripts/commit-changes.sh`

### 3. Branch Protection
- **Direct commits to `main`/`master` are blocked** by Git hooks
- **Direct pushes to `main`/`master` are blocked** by Git hooks
- All work must go through feature branches and pull requests

## 🛡️ Protection Mechanisms

### Git Hooks
- **Pre-commit hook**: Prevents commits directly to main/master
- **Pre-push hook**: Prevents pushes directly to main/master

### Cursor Rules
- `.cursorrules` file provides instructions to AI assistants
- Ensures consistent workflow across development sessions

## 🔧 Manual Commands

If you prefer manual Git operations:

```bash
# Create feature branch manually
git checkout -b feature/$(date +%Y-%m-%d)-your-description

# Commit changes manually
git add .
git commit -m "feat(scope): your description"

# Push feature branch
git push origin feature/your-branch-name
```

## 🔄 Creating Pull Requests

When your feature is complete:
1. Push your feature branch to the remote repository
2. Create a pull request to merge into `main`/`master`
3. Request code review from team members
4. Merge after approval

## ⚠️ Important Notes

- The Git hooks are local to your repository
- Share this setup with team members by having them run the same setup
- The `.cursorrules` file helps AI assistants follow the workflow
- Always work on feature branches, never directly on main/master

## 🐛 Troubleshooting

### "Direct commits to main/master not allowed" error
This is expected behavior! Create a feature branch:
```bash
./scripts/create-feature-branch.sh "your feature name"
```

### Need to override protection temporarily
```bash
# Temporarily disable hooks (not recommended)
git commit --no-verify -m "emergency fix"
```

## 📁 File Structure

```
.cursorrules                    # Cursor AI assistant rules
.git/hooks/pre-commit          # Prevents commits to main/master
.git/hooks/pre-push            # Prevents pushes to main/master
scripts/create-feature-branch.sh  # Helper script for branch creation
scripts/commit-changes.sh      # Helper script for committing
README-GIT-WORKFLOW.md         # This documentation
```
