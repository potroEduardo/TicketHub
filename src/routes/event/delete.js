import express from 'express';
import Event from '../../models/event';
import User from '../../models/user';
import { isStaff } from '../common/authCheck';

const router = express.Router();

router.delete('/id/:eventID', isStaff, (req, res) => {
  Event.findOneAndRemove({ eventId: req.params.eventID }).then(result => {
    if (!result) {
      return res.send({
        message: 'No hay evento ID' + req.params.eventID
      });
    }
    const redirect = '/manage-events';
    const page = 'Manage Events';

    User.findOneAndUpdate(
      { username: res.locals.options.username },
      {
        $push: {
          history: {
            action: `Eliminar evento <a href="/event/id/${result.eventId}">${result.eventName}</a>`,
            time: Date.now()
          }
        }
      }
    ).then(() => res.send({
      message: 'Evento con ID ' + result.eventId + ' fue eliminado',
      redirect,
      page
    }));
  }).catch(err => {
    console.log(err);
    return res.send({
      message: 'No hay evento con ID' + req.params.eventID
    });
  });
});

export default router;