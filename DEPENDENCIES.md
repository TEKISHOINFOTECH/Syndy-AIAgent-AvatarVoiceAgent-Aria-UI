# Avatar UI Next - Dependencies

This document lists all the dependencies used in the avatar-ui-next project.

## Production Dependencies

### Core Framework
- **next** (^16.0.0): React framework for production-grade applications
- **react** (^19.2.0): JavaScript library for building user interfaces
- **react-dom** (^19.2.0): React package for working with the DOM

### LiveKit Integration
- **livekit-client** (^2.15.13): LiveKit client SDK for WebRTC communication
- **livekit-server-sdk** (^2.14.0): LiveKit server SDK for token generation

## Development Dependencies

### TypeScript
- **typescript** (^5): TypeScript language support
- **@types/node** (^20): TypeScript definitions for Node.js
- **@types/react** (^19): TypeScript definitions for React
- **@types/react-dom** (^19): TypeScript definitions for React DOM

### Styling
- **tailwindcss** (^4): Utility-first CSS framework
- **@tailwindcss/postcss** (^4): PostCSS plugin for Tailwind CSS

### Code Quality
- **eslint** (^9): JavaScript linter
- **eslint-config-next** (^16.0.0): ESLint configuration for Next.js

## Installation

To install all dependencies:

```bash
npm install
```

To install a specific dependency:

```bash
npm install <package-name>
```

To install a development dependency:

```bash
npm install --save-dev <package-name>
```

## Update Dependencies

To check for outdated packages:

```bash
npm outdated
```

To update all dependencies:

```bash
npm update
```

To update a specific package:

```bash
npm update <package-name>
```

## Lock File

The project uses `package-lock.json` to ensure consistent installations across different environments. Always commit this file to version control.

## Node Version

Recommended Node.js version: **18.x or higher**

Check your Node version:
```bash
node --version
```

## NPM Version

The project is compatible with npm 9.x or higher.

Check your npm version:
```bash
npm --version
```
