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


class GameStatus(BaseHandler):
   def get(self):
      game = chess.Game.new_checker_game();

      template_values = {"game":game}
      template = JINJA_ENVIRONMENT.get_template('status.json')
      self.response.write(template.render(template_values))




        
