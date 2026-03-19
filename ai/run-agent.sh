#!/bin/bash
set -e

TASK="$1"
BRANCH="agent/$(date +%s)"
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
