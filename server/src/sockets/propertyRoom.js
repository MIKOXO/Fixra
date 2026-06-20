const joinPropertyRoom = (socket, propertyId) => {
  socket.join(`property:${propertyId}`);
};

const leavePropertyRoom = (socket, propertyId) => {
  socket.leave(`property:${propertyId}`);
};

const emitPropertyUpdate = (io, propertyId, payload) => {
  io.to(`property:${propertyId}`).emit('property:updated', payload);
};

export { emitPropertyUpdate, joinPropertyRoom, leavePropertyRoom };
