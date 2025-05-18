# Real-Time Clock with WorldTime API using Phaser.js

A lightweight front-end application built with Phaser.js and TypeScript that displays the current Service Uptime from an API.

## Features

- Fetches uptime data every 60 seconds from the RNG API
- Displays days in top-left corner
- Displays hours:minutes:seconds (HH:MM:SS) in bottom-right corner
- Smooth transitions when updating the display
- Fully responsive design that adapts to different screen sizes
- Robust error handling with fallback mechanisms

## Architecture

The application follows an event-driven architecture with clearly separated components:

### Core Components

1. **Game Configuration (GameConfig.ts)**
   - Central configuration for game settings and API endpoints
   - Makes it easy to modify key parameters without changing code

2. **Event System (EventEmitter.ts)**
   - Centralized event bus for communication between components
   - Ensures loose coupling between services and UI elements

3. **Service Layer (UptimeService.ts)**
   - Singleton service responsible for API communication
   - Handles data fetching, formatting, and error recovery
   - Implements multiple fallback strategies for reliability

4. **Scene Management**
   - **Loading Scene**: Handles asset loading and initial setup
   - **Clock Scene**: Main display with responsive UI elements

### Data Flow

1. UptimeService fetches data from the API every 60 seconds
2. Data is formatted into days, hours, minutes, and seconds
3. Events are emitted when data is updated or errors occur
4. Clock scene listens for these events and updates the UI accordingly

### Error Handling Strategy

The application implements a multi-layered approach to error handling:

1. **Connection Error Recovery**
   - Graceful error reporting with meaningful messages
   - Fallback to last known good data if available

2. **Data Fallback Mechanism**
   - If no previous data is available, generates mock data based on current time
   - Ensures continuous operation even during extended API outages

## Setup Instructions

1. Install dependencies:
   ```
   npm install
   ```

2. Start the development server:
   ```
   npm start
   ```

3. Open a browser and navigate to `http://localhost:3000`

## Building for Production

```
npm run build
```

The compiled output will be in the `dist/` directory.

## Technical Choices

- **TypeScript**: For type safety and better maintainability
- **Phaser.js**: Lightweight framework with good performance for 2D rendering
- **Event-Driven Architecture**: For loose coupling between components
- **Singleton Pattern**: For services that need application-wide access
- **Responsive Design**: Adapts to different screen sizes with proper scaling 