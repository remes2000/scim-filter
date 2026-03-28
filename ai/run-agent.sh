#!/bin/bash
set -e

echo "Enter prompt (press Ctrl+D when done):"
TASK=$(cat)
read -r -p "Enter branch name (will be prefixed with 'agent/'): " BRANCH_NAME
BRANCH="agent/$BRANCH_NAME"
WORKTREE="./$BRANCH"

# create a new branch + worktree
git worktree add -b "$BRANCH" "$WORKTREE"

# run the agent against the worktree
docker run --rm \
  --env-file .env \
  -v "$WORKTREE":/workspace \
  scim-filter-dev \
  "$TASK"

echo ""
echo "Done. Inspect the result:"
echo "  cd $WORKTREE"
echo "  git diff main"
echo ""
echo "To merge:  git merge $BRANCH"
echo "To discard: git worktree remove $WORKTREE && git branch -d $BRANCH"
