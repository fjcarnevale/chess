from google.appengine.ext import ndb
import random
import string

black_checker_positions = [(0, 1), (0, 3), (0, 5), (0, 7), (0, 9),
                    (1, 0), (1, 2), (1, 4), (1, 6), (1, 8),
                    (2, 1), (2, 3), (2, 5), (2, 7), (2, 9)]

red_checker_positions = [(5, 0), (5, 2), (5, 4), (5, 6), (5, 8),
                    (6, 1), (6, 3), (6, 5), (6, 7), (6, 9),
                    (7, 0), (7, 2), (7, 4), (7, 6), (7, 8)]

class Piece(ndb.Model):
   name = ndb.StringProperty()
   row = ndb.IntegerProperty()
   col = ndb.IntegerProperty()
   color = ndb.StringProperty()
   
class Move(ndb.Model):
   name = ndb.StringProperty();
   row_source = ndb.IntegerProperty()
   col_source = ndb.IntegerProperty()
   row_dest = ndb.IntegerProperty()
   col_dest = ndb.IntegerProperty()

class Board(ndb.Model):
   pieces = ndb.StructuredProperty(Piece, repeated=True)
   moves = ndb.StructuredProperty(Move, repeated=True)

   @staticmethod
   def new_checker_board():
      board = Board();
      moves = []

      for pos in black_checker_positions:
         black_piece = Piece();
         black_piece.name = "checker"
         black_piece.color = "black"
         black_piece.row = pos[0]
         black_piece.col = pos[1]

         board.pieces.append(black_piece);

      for pos in red_checker_positions:
         red_piece = Piece();
         red_piece.name = "checker"
         red_piece.color = "red"
         red_piece.row = pos[0]
         red_piece.col = pos[1]

         board.pieces.append(red_piece);

      return board

class Game(ndb.Model):
   game_id = ndb.StringProperty()
   state = ndb.StringProperty()
   board = ndb.StructuredProperty(Board)
   player_1 = ndb.StringProperty()
   player_2 = ndb.StringProperty()

   @staticmethod
   def get_by_id(game_id):
      key = ndb.Key(Game,game_id)
      return key.get()

   @staticmethod
   def new_checker_game():
      game_id = randomword(8);
   
      game = Game(id=game_id);
      game.game_id = game_id
      game.state = "pregame"
      game.board = Board.new_checker_board();
      game.player_1 = ""
      game.player_2 = ""
      game.put()

      return game

def randomword(length):
	return ''.join(random.choice(string.lowercase) for i in range(length))

