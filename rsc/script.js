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

      moves = get_rook_moves(myRow, myCol);
      
      for (var i = 0; i < moves.length; i++)
      {
         var table = $("table tbody")[0];
         var cell = table.rows[moves[i][0]].cells[moves[i][1]]; // This is a DOM "TD" element
         var $cell = $(cell); // Now it's a jQuery object.
         
         $cell.addClass("possible-move");
      }

      //$("table").effect("shake",{distance:5, times:2}, 250);
   });
   
   $("button").click(function()
   {
      $.get("/gamestatus",function(data)
      {
         var status = jQuery.parseJSON(data);
         pieces = status["data"]["board"]["pieces"];
         
         var table = $("table tbody")[0];
         

         pieces.forEach(function(piece)
         {
            var cell = table.rows[piece["row"]].cells[piece["col"]];
            var $cell = $(cell);
            
            var toAdd = $('<div/>');

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
   });
   
});

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

function get_rook_moves(row, col)
{
   var moves = [];
   
   for(var i=0; i < 8; i++)
   {
      if(i != row)
      {
         moves.push([i,col]);
      }
      
      if(i != col)
      {
         moves.push([row,i]);
      }
      
   }
   
   return moves;
}
