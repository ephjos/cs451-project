# Setup for Development

## Requirements

- [Node.js](https://nodejs.org/en/) (v12)
- [Git](https://git-scm.com/downloads) (Install Git Bash as well)
- [Typescript](https://www.typescriptlang.org/) (v3.5.3)
- [Visual Studio Code](https://code.visualstudio.com/) (to ensure use of typescript-eslint)
- The following VS Code Extensions:
  - ESLint (required)
  - GitLens
  - Test Explorer UI
  - vscode-icons
  - Code Runner

## Installation

### Node/npm

I recommend using [nvm](https://github.com/nvm-sh/nvm) to install node. This allows you to switch between Node versions on the fly. On Windows? use [nvm-windows](https://github.com/coreybutler/nvm-windows).


### Typescript

Easiest way to get `tsc` on the command line is 
```
npm i -g typescript
```

### Project

It is recommended that you use `npm ci` over `npm install` to prevent package-lock hell. For now there are no special instructions.

### Run

#### Dev

`cd server && npm run dev-server`

#### Production

`cd server && npm start`

`cd client && npm run start`
