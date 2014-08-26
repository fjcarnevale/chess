from google.appengine.ext import ndb
import random
import string

checker_positions = [(0, 1), (0, 3), (0, 5), (0, 7), (0, 9),
                    (1, 0), (1, 2), (1, 4), (1, 6), (1, 8),
                    (2, 1), (2, 3), (2, 5), (2, 7), (2, 9)]

class Piece(ndb.Model):
   name = ndb.StringProperty()
   row = ndb.IntegerProperty()
   col = ndb.IntegerProperty()

class Checker(Piece):
   color = ndb.StringProperty();

class Board(ndb.Model):
   pieces = ndb.StructuredProperty(Piece, repeated=True)

   @staticmethod
   def new_checker_board():
      board = Board();

      for pos in checker_positions:
         black_piece = Checker();
         black_piece.name = "checker"
         black_piece.color = "black"
         black_piece.row = pos[0]
         black_piece.col = pos[1]

         red_piece = Checker();
         red_piece.name = "checker"
         red_piece.color = "red"
         red_piece.row = pos[0] + 5 # Add 5 to move to bottom of board
         red_piece.col = pos[1]

         board.pieces.append(black_piece);
         board.pieces.append(red_piece);

      return board

class Game(ndb.Model):
   game_id = ndb.StringProperty()
   state = ndb.StringProperty()
   board = ndb.StructuredProperty(Board)
   player_1 = ndb.StringProperty()
   player_2 = ndb.StringProperty()

   @staticmethod
   def new_checker_game():
      game = Game();
      game.game_id = randomword(8);
      game.state = "pregame"
      game.board = Board.new_checker_board();
      game.player_1 = ""
      game.player_2 = ""
      game.put()

      return game

def randomword(length):
	return ''.join(random.choice(string.lowercase) for i in range(length))

