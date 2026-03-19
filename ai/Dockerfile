FROM node:24-bookworm-slim

RUN apt-get update && apt-get install -y --no-install-recommends curl \
    git \
    ca-certificates

RUN npm install -g pnpm@10.30.3

RUN npm install -g @anthropic-ai/claude-code

WORKDIR /workspace

# Claude refuses to run --dangerously-skip-permissions on root
# So I have to let it know I am sandboxing
ENV IS_SANDBOX=1

ENTRYPOINT ["claude", "--dangerously-skip-permissions", "--print"]
