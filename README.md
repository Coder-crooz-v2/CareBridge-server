# Carebridge-server

Real-time health monitoring data server using Socket.IO for the CareBridge application.

## Installation

```bash
npm install
```

## Project Structure

```
health-monitoring-server/
├── src/
│   ├── server.js                    # Main entry point
│   ├── app.js                       # Express application setup
│   ├── socket.js                    # Socket.IO initialization
│   ├── config/                      # Configuration files
│   │   ├── cors.js                 # CORS configuration
│   │   ├── database.js             # Supabase client configuration
│   │   └── socket.js               # Socket.IO configuration
│   ├── controllers/                 # Request handlers
│   │   ├── healthController.js     # Health check endpoints
│   │   ├── healthDataController.js # Health data API endpoints
│   │   └── socketController.js     # WebSocket event handlers
│   ├── models/                      # Database models
│   │   ├── healthDataModel.js      # Health data CRUD operations
│   │   └── userModel.js            # User data access
│   ├── routes/                      # Route definitions
│   │   ├── healthRoutes.js         # Health check routes
│   │   └── healthDataRoutes.js     # Health data API routes
│   ├── services/                    # Business logic
│   │   ├── vitalSignsService.js    # Vital signs generation
│   │   ├── healthDataGeneratorService.js  # Background data generator
│   │   └── dataCleanupService.js   # Hourly data cleanup
│   └── utils/                       # Utility functions
│       └── prng.js                 # Seeded random number generator
├── package.json
├── .env.example                     # Example environment variables
└── README.md
```

## Running the Server

### Development (with auto-reload)

```bash
npm run dev
```

### Production

```bash
npm start
```

The server will run on **port 3001** by default.

## Endpoints

### WebSocket

- **WebSocket**: `ws://localhost:3001`

### HTTP Endpoints

- **Health Check**: `GET /health` - Server health status
- **Root**: `GET /` - Welcome message
- **Health Data Stats**: `GET /api/health-data/stats` - Generator & cleanup statistics
- **Recent Data**: `GET /api/health-data/recent/:userId` - Get recent data for a user
- **Manual Cleanup**: `POST /api/health-data/cleanup` - Trigger manual data cleanup
