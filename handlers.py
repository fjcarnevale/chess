import os
import urllib2

from google.appengine.ext import ndb

import jinja2
import webapp2
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

class Index(BaseHandler):
   """ Handles requests to the main page """
   def get(self):
      template = JINJA_ENVIRONMENT.get_template('index.html')
      self.response.write(template.render())

class NewGame(BaseHandler):
   def get(self):
      game = chess.Game.new_checker_game()

      template_values = {"game":game}
      template = JINJA_ENVIRONMENT.get_template('json/newgame.json')
      self.response.write(template.render(template_values))

class GameStatus(BaseHandler):
   def get(self):
      game_id = self.request.get("game_id")
      game = chess.Game.get_by_id(game_id)
   
      template_values = {"game":game}
      template = JINJA_ENVIRONMENT.get_template('json/status.json')
      self.response.write(template.render(template_values))

class Board(BaseHandler):
   def get(self):
      game_id = self.request.get("game_id")
      game = chess.Game.get_by_id(game_id)

      template_values = {"board":game.board}
      template = JINJA_ENVIRONMENT.get_template('json/board.json')
      self.response.write(template.render(template_values))

class Players(BaseHandler):
   def get(self):
      game_id = self.request.get("game_id")
      game = chess.Game.get_by_id(game_id)
   
      template_values = {"game":game}
      template = JINJA_ENVIRONMENT.get_template('json/players.json')
      self.response.write(template.render(template_values))

class Move(BaseHandler):
   def get(self):
      game_id = self.request.get("game_id")
      game = chess.Game.get_by_id(game_id)

      #src_row = int(self.request.get("src_row"))
      #src_col = int(self.request.get("src_col"))
      piece_name = self.request.get("piece_name")      
      dest_row = int(self.request.get("dest_row"))
      dest_col = int(self.request.get("dest_col"))

      game.move_piece(piece_name, dest_row, dest_col)

      template_values = {"game":game, "success":True}
      template = JINJA_ENVIRONMENT.get_template('json/move.json')
      self.response.write(template.render(template_values))
      

class AddPlayer(BaseHandler):
   def get(self):
      game_id = self.request.get("game_id")
      name = self.request.get("name")
      color = self.request.get("color")

      game = chess.Game.get_by_id(game_id)

      game.add_player(name,color)

      template_values = {"game":game}
      template = JINJA_ENVIRONMENT.get_template('json/players.json')
      self.response.write(template.render(template_values))


































        
