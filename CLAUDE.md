# Claude Code Instructions

## Playwright CLI

When taking screenshots with `playwright-cli`, always write them to `/tmp/` to avoid cluttering the project directory:

```
playwright-cli screenshot --filename=/tmp/screenshot.png
```
