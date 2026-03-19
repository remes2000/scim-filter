# AI Agent

Runs Claude Code in a Docker container against an isolated git worktree.

## Setup

1. Create a `.env` file in the project root with your Anthropic API key:
   ```
   ANTHROPIC_API_KEY=sk-ant-...
   ```

2. Build the Docker image:
   ```bash
   ./ai/build-image.sh
   ```

## Usage

```bash
./ai/run-agent.sh "your task description"
```

The script creates a new git branch + worktree, runs the agent, then prints instructions to review, merge, or discard the result.
