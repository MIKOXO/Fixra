const joinTicketRoom = (socket, ticketId) => {
  socket.join(`ticket:${ticketId}`);
};

const leaveTicketRoom = (socket, ticketId) => {
  socket.leave(`ticket:${ticketId}`);
};

const emitTicketUpdate = (io, ticketId, payload) => {
  io.to(`ticket:${ticketId}`).emit('ticket:updated', payload);
};

export { emitTicketUpdate, joinTicketRoom, leaveTicketRoom };
