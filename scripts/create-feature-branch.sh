#!/bin/bash

# Script to create a new feature branch for a new chat context
# Usage: ./scripts/create-feature-branch.sh [optional-description]

# Get current date
date_prefix=$(date +%Y-%m-%d)

# Use provided description or default
if [ $# -eq 0 ]; then
    echo "Please provide a description for your feature branch:"
    read -r description
else
    description="$*"
fi

# Clean up description (replace spaces with hyphens, lowercase)
clean_description=$(echo "$description" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/-/g' | sed 's/--*/-/g' | sed 's/^-\|-$//g')

# Create branch name
branch_name="feature/${date_prefix}-${clean_description}"

# Check if we're on main/master and switch to new branch
current_branch=$(git rev-parse --abbrev-ref HEAD)
if [[ "$current_branch" == "main" || "$current_branch" == "master" ]]; then
    echo "Creating new feature branch: $branch_name"
    git checkout -b "$branch_name"
    echo "✅ Successfully created and switched to feature branch: $branch_name"
else
    echo "⚠️  Currently on branch: $current_branch"
    echo "Would you like to create a new feature branch anyway? (y/N)"
    read -r response
    if [[ "$response" =~ ^[Yy]$ ]]; then
        git checkout -b "$branch_name"
        echo "✅ Successfully created and switched to feature branch: $branch_name"
    else
        echo "Staying on current branch: $current_branch"
    fi
fi
