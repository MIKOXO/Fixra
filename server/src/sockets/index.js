import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import Ticket from '../models/Ticket.js';
import Property from '../models/Property.js';
import { joinTicketRoom, leaveTicketRoom } from './ticketRoom.js';
import { joinPropertyRoom, leavePropertyRoom } from './propertyRoom.js';

const parseCookies = (cookieHeader) => {
  if (!cookieHeader) return {};
  return Object.fromEntries(
    cookieHeader.split(';').map((c) => {
      const [name, ...rest] = c.trim().split('=');
      return [name.trim(), rest.join('=')];
    })
  );
};

const canAccessTicket = async (userId, role, ticketId) => {
  if (role === 'SUPER_ADMIN') return true;

  const ticket = await Ticket.findById(ticketId).select('tenantId landlordId contractorId technicianId');
  if (!ticket) return false;

  switch (role) {
    case 'TENANT':
      return ticket.tenantId?.toString() === userId;
    case 'LANDLORD':
      return ticket.landlordId?.toString() === userId;
    case 'CONTRACTOR':
      return ticket.contractorId?.toString() === userId;
    case 'TECHNICIAN':
      return ticket.technicianId?.toString() === userId;
    default:
      return false;
  }
};

const canAccessProperty = async (userId, role, propertyId) => {
  if (role === 'SUPER_ADMIN') return true;

  const property = await Property.findById(propertyId).select('landlordId');
  if (!property) return false;

  if (role === 'LANDLORD') {
    return property.landlordId?.toString() === userId;
  }

  return true;
};

let io;

const initSocket = (server) => {
  const corsOptions = (() => {
    const raw = process.env.CLIENT_URL;
    if (!raw) return { origin: 'http://localhost:5173', credentials: true };
    const origins = raw.split(',').map((s) => s.trim()).filter(Boolean);
    return { origin: origins, credentials: true };
  })();

  io = new Server(server, { cors: corsOptions });

  io.use((socket, next) => {
    const token =
      socket.handshake.auth?.token || parseCookies(socket.handshake.headers.cookie)?.accessToken;

    if (!token) {
      return next(new Error('Authentication required'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = { id: decoded.sub, role: decoded.role, email: decoded.email };
      return next();
    } catch {
      return next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id} (${socket.user.role})`);

    socket.join(`user:${socket.user.id}`);

    socket.on('join:ticket', async ({ ticketId }, callback) => {
      if (!ticketId) {
        if (callback) callback({ error: 'Ticket ID is required' });
        return;
      }

      const allowed = await canAccessTicket(socket.user.id, socket.user.role, ticketId);
      if (!allowed) {
        if (callback) callback({ error: 'Access denied' });
        return;
      }

      joinTicketRoom(socket, ticketId);

      if (callback) callback({ success: true });
    });

    socket.on('leave:ticket', ({ ticketId }, callback) => {
      if (!ticketId) {
        if (callback) callback({ error: 'Ticket ID is required' });
        return;
      }

      leaveTicketRoom(socket, ticketId);

      if (callback) callback({ success: true });
    });

    socket.on('join:property', async ({ propertyId }, callback) => {
      if (!propertyId) {
        if (callback) callback({ error: 'Property ID is required' });
        return;
      }

      const allowed = await canAccessProperty(socket.user.id, socket.user.role, propertyId);
      if (!allowed) {
        if (callback) callback({ error: 'Access denied' });
        return;
      }

      joinPropertyRoom(socket, propertyId);

      if (callback) callback({ success: true });
    });

    socket.on('leave:property', ({ propertyId }, callback) => {
      if (!propertyId) {
        if (callback) callback({ error: 'Property ID is required' });
        return;
      }

      leavePropertyRoom(socket, propertyId);

      if (callback) callback({ success: true });
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
};

export { io, initSocket };
