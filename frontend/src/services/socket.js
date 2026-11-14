import { io } from 'socket.io-client';

let socket = null;

export const connectSocket = (token) => {
  if (socket) return socket;
  socket = io('/', {
    auth: { token },
    transports: ['websocket'],
    reconnection: true,
  });
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = () => socket;
