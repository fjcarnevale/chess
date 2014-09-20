var current_game_id = "";
var game_state = "";
var player_name = "";
var player_color = "";
var turn = "";
var black_pieces = [];
var red_pieces = [];
var move_history = [];
var piece_to_move = null;
var refresh = 0;
var last_move_number = 0;

$(document).ready(function()
{
   // Function to handle clicking squares on the board
   $('td').click(function()
   {
      $("td").removeClass("checker-highlight");

      var col = $(this).index();
      var $tr = $(this).closest('tr');
      var row = $tr.index();

      var piece = find_piece(player_color,row,col);

      if(piece_to_move !== null && piece === null)
      {
         move_piece(piece_to_move,row,col);
      }
      else if (piece !== null)
      {
         var table = $("table tbody")[0];
         var cell = table.rows[row].cells[col]; // This is a DOM "TD" element
         var $cell = $(cell); // Now it's a jQuery object.
         piece_to_move = piece;
         
         $cell.addClass("checker-highlight");
      }
      else
      {
         piece_to_move = null;
      }
   });
   
   $("#new_game_button").click(function()
   {
      new_game();
   });

   $("#ready_button").click(function()
   {
      var player_name = $("#player_name").val();
      var player_color = $("#player_color").val();
      add_player(player_name, player_color);
   });

   $("#join_game_button").click(function()
   {
      join_game();
   });
   
});

function move_piece(piece, row, col)
{
   var endpoint = "/move?game_id=" + current_game_id;
   endpoint += "&src_row=" + piece["row"];
   endpoint += "&src_col=" + piece["col"];
   endpoint += "&dest_row=" + row;
   endpoint += "&dest_col=" + col;

   $.get(endpoint,function(data)
   {
      var json = jQuery.parseJSON(data);

      if(json.success == "true")
      {
         var move = json.move;

         var src_row = move.src_row;
         var src_col = move.src_col;
         var dest_row = move.dest_row;
         var dest_col = move.dest_col;

         for(var i=0; i<pieces.length; i++)
         {
            if(pieces[i]["row"] == src_row && pieces[i]["col"] == src_col)
            {
               pieces[i]["row"] = dest_row;
               pieces[i]["col"] = dest_col;
               refresh_board();
               break;
            }
         }

         update_turn(json["turn"]);
      }
   });
}

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

function start_refresh_timer()
{
   refresh = 1;
   setTimeout(refresh_game_status, 10000);
}

function stop_refresh_timer()
{
   refresh = 0;
}

function new_game()
{
   $(".piece").remove();

   $.get("/newgame",function(data)
   {
      var json = jQuery.parseJSON(data);
      var game_id = json.game_id;

      current_game_id = game_id;
      $("#game_id").html(game_id);

      update_status(game_id);
      update_players(game_id);
      setup_board(game_id);
      start_refresh_timer();
   });
}

function join_game()
{
   $(".piece").remove();

   current_game_id = $("#game_id_input").val();

   update_status(current_game_id);
   update_players(current_game_id);
   setup_board(current_game_id);
   start_refresh_timer();
}

function add_player(name,color)
{
   $("#ready_button").prop( "disabled", true );

   player_name = name;
   player_color = color;
   
   $.get("/addplayer?game_id=" + current_game_id + "&name=" + name + "&color=" + color, function(data)
   {
      var json = jQuery.parseJSON(data);
      var players = json.players;
      
      players.forEach(function(player)
      {
         if(player["color"] == "red")
         {
            $("#red_player_name").html(player.name);
         }
         else
         {
            $("#black_player_name").html(player.name);
         }
      });

      if(json["state"] == "playing")
      {
         if(json["turn"] == "black")
         {
            $("#black_player_name").addClass("turn");
            $("#red_player_name").removeClass("turn");
         }
         else if(json["turn"] == "red")
         {
            $("#black_player_name").removeClass("turn");
            $("#red_player_name").addClass("turn");
         }
      }
      
   });
}

function update_players(game_id)
{
   $.get("/players?game_id="+game_id, function(data)
   {
      console.log(data);
      var json = jQuery.parseJSON(data);
      var players = json["players"];
      
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
      
      var open_spots = [];

      json["open_spots"].forEach(function(element)
      {
         open_spots.push(element["spot"]);
      });

      var current_spots = [];
      $("#player_color option").each(function()
      {
          current_spots.push($(this).val());
      });

      open_spots.forEach(function(spot)
      {
         if(current_spots.indexOf(spot) < 0)
         {
            console.log("adding " + spot);
            $('#player_color')
               .append($("<option></option>")

               .attr("value",spot)
               .text(spot));
         }
      });

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

function update_status(game_id)
{
   $.get("/gamestatus?game_id="+game_id, function(data)
   {
      console.log(data);
      var json = jQuery.parseJSON(data);
      
      game_state = json.state;

      if(game_state == "playing")
      {
         update_turn(json.turn);
      }

      if(json.last_move !== null && json.last_move.number > last_move_number)
      {
         var last_move = json["last_move"];

         var src_row = last_move["src_row"];
         var src_col = last_move["src_col"];
         var dest_row = last_move["dest_row"];
         var dest_col = last_move["dest_col"];

         for(var i=0; i<pieces.length; i++)
         {
            if(pieces[i]["row"] == src_row && pieces[i]["col"] == src_col)
            {
               pieces[i]["row"] = dest_row;
               pieces[i]["col"] = dest_col;
               refresh_board();
               break;
            }
         }
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

function setup_board(game_id)
{
   $.get("/board?game_id=" + game_id,function(data)
   {
      var json = jQuery.parseJSON(data);
      pieces = json["board"]["pieces"];
      
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

function get_pawn_moves(color, row, col)
{
   var moves = [];
   
   if(color == "white")
   {
      moves.push([row - 1, col]);
      moves.push([row - 2, col]);
   }
   else
   {
   
   }
   
   return moves;
}
