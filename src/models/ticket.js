import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const ticketSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  event: {
    type: Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  eventId: {
    type: Number,
    required: true
  },
  purchaseDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['VALID', 'USED', 'CANCELLED'],
    default: 'VALID'
  }
});

// Índice para búsquedas rápidas
ticketSchema.index({ eventId: 1, purchaseDate: -1 });

const Ticket = mongoose.model('Ticket', ticketSchema);
export default Ticket;