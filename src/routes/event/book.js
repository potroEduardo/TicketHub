import express from 'express';
import User from '../../models/user';
import Event from '../../models/event';
import Ticket from '../../models/ticket'; // Asegúrate de tener este modelo
import { isSignedIn } from '../common/authCheck';

const router = express.Router();

router.post('/', isSignedIn, async (req, res, next) => {
  try {
    const user = await User.findOne({ username: res.locals.options.username });
    const event = await Event.findOne({ eventId: req.body.eventId });

    if (!user || !event) {
      return res.json({ error: { type: 'notFound', message: 'Usuario o evento no encontrado' } });
    }

    //Comprar boleto

    if (req.body.type === 'book-in') {
      
      // Validaciones previas
      if (event.currentBookings >= event.capacity) {
        return res.json({ error: { type: 'eventFull', message: 'Evento lleno' } });
      } 
      if (event.endDate < new Date()) {
        return res.json({ error: { type: 'eventEnded', message: 'El evento ya terminó' } });
      } 
      
      // Verificar si ya tiene un ticket VÁLIDO 
      const existingTicket = await Ticket.findOne({ 
        user: user._id, 
        eventId: event.eventId, 
        status: 'VALID' 
      });

      if (existingTicket || user.eventsBooked.includes(event.eventId)) {
        return res.json({ error: { type: 'alreadyBooked', message: 'Ya tienes un boleto para este evento' } });
      }

      // Crear Ticket
      const newTicket = new Ticket({
        user: user._id,
        event: event._id,
        eventId: event.eventId,
        purchaseDate: Date.now(),
        status: 'VALID'
      });
      await newTicket.save();

      // Actualizar Evento
      event.currentBookings += 1;
      await event.save();

      // Actualizar Usuario
      user.eventsBooked.push(event.eventId);
      user.history.push({
        action: `Comprado: <a href="/event/id/${event.eventId}">${event.eventName}</a>`,
        time: Date.now()
      });
      await user.save();

      // Responder
      return res.json({ 
        success: true,
        ticketData: {
          id: newTicket._id,
          eventName: event.eventName,
          address: event.address,
          date: event.startDate,
          user: user.username
        }
      });

    //CANCELAR BOLETO (cancel)
    
    } else if (req.body.type === 'cancel') {

      // 1. Buscar el Ticket VÁLIDO
      const ticket = await Ticket.findOne({
        user: user._id,
        eventId: event.eventId,
        status: 'VALID'
      });

      if (!ticket) {
        // Si no hay ticket válido, no se puede cancelar 
        return res.json({ error: { type: 'noTicket', message: 'No tienes un boleto válido para cancelar' } });
      }

      // Marcar Ticket como CANCELADO
      ticket.status = 'CANCELLED';
      await ticket.save();

      // Actualizar Evento (Liberar cupo)
      if (event.currentBookings > 0) {
        event.currentBookings -= 1;
        await event.save();
      }

      // Actualizar Usuario (Quitar de la lista de eventos activos)
      user.eventsBooked = user.eventsBooked.filter(id => id !== event.eventId);
      user.history.push({
        action: `Cancelado: <a href="/event/id/${event.eventId}">${event.eventName}</a>`,
        time: Date.now()
      });
      await user.save();

      return res.json({ success: true });
    }

  } catch (err) {
    console.error("Error en proceso:", err);
    next(err);
  }
});

export default router;
