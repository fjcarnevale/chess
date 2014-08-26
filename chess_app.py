import webapp2
import handlers

config = {}
config['webapp2_extras.sessions'] = {
    'secret_key': 'my-super-secret-key',
}

application = webapp2.WSGIApplication([
	('/', handlers.Index),
   ('/gamestatus', handlers.GameStatus)
], config=config, debug=True)




























