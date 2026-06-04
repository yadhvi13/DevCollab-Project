import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import cors from 'cors';
import authRoutes from './routes/auth';
import repoRoutes from './routes/repo';
import aiRoutes from './routes/ai';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // Allow all origins for development
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/repos', repoRoutes);
app.use('/api/ai', aiRoutes);

// Socket.io for Real-time Collaboration
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on('join-repo', (repoId: string) => {
    socket.join(repoId);
    console.log(`Socket ${socket.id} joined repo ${repoId}`);
  });

  socket.on('leave-repo', (repoId: string) => {
    socket.leave(repoId);
    console.log(`Socket ${socket.id} left repo ${repoId}`);
  });

  socket.on('chat-message', (data: { repoId: string, message: string, user: any }) => {
    io.to(data.repoId).emit('chat-message', data);
  });

  socket.on('typing', (data: { repoId: string, username: string }) => {
    socket.to(data.repoId).emit('typing', data);
  });

  socket.on('kanban-update', (data: { repoId: string, kanban: any[] }) => {
    socket.to(data.repoId).emit('kanban-update', data);
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/devcollab';

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB', err);
  });
