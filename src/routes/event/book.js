import express from 'express';
import User from '../../models/user';
import Event from '../../models/event';
import { isSignedIn } from '../common/authCheck';
const router = express.Router();

router.post('/', isSignedIn, async (req, res, next) => {
  try {
    let user = await User.findOne({ username: res.locals.options.username });
    let event = await Event.findOne({ eventId: req.body.eventId });

    if (req.body.type === 'book-in') {
      if (!event) {
        res.json({ error: { type: 'eventNonExistent', message: 'Evento no existe' } });
      } else if (event.currentBookings >= event.capacity) {
        res.json({ error: { type: 'eventFull', message: 'Evento esta lleno' } });
      } else if (event.endDate < new Date()) {
        res.json({ error: { type: 'eventEnded', message: 'El evento ya terminó' } });
      } else if (user.eventsBooked.includes(event.eventId)) {
        res.json({ error: { type: 'alreadyBooked', message: 'Ya compraste este evento' } });
      } else {
        //proceso de compra
        event.currentBookings += 1;
        await event.save();
        user.eventsBooked.push(event.eventId);
        user.history.push({
          action: `Boletos <a href="/event/id/${event.eventId}">${event.eventName}</a>`,
          time: Date.now()
        });
        await user.save();
        res.json({ success: true });
      }
    } else if (req.body.type === 'cancel') {
      event.currentBookings -= 1;
      await event.save();
      user.eventsBooked = user.eventsBooked.filter(value => value !== event.eventId);
      user.history.push({
        action: `Cancelar boleto para <a href="/event/id/${event.eventId}">${event.eventName}</a>`,
        time: Date.now()
      });
      await user.save();
      res.json({ success: true });
    }
  } catch (err) {
    console.log(err);
    next(err);
  }
});

export default router;