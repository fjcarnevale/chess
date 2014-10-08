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
   number = ndb.IntegerProperty()
   piece_name = ndb.StringProperty()
   captures = ndb.StringProperty()
   src_row = ndb.IntegerProperty()
   src_col = ndb.IntegerProperty()
   dest_row = ndb.IntegerProperty()
   dest_col = ndb.IntegerProperty()
   
   @staticmethod
   def new_move(number,piece_name,src_row,src_col,dest_row,dest_col,captures=""):
      move = Move()
      move.number = number
      move.piece_name = piece_name
      move.captures = captures
      move.src_row = src_row
      move.src_col = src_col
      move.dest_row = dest_row
      move.dest_col = dest_col
      return move
      

class Board(ndb.Model):
   pieces = ndb.StructuredProperty(Piece, repeated=True)
   moves = ndb.StructuredProperty(Move, repeated=True)

   def move_piece(self,piece_name,dest_row,dest_col):
      piece = self.find_piece_by_name(piece_name)

      if piece is None:
         raise Exception("Failed to find piece with name %s" % piece_name)
            
      number = len(self.moves) + 1
      move = Move.new_move(number,piece_name,piece.row,piece.col,dest_row,dest_col)

      piece.row = dest_row
      piece.col = dest_col

      self.moves.append(move)

   def find_piece_by_name(self, piece_name):
      pieces = filter(lambda piece: piece.name == piece_name, self.pieces)

      if len(pieces) > 0:
         return pieces[0]
      else:
         return None

   @staticmethod
   def new_checker_board():
      board = Board();
      moves = []
      counter = 0

      for pos in black_checker_positions:
         black_piece = Piece();
         black_piece.name = "black-checker-" + str(counter)
         black_piece.color = "black"
         black_piece.row = pos[0]
         black_piece.col = pos[1]

         board.pieces.append(black_piece);
         counter = counter + 1

      counter = 0

      for pos in red_checker_positions:
         red_piece = Piece();
         red_piece.name = "red-checker-" + str(counter)
         red_piece.color = "red"
         red_piece.row = pos[0]
         red_piece.col = pos[1]

         board.pieces.append(red_piece);
         counter = counter + 1

      return board

class Player(ndb.Model):
   name = ndb.StringProperty()
   color = ndb.StringProperty()

class Game(ndb.Model):
   game_id = ndb.StringProperty()
   state = ndb.StringProperty()
   board = ndb.StructuredProperty(Board)
   players = ndb.StructuredProperty(Player, repeated=True)
   turn = ndb.StringProperty()
   open_spots = ndb.StringProperty(repeated=True)

   def add_player(self,name,color):
      player = Player()
      player.name = name
      player.color = color
      self.open_spots.remove(color);
      self.players.append(player)
      
      if len(self.players) == 2:
         self.state = "playing"
         self.turn = "red"
      
      self.put()

   def move_piece(self,piece_name,dest_row,dest_col):
      self.board.move_piece(piece_name,dest_row,dest_col)
      self.switch_turn()
      

   def switch_turn(self):
      if self.turn == "red":
         self.turn = "black"
      else:
         self.turn = "red"
      self.put()
   

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
      game.players = []
      game.turn = ""
      game.last_move = None
      game.open_spots = ["red","black"]
      game.put()

      return game

def randomword(length):
  return ''.join(random.choice(string.lowercase) for i in range(length))

