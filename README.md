# Health Monitoring Socket.IO Server

Real-time health monitoring data server using Socket.IO for the CareBridge application.

## Features

### Real-Time WebSocket Streams

- ✅ **Per-User Independent Streams**: Each client receives unique, deterministic vital signs data
- ✅ **Seeded Random Number Generation**: Uses mulberry32 PRNG for consistent per-user patterns
- ✅ **Random Walk Algorithm**: Realistic gradual changes within healthy ranges
- ✅ **Session Persistence**: Same userId on reconnect resumes similar data patterns
- ✅ Sends vital signs data every 10 seconds
- ✅ Realistic health metrics (Heart Rate, SpO2, Blood Pressure, Temperature)
- ✅ WebSocket connection with Socket.IO
- ✅ CORS enabled for Vercel and localhost
- ✅ Connection tracking and logging
- ✅ Proper resource cleanup on disconnect

### Database-Backed Health Data Generation (24/7)

- ✅ **Continuous Background Generation**: Generates health data every 10 seconds for ALL registered users
- ✅ **Supabase Integration**: Stores health records in `public.health_data` table
- ✅ **Automatic Cleanup**: Hourly cleanup removes data older than 1 hour
- ✅ **Runs Independently**: Works even when users are offline
- ✅ **MVC Architecture**: Clean separation of concerns

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

See [src/README.md](./src/README.md) for detailed architecture documentation.

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

## Environment Variables

Create a `.env` file (see `.env.example`):

```bash
PORT=3001

# Required for database features
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

> ⚠️ **Important**: You must use the **Service Role Key** (not the anon key) to access `auth.users` table.

## Endpoints

### WebSocket

- **WebSocket**: `ws://localhost:3001`

### HTTP Endpoints

- **Health Check**: `GET /health` - Server health status
- **Root**: `GET /` - Welcome message
- **Health Data Stats**: `GET /api/health-data/stats` - Generator & cleanup statistics
- **Recent Data**: `GET /api/health-data/recent/:userId` - Get recent data for a user
- **Manual Cleanup**: `POST /api/health-data/cleanup` - Trigger manual data cleanup

## Data Format

### WebSocket Events

The server emits `vital-signs` events every 10 seconds with the following structure:

```json
{
  "timestamp": "2025-11-22T15:30:00.000Z",
  "heartRate": 75,
  "spo2": 97.5,
  "systolic": 120,
  "diastolic": 80,
  "temperature": 98.6
}
```

### Per-User Independence

Each connected client receives **independent, deterministic** data:

- **Unique Base Values**: Each userId gets different initial vitals (seeded from userId hash)
- **Independent Evolution**: Values change independently via random walk algorithm
- **Deterministic**: Same userId = similar patterns on reconnection
- **Bounded Ranges**: All values stay within healthy limits

**Example**: Two simultaneous clients:

```javascript
// Client A (userId: user-123)
{ heartRate: 72, spo2: 97.2, systolic: 118, diastolic: 78, temperature: 98.4 }

// Client B (userId: user-456)
{ heartRate: 78, spo2: 98.5, systolic: 122, diastolic: 81, temperature: 99.1 }
```

See [PER_USER_STREAMS_TESTING.md](./PER_USER_STREAMS_TESTING.md) for detailed testing guide.

## Database Schema

The server uses the following Supabase table for persistent health data:

```sql
create table public.health_data (
  id uuid not null default gen_random_uuid (),
  user_id uuid not null,
  heart_rate integer null,
  spo2 real null,
  blood_pressure_systolic integer null,
  blood_pressure_diastolic integer null,
  temperature real null,
  created_at timestamp with time zone not null default (now() AT TIME ZONE 'utc'::text),
  shared_to uuid null,
  constraint health_data_pkey primary key (id),
  constraint health_data_shared_to_fkey foreign KEY (shared_to) references auth.users (id),
  constraint health_data_user_id_fkey foreign KEY (user_id) references auth.users (id)
) TABLESPACE pg_default;
```

### Background Services

1. **Health Data Generator**: Runs every 10 seconds, generates health data for ALL registered users
2. **Data Cleanup**: Runs every hour, removes data older than 1 hour

## Deploying to Production

### Option 1: Render.com (Recommended - Free Tier Available)

1. Create account at [Render.com](https://render.com)
2. New Web Service → Connect GitHub repo
3. Build Command: `npm install`
4. Start Command: `npm start`
5. Set environment variables if needed
6. Deploy

### Option 2: Railway.app

1. Create account at [Railway.app](https://railway.app)
2. New Project → Deploy from GitHub
3. Select this directory
4. Deploy automatically

### Option 3: Fly.io

```bash
fly launch
fly deploy
```

## Client Configuration

Update your Next.js app environment variables:

```bash
# Local development
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001

# Production (replace with your deployed URL)
NEXT_PUBLIC_SOCKET_URL=https://your-socket-server.onrender.com
```

## Monitoring

- Check connected clients: `http://localhost:3001/health`
- Server logs show connection/disconnection events
- Each data emission is logged with current values

## Troubleshooting

### Port already in use

```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3001 | xargs kill -9
```

### Connection refused

- Ensure server is running
- Check firewall settings
- Verify CORS configuration matches your client URL
