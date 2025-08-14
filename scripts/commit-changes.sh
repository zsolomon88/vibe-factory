#!/bin/bash

# Script to commit changes at the end of a chat iteration
# Usage: ./scripts/commit-changes.sh [optional-commit-message]

# Check if we're on a protected branch
current_branch=$(git rev-parse --abbrev-ref HEAD)
if [[ "$current_branch" == "main" || "$current_branch" == "master" ]]; then
    echo "❌ ERROR: Cannot commit directly to '$current_branch' branch!"
    echo "Please create a feature branch first:"
    echo "  ./scripts/create-feature-branch.sh 'your-feature-description'"
    exit 1
fi

# Check if there are any changes to commit
if git diff --quiet && git diff --cached --quiet; then
    echo "No changes to commit."
    exit 0
fi

# Show current status
echo "Current branch: $current_branch"
echo "Changes to be committed:"
git status --short

# Get commit message
if [ $# -eq 0 ]; then
    echo ""
    echo "Please enter a commit message (use conventional commit format):"
    echo "Examples:"
    echo "  feat(ui): add new button component"
    echo "  fix(api): resolve authentication issue"
    echo "  docs(readme): update installation instructions"
    echo ""
    read -r commit_message
else
    commit_message="$*"
fi

# Validate commit message format (basic check)
if [[ ! "$commit_message" =~ ^(feat|fix|docs|style|refactor|test|chore)(\(.+\))?: ]]; then
    echo "⚠️  Warning: Commit message doesn't follow conventional commit format"
    echo "Expected format: type(scope): description"
    echo "Continue anyway? (y/N)"
    read -r response
    if [[ ! "$response" =~ ^[Yy]$ ]]; then
        echo "Commit cancelled."
        exit 1
    fi
fi

# Stage all changes and commit
git add .
git commit -m "$commit_message"

if [ $? -eq 0 ]; then
    echo "✅ Successfully committed changes to branch: $current_branch"
    echo "💡 When ready, create a pull request to merge into main/master"
else
    echo "❌ Commit failed"
    exit 1
fi
