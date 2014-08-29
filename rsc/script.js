var current_game_id = "";

$(document).ready(function()
{
   $('td').click(function()
   {
      $("td").removeClass("checker-highlight");
      $("td").removeClass("possible-move");
      
      $(this).addClass("checker-highlight");
   
      var myCol = $(this).index();
      var $tr = $(this).closest('tr');
      var myRow = $tr.index();

      moves = get_pawn_moves(myRow, myCol);
      
      for (var i = 0; i < moves.length; i++)
      {
         var table = $("table tbody")[0];
         var cell = table.rows[moves[i][0]].cells[moves[i][1]]; // This is a DOM "TD" element
         var $cell = $(cell); // Now it's a jQuery object.
         
         $cell.addClass("possible-move");
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
   
});

function new_game()
{
   $(".piece").remove();

   $.get("/newgame",function(data)
   {
      var json = jQuery.parseJSON(data);
      var game_id = json["game_id"];
      current_game_id = game_id;
      $("#game_id").html(game_id);
      update_status(game_id);
      setup_board(game_id);
   });
}

function add_player(name,color)
{
   $("#ready_button").prop( "disabled", true );
   
   $.get("/addplayer?game_id=" + current_game_id + "&name=" + name + "&color=" + color, function(data)
   {
      alert(data);
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
   });
}

function update_status(game_id)
{
   $.get("/gamestatus?game_id="+game_id, function(data)
   {
      var json = jQuery.parseJSON(data);
      
   });
}

function setup_board(game_id)
{
   $.get("/getboard?game_id=" + game_id,function(data)
   {
      var json = jQuery.parseJSON(data);
      pieces = json["board"]["pieces"];
      
      var table = $("table tbody")[0];

      pieces.forEach(function(piece)
      {
         var cell = table.rows[piece["row"]].cells[piece["col"]];
         var $cell = $(cell);
         
         var toAdd = $('<div/>');
         toAdd.addClass("piece");

         if(piece["color"] == "black")
         {
            toAdd.addClass("black-checker");
         }
         else
         {
            toAdd.addClass("red-checker");
         }
      
         $cell.append(toAdd);         

      });
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
