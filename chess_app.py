import webapp2
import handlers

config = {}
config['webapp2_extras.sessions'] = {
    'secret_key': 'my-super-secret-key',
}

application = webapp2.WSGIApplication([
	('/', handlers.Index),
   ('/newgame', handlers.NewGame),
   ('/gamestatus', handlers.GameStatus),
   ('/getboard', handlers.GetBoard),
   ('/move', handlers.Move),
   ('/chooseside', handlers.ChooseSide)
], config=config, debug=True)




























