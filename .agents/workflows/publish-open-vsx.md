---
description: How to publish the VS Code extension to Open VSX
---

# Publishing the AIReady VS Code Extension to Open VSX

This workflow describes how to publish the `aiready` VS Code extension to the Open VSX registry. The build script automatically handles this process if the correct access token is available in your environment.

## Prerequisites

1. You must have an Open VSX account linked to your GitHub.
2. Ensure you have created a namespace matching your publisher name on Open VSX (`pengcao`).
// turbo
```bash
cd packages/vscode-extension && npx ovsx create-namespace pengcao
```

## Steps

### Method 1: Automated Pipeline (GitHub Actions)
The most recommended way to publish is via the standard GitHub Actions pipeline.

1. Navigate to the `.github/workflows/publish-vscode.yml` file. It already contains the logic to publish to both the VS Code Marketplace and Open VSX.
2. Go to the GitHub repository settings (Secrets and variables > Actions).
3. Ensure the `OVSX_PAT` secret is set with your Open VSX Personal Access Token.
4. When a new release tag (`vscode-v*`) is pushed or the workflow is manually dispatched, it will automatically package and push the extension to Open VSX.

### Method 2: Manual Local Publish
If you need to manually publish from your local machine:

1. Obtain your Open VSX Personal Access Token from your account settings.
2. Edit the `.env` file located at `packages/vscode-extension/.env`:
```bash
# packages/vscode-extension/.env
VSCE_PAT="..."
OVSX_PAT="your_open_vsx_token_here"
```

3. From the project root directory, run the generic publish command:
// turbo
```bash
make publish-vscode
```

By having the `OVSX_PAT` loaded in the environment, the `make publish-vscode` step will automatically detect it and run `npx ovsx publish --no-dependencies` after publishing to the main VS Code marketplace.
