import jinja2
import os
import urllib2
import webapp2

from google.appengine.ext import ndb
from webapp2_extras import sessions

import chess

JINJA_ENVIRONMENT = jinja2.Environment(
    loader=jinja2.FileSystemLoader(os.path.dirname(__file__)),
    extensions=['jinja2.ext.autoescape'],
    autoescape=True)

# Sourced from https://webapp-improved.appspot.com/api/webapp2_extras/sessions.html
class BaseHandler(webapp2.RequestHandler):
    def dispatch(self):
        # Get a session store for this request.
        self.session_store = sessions.get_store(request=self.request)

        try:
            # Dispatch the request.
            webapp2.RequestHandler.dispatch(self)
        finally:
            # Save all sessions.
            self.session_store.save_sessions(self.response)

    @webapp2.cached_property
    def session(self):
        # Returns a session using the default cookie key.
        return self.session_store.get_session()

# Handles a request for the main page
class Index(BaseHandler):

   def get(self):
      template = JINJA_ENVIRONMENT.get_template('index.html')
      self.response.write(template.render())

# Handles requests for a new game
class NewGame(BaseHandler):

   def get(self):
      game = chess.Game.new_checker_game()

      template_values = {"game":game}
      template = JINJA_ENVIRONMENT.get_template('json/newgame.json')
      self.response.write(template.render(template_values))

# Handles requests for game status
# Game status messages inlcude id, state, turn, and last move (if the game has started)
class GameStatus(BaseHandler):

   def get(self):
      game_id = self.request.get("game_id")
      game = chess.Game.get_by_id(game_id)
   
      template_values = {"game":game}
      template = JINJA_ENVIRONMENT.get_template('json/status.json')
      self.response.write(template.render(template_values))

# Returns a json message detailing the state of the board
class Board(BaseHandler):
   def get(self):
      game_id = self.request.get("game_id")
      game = chess.Game.get_by_id(game_id)

      template_values = {"board":game.board}
      template = JINJA_ENVIRONMENT.get_template('json/board.json')
      self.response.write(template.render(template_values))

# Returns the players and open slots available
class Players(BaseHandler):
   def get(self):
      game_id = self.request.get("game_id")
      game = chess.Game.get_by_id(game_id)
   
      template_values = {"game":game}
      template = JINJA_ENVIRONMENT.get_template('json/players.json')
      self.response.write(template.render(template_values))

# Moves a piece
class Move(BaseHandler):
   def get(self):
      game_id = self.request.get("game_id")
      game = chess.Game.get_by_id(game_id)

      piece_name = self.request.get("piece_name")      
      dest_row = int(self.request.get("dest_row"))
      dest_col = int(self.request.get("dest_col"))
      capture = self.request.get("capture", default_value="")

      game.move_piece(piece_name, dest_row, dest_col, capture)

      template_values = {"game":game, "move":game.board.moves[-1]}
      template = JINJA_ENVIRONMENT.get_template('json/move.json')
      self.response.write(template.render(template_values))
      
# Gets information for a single move
class GetMove(BaseHandler):
   def get(self):
      game_id = self.request.get("game_id")
      game = chess.Game.get_by_id(game_id)

      move_num = int(self.request.get("move_num"))

      move = game.board.moves[move_num]    

      template_values = {"game":game, "move":move}
      template = JINJA_ENVIRONMENT.get_template('json/move.json')
      self.response.write(template.render(template_values))

class AddPlayer(BaseHandler):
   def get(self):
      game_id = self.request.get("game_id")
      name = self.request.get("name")
      color = self.request.get("color")

      game = chess.Game.get_by_id(game_id)

      player = game.add_player(name,color)

      # TODO better error handling
      success = False
      error = "Failed to add player"
      if player is not None:
         success = True

      template_values = {"player":player,"success":success, "error":error}
      template = JINJA_ENVIRONMENT.get_template('json/add_player_response.json')
      self.response.write(template.render(template_values))


































        
