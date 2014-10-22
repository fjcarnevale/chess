var current_game_id = "";
var game_state = "";
var player_name = "";
var player_color = "";
var turn = "";
var black_pieces = [];
var red_pieces = [];
var move_history = [];
var board = [];
var moves = [];
var piece_to_move = null;
var refresh = 0;
var last_move_number = 0;

$(document).ready(function()
{
   // Function to handle clicking squares on the board
   $('td').click(function()
   {
      // Nothing to do, not our turn
      if(turn != player_color)
         return;

      // Remove any highlights
      $("td").removeClass("checker-highlight");
      $("td").removeClass("checker-jump-highlight");

      // Determine the row / column clicked
      var col = $(this).index();
      var $tr = $(this).closest('tr');
      var row = $tr.index();

      // Get the actual cell in the table
      var table = $("table tbody")[0];
      var cell = table.rows[row].cells[col]; // This is a DOM "TD" element
      var $cell = $(cell); // Now it's a jQuery object

      // Get the piece at that location on the board
      var piece = board[row][col];

      // If there is a piece ready to move and this is a blank space
      if(piece_to_move !== null && piece === null)
      {
         var move = moves[parseInt($cell.attr("move"))];

         // Move it
         move_piece(move);

         // Clear the piece to move
         piece_to_move = null;
      }
      else if (piece !== null && piece.color == player_color) // Else if we're selecting a piece to move
      {
         // Save the piece
         piece_to_move = piece;

         alert(piece_to_move.name);

         // Highlight the square the piece is on
         $cell.addClass("checker-highlight");

         // Figure out where that piece can move
         moves = get_valid_moves(player_color,row,col);
         
         // Highlight the squares for each move
         for(var i = 0; i < moves.length; i++)
         {
            // Get the cell
            cell = table.rows[moves[i].row].cells[moves[i].col]; // This is a DOM "TD" element
            $cell = $(cell); // Now it's a jQuery object.

            // Add a custom attribute to remember what move is at this cell
            $cell.attr("move",i);

            // Add highlight class based on type of move
            if(moves[i].type == "jump")
            {
               $cell.addClass("checker-jump-highlight");
            }
            else
            {
               $cell.addClass("checker-highlight");
            }
         }
      }
      else
      {
         // Clicked a cell of non-interest, just clear the piece to move
         piece_to_move = null;
      }
   });
   
   // Handle clicking of the new game button
   $("#new_game_button").click(function()
   {
      new_game();
   });

   // Handle clicking of the ready button
   $("#ready_button").click(function()
   {
      var player_name = $("#player_name").val();
      var player_color = $("#player_color").val();
      add_player(player_name, player_color);
   });

   // Handle clicking the join game button
   $("#join_game_button").click(function()
   {
      join_game();
   });
   
});

function move_piece(move)
{
   var endpoint = "/move?game_id=" + current_game_id;
   endpoint += "&piece_name=" + move.piece_name;
   endpoint += "&dest_row=" + move.row;
   endpoint += "&dest_col=" + move.col;

   if(move.hasOwnProperty("capture"))
   {
      endpoint += "&capture=" + move.capture;
   }

   $.get(endpoint,function(data)
   {
      var json = jQuery.parseJSON(data);

      //var move = json.move;

      var piece_name = json.move.piece_name
      var dest_row = json.move.dest_row;
      var dest_col = json.move.dest_col;

      console.log("Moving " + json.move.piece_name + " from " + json.move.src_row + " " + json.move.src_col + " to " + dest_row + " " + dest_col);
      
      // Get the piece to be moved and remove it from the board
      var piece_to_move = board[json.move.src_row][json.move.src_col];
      board[piece_to_move.row][piece_to_move.col] = null;

      console.log("Moving " + piece_to_move.piece_name);
      
      // Move piece's row and col
      piece_to_move.row = dest_row;
      piece_to_move.col = dest_col;

      // Reinsert the piece in the new location
      board[piece_to_move.row][piece_to_move.col] = piece_to_move;
      
      console.log("Move request returned with capture: '" + json.move.capture + "'");

      // Perform a capture, if there was one
      if(json.move.capture !== "")
      {
         // Find the captured piece
         captured_piece = find_piece_by_name(json.move.capture);

         // Remove it from the board
         board[captured_piece.row][captured_piece.col] = null;

         // Remove it from the pieces array
         var location = null;

         for(var i = 0; i < pieces.length; i++)
         {
            if(pieces[i].name === json.move.capture)
            {
               pieces.splice(i,1);
               break;
            }
         }
      }

      // Update the last move number
      last_move_number = move.number;

      // Refresh the board
      refresh_board();

      // Update the turn
      update_turn(json["turn"]);
   });
}

// Finds the piece with the given color at row,col
// Returns null if no matching piece is found
function find_piece(color, row, col)
{
   var pieces;
   var found_piece = null;

   if(color == "black")
   {
      pieces = black_pieces;
   }
   else
   {
      pieces = red_pieces;
   }

   for(var i=0; i<pieces.length; i++)
   {
      if(pieces[i]["row"] == row && pieces[i]["col"] == col)
      {
         found_piece = pieces[i];
         break;
      }
   }

   return found_piece;
}

// Finds piece by name
// Returns null if the piece can't be found
function find_piece_by_name(piece_name)
{
   for(var i = 0; i < black_pieces.length; i++)
   {
      if(black_pieces[i].name == piece_name)
      {
         return black_pieces[i];
      }
   }

   for(var i = 0; i < red_pieces.length; i++)
   {
      if(red_pieces[i].name == piece_name)
      {
         return red_pieces[i];
      }
   }

   return null;
}

// Refreshes the game status
function refresh_game_status()
{
   if(refresh)
   {
      // Only update the players if we're still in pregame
      if(game_state == "pregame")
      {
        update_players(current_game_id);
      }
      
      update_status(current_game_id);
      start_refresh_timer();
   }
}

// Starts the refresh timer
function start_refresh_timer()
{
   refresh = 1;
   setTimeout(refresh_game_status, 10000);
}

// Stops refresh timer
function stop_refresh_timer()
{
   refresh = 0;
}


// Creates a new game
function new_game()
{
   // Clean the current game
   clean_game();

   $.get("/newgame",function(data)
   {
      var json = jQuery.parseJSON(data);
      var game_id = json.game_id;

      current_game_id = game_id;
      $("#game_id_input").val(game_id);

      update_status(game_id);
      update_players(game_id);
      setup_board(game_id);
      start_refresh_timer();
   });
}

// Joins a given game
function join_game()
{
   // Clean the current game
   clean_game();

   // Get the game id we want to join
   current_game_id = $("#game_id_input").val();

   // Update the status, players, and board
   update_status(current_game_id);
   update_players(current_game_id);
   setup_board(current_game_id);
   start_refresh_timer();
}

// Adds the user as a player in the game
function add_player(name,color)
{
   // Disable ready button
   $("#ready_button").prop( "disabled", true);

   player_name = name;
   player_color = color;
   
   // Send request to add player
   $.get("/addplayer?game_id=" + current_game_id + "&name=" + name + "&color=" + color, function(data)
   {
      var json = jQuery.parseJSON(data);

      // Check for success
      if(json.success == "True")
      {
         // If successfull, add the player
         if(json.player.color == "red")
         {
            $("#red_player_name").html(json.player.name);
         }
         else
         {
            $("#black_player_name").html(json.player.name);
         }
      }
      else
      {
         // Otherwise alert why we failed
         alert(json.error);
      }
   });
}


// Updates the players
function update_players(game_id)
{
   $.get("/players?game_id="+game_id, function(data)
   {
      console.log(data);
      var json = jQuery.parseJSON(data);
      var players = json.players;
      
      // TODO only set the html value if it hasn't been set yet
      // TODO keep track of the player names in javascript
      players.forEach(function(player)
      {
         if(player["color"] == "red")
         {
            $("#red_player_name").html(player["name"]);
         }
         else
         {
            $("#black_player_name").html(player["name"]);
         }
      });
      
      // Determine which colors are still available
      var open_spots = [];

      json.open_spots.forEach(function(element)
      {
         open_spots.push(element["spot"]);
      });

      // Determine which spots are listed in the combo box
      var current_spots = [];
      $("#player_color option").each(function()
      {
          current_spots.push($(this).val());
      });

      // Add any colors that aren't in the color selection box
      open_spots.forEach(function(spot)
      {
         if(current_spots.indexOf(spot) < 0)
         {
            $('#player_color')
               .append($("<option></option>")

               .attr("value",spot)
               .text(spot));
         }
      });

      // Remove any colors that are no longer available
      current_spots.forEach(function(spot)
      {
         if(open_spots.indexOf(spot) < 0)
         {
            console.log("removing " + spot);
            $("#player_color option[value='"+spot+"']").remove();
         }
      });
   });
}

// Updates the game status
function update_status(game_id)
{
   $.get("/gamestatus?game_id="+game_id, function(data)
   {
      //console.log(data);
      var json = jQuery.parseJSON(data);

      // Update game state
      game_state = json.state

      if(game_state == "playing")
      {
         update_turn(json.turn);
      }

      // TODO either remove this from status and just indicate the last move number
      // OR pass the move information to a separate method so this and the move function use the same code
      if("last_move" in json && json.last_move.number > last_move_number)
      {
         var move = json.last_move;

         var piece_name = move.piece_name
         var dest_row = move.dest_row;
         var dest_col = move.dest_col;
         
         // Get the piece to be moved and remove it from the board
         var piece = board[move.src_row][move.src_col];
         board[piece.row][piece.col] = null;
         
         // Move piece's row and col
         piece.row = dest_row;
         piece.col = dest_col;

         // Reinsert the piece in the new location
         board[piece.row][piece.col] = piece;

         // Refresh the board
         refresh_board();

         // Update the turn
         update_turn(json["turn"]);
      }
   });
}

function update_turn(color)
{
   turn = color;

   if(turn == "black")
   {
      $("#black_player_name").addClass("turn");
      $("#red_player_name").removeClass("turn");
   }
   else if(turn == "red")
   {
      $("#black_player_name").removeClass("turn");
      $("#red_player_name").addClass("turn");
   }
}

// Cleans the game state
function clean_game()
{
   // Remove pieces
   $(".piece").remove();

   // Un-highlight any highlighted spaces
   $("td").removeClass("checker-highlight");

   // Reset game variables
   current_game_id = "";
   game_state = "";
   player_name = "";
   player_color = "";
   turn = "";
   black_pieces = [];
   red_pieces = [];
   move_history = [];
   piece_to_move = null;
   refresh = 0;
   last_move_number = 0;
}

// Nulls out the board
function clean_board()
{
   board = [];

   for(var i = 0; i < 8; i++)
   {
      row = [];
      for(var j = 0; j < 8; j++)
      {
         row.push(null);
      }
      board.push(row);
   }
}

function setup_board(game_id)
{
   $.get("/board?game_id=" + game_id,function(data)
   {
      var json = jQuery.parseJSON(data);
      pieces = json["board"]["pieces"];

      clean_board();
      pieces.forEach(function(piece)
      {
         row = piece.row
         col = piece.col
         board[piece.row][piece.col] = piece;
      });

      console.log(board);
      
      refresh_board();
   });
}

function refresh_board()
{
   $(".piece").remove();

   var table = $("table tbody")[0];

   pieces.forEach(function(piece)
   {
      var cell = table.rows[piece["row"]].cells[piece["col"]];
      var $cell = $(cell);
      
      var toAdd = $('<div/>');
      toAdd.addClass("piece");

      if(piece["color"] == "black")
      {
         black_pieces.push(piece);
         toAdd.addClass("black-checker");
      }
      else
      {
         red_pieces.push(piece);
         toAdd.addClass("red-checker");
      }
   
      $cell.append(toAdd);

   });
}

// Finds all possible moves from a certain position
function get_valid_moves(color, row, col)
{
   var possible_locations = [];
   var valid_moves = [];

   // Prime with coords to move to in each diagonal direction
   possible_locations.push([row-1,col-1]);
   possible_locations.push([row-1,col+1]);
   possible_locations.push([row+1,col-1]);
   possible_locations.push([row+1,col+1]);

   var piece = board[row][col];

   // For each possible move location
   possible_locations.forEach(function(move)
   {
      // Check for a piece there
      var captured_piece = board[move[0]][move[1]]

      // If there is an opponent piece there
      if(captured_piece !== null && captured_piece.color != player_color)
      {
         // Check to see if we can jump it
         var jump_move = [(move[0]-row)*2 + row, (move[1]-col)*2 + col];

         if(board[jump_move[0]][jump_move[1]] === null)
         {
            // We can jump to it, add the jump move
            valid_moves.push({"type":"jump", "piece_name":piece.name,"capture":captured_piece.name,"row":jump_move[0], "col":jump_move[1]});
         }
      }
      else if(board[move[0]][move[1]] === null)
      {
         // If the space is free add a normal move
         valid_moves.push({"type":"normal", "piece_name":piece.name, "row":move[0], "col":move[1]});
      }
   });

   // Return the list of valid moves
   return valid_moves;
}










