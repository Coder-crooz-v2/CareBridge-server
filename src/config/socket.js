/**
 * Socket.IO Configuration
 */

export const socketConfig = {
  cors: {
    origin: ["http://localhost:3000", "https://care-bridge-lake.vercel.app"],
    methods: ["GET", "POST"],
    credentials: true,
  },
};
