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
import userRoutes from './routes/users';
import postRoutes from './routes/posts';
import GlobalMessage from './models/GlobalMessage';

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
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);

// Socket.io for Real-time Collaboration
const onlineUsers = new Map<string, string>(); // socketId -> userId

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on('user-connected', (userId: string) => {
    onlineUsers.set(socket.id, userId);
    io.emit('online-users', Array.from(new Set(onlineUsers.values())));
  });

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

  // Global Chat logic
  socket.on('join-room', async (roomId: string) => {
    socket.join(`global-${roomId}`);
    console.log(`Socket ${socket.id} joined global room ${roomId}`);
    
    // Fetch and send message history for the room
    try {
      const history = await GlobalMessage.find({ room: roomId })
        .sort({ createdAt: 1 })
        .limit(100);
      
      const formattedHistory = history.map(msg => ({
        id: msg._id,
        room: msg.room,
        message: msg.message,
        user: msg.user,
        replyTo: msg.replyTo,
        timestamp: msg.createdAt
      }));
      
      socket.emit('chat-history', formattedHistory);
    } catch (err) {
      console.error('Error fetching chat history:', err);
    }
  });

  socket.on('leave-room', (roomId: string) => {
    socket.leave(`global-${roomId}`);
    console.log(`Socket ${socket.id} left global room ${roomId}`);
  });

  socket.on('global-chat-message', async (data: { room: string, message: string, user: any, replyTo?: any }) => {
    try {
      // Save message to MongoDB
      const newMessage = new GlobalMessage({
        room: data.room,
        message: data.message,
        user: {
          _id: data.user._id || data.user.id,
          username: data.user.username,
          avatar: data.user.avatar
        },
        replyTo: data.replyTo ? {
          id: data.replyTo.id,
          username: data.replyTo.username,
          message: data.replyTo.message
        } : null
      });
      
      const savedMessage = await newMessage.save();
      
      const messageData = {
        id: savedMessage._id,
        room: savedMessage.room,
        message: savedMessage.message,
        user: savedMessage.user,
        replyTo: savedMessage.replyTo,
        timestamp: savedMessage.createdAt
      };
      
      io.to(`global-${data.room}`).emit('global-chat-message', messageData);
    } catch (err) {
      console.error('Error saving global chat message:', err);
    }
  });

  socket.on('delete-global-message', async (data: { room: string, messageId: string }) => {
    try {
      await GlobalMessage.deleteOne({ _id: data.messageId });
      io.to(`global-${data.room}`).emit('delete-global-message', data.messageId);
    } catch (err) {
      console.error('Error deleting global message:', err);
    }
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    onlineUsers.delete(socket.id);
    io.emit('online-users', Array.from(new Set(onlineUsers.values())));
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
