# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is **fvtt-module-avclient-livekit**, a FoundryVTT module that replaces the default SimplePeer/EasyRTC audio/video client with LiveKit's SFU (Selective Forwarding Unit) architecture. The module provides enhanced WebRTC capabilities, breakout room functionality, and better bandwidth efficiency for virtual tabletop gaming sessions.

## Development References

### Documentation Links
- FoundryVTT Client API docs https://foundryvtt.com/api/

## Development Commands

### Essential Build Commands
```bash
# Development build with file watching
yarn watch

# Production build
yarn build

# Development build (one-time)
yarn build:dev

# Install dependencies
yarn install
```

### Testing & Quality
- **No automated tests configured** - testing requires FoundryVTT development environment
- **Linting**: Uses ESLint with TypeScript rules (configured in package.json)
- **Manual Testing**: Requires FoundryVTT installation with module loaded

### Release Process
- **Automated via GitHub Actions** - triggers on version changes in `module.json`
- **Manual Release**: Update version in `module.json`, push to main branch
- **Build Artifacts**: Creates ZIP package for FoundryVTT installation

## Core Architecture

### Module Structure
- **Entry Point**: `src/avclient-livekit.ts` - Overrides `CONFIG.WebRTC.clientClass`
- **Main Client**: `LiveKitAVClient.ts` - Core WebRTC implementation extending FoundryVTT's `AVClient`
- **LiveKit Integration**: `LiveKitClient.ts` - Wrapper around LiveKit SDK with connection management
- **Configuration**: `LiveKitAVConfig.ts` - Settings UI and module configuration
- **Breakout Rooms**: `LiveKitBreakout.ts` - Advanced room splitting functionality

### Key Integration Points
- **WebRTC Override**: Replaces FoundryVTT's native WebRTC client entirely
- **Hook System**: Extensive use of FoundryVTT hooks for lifecycle management
- **Socket Messages**: Custom socket communication for breakout room coordination
- **Settings Registration**: Module settings integrated with FoundryVTT's settings system

### Build System
- **Webpack Configuration**: Custom setup with browser polyfills for Node.js modules
- **Multi-Entry Points**: Separate bundles for main module and web client
- **Asset Pipeline**: Copies CSS, templates, language files, and documentation
- **TypeScript**: ES2020 target with strict mode and FoundryVTT type definitions

## LiveKit Integration Architecture

### Connection Management
- **Server Selection**: Multiple provider support (At the Tavern, Forge, LiveKit Cloud, custom)
- **Authentication**: JWT token-based authentication with API key/secret
- **Connection States**: Comprehensive state tracking with UI indicators
- **Reconnection Logic**: Automatic reconnection with exponential backoff

### Audio/Video Features
- **Adaptive Streaming**: Dynamic quality adjustment based on window size and system resources
- **Individual Controls**: Per-user mute/hide capabilities beyond FoundryVTT defaults
- **External Web Client**: Separate browser support for dedicated A/V experience
- **Audio Music Mode**: Optimized settings for music streaming scenarios

## Key Technical Considerations

### Browser Compatibility
- **HTTPS Required**: WebRTC functionality requires SSL/TLS
- **WebRTC Support**: Modern browser requirement for full functionality
- **Polyfills**: Extensive Node.js polyfills for browser compatibility (crypto, buffer, stream, util)

### FoundryVTT Integration
- **Version Compatibility**: Supports FoundryVTT v9.238+ through v12
- **Module Dependencies**: No hard dependencies, but integrates with core WebRTC system
- **Permission Model**: Uses FoundryVTT's built-in user permission system

### Performance Optimization
- **SFU Architecture**: Each user sends A/V once instead of mesh networking to every participant
- **Bandwidth Management**: Dynamic quality adjustment and bitrate control
- **Resource Monitoring**: System resource awareness for quality scaling

## Development Patterns

### Error Handling
- **Comprehensive Logging**: Multi-level logging system with debug modes
- **Connection Fallback**: Graceful degradation when LiveKit unavailable
- **User Feedback**: Clear error messages and connection status indicators

### State Management
- **Client State**: Tracks connection, audio/video states, and user interactions
- **Room State**: Manages breakout room assignments and transitions
- **Settings State**: Persistent configuration with validation

### UI Integration
- **FoundryVTT Theming**: Follows FoundryVTT's CSS patterns and theming
- **Context Menus**: Custom context menu integration for user controls
- **Configuration Forms**: Complex settings UI with validation and help text

## Important Files

### Configuration Files
- **`module.json`**: FoundryVTT module manifest - version changes trigger releases
- **`webpack.config.js`**: Build configuration with browser polyfills
- **`tsconfig.json`**: TypeScript configuration with strict mode

### Source Files
- **`utils/constants.ts`**: Module constants and configuration defaults
- **`utils/registerModuleSettings.ts`**: All module settings definitions
- **`utils/helpers.ts`**: Utility functions for LiveKit integration
- **`utils/hooks.ts`**: FoundryVTT hook handlers and lifecycle management

### Asset Files
- **`lang/`**: Internationalization files (English/Spanish)
- **`templates/`**: Handlebars templates for configuration UI
- **`css/`**: Module-specific stylesheets
- **`web-client/`**: External web client HTML/CSS/JS

## LiveKit Server Configuration

### Supported Providers
- **At the Tavern**: Patreon-supported multi-region cluster with WebSocket URLs
- **Forge**: Built-in integration for Forge VTT hosting
- **LiveKit Cloud**: Official cloud service with API key authentication
- **Custom**: Self-hosted LiveKit instances with full configuration options

### Authentication Flow
1. API key/secret configuration in module settings
2. JWT token generation for room access
3. LiveKit room connection with participant identity
4. Continuous token refresh for long sessions

### Room Management
- **Standard Rooms**: One room per FoundryVTT world/scene
- **Breakout Rooms**: Dynamic room creation for party splitting
- **External Access**: Web client support for players joining from separate devices