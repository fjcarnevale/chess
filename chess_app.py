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
   ('/board', handlers.Board),
   ('/players', handlers.Players),
   ('/move', handlers.Move),
   ('/getmove', handlers.GetMove),
   ('/addplayer', handlers.AddPlayer)
], config=config, debug=True)




























