var width = screen.width/2;
var left = width - 242;
$("#Board").css('left',left+'px');

var left_image = width - 278.5;
$("#board-image").css('left',left_image+'px');

$('#undo-btn').click( function () {
	if(ChessBoard.hisPly > 0) {
		TakeMove();
		ChessBoard.ply = 0;
		SetInitialBoardPieces();
	}
});

$('#newgame-btn').click( function () {
	NewGame(START_FEN);

});

function NewGame(fenStr) {
	ParseFen(fenStr);
	PrintBoard();
	SetInitialBoardPieces();
	CheckAndSet();
	DeSelectSq(UserMove.from);
    dialogBox();
    $("#modal").show();
}

function ClearAllPieces() {
	$(".Piece").remove();
}

function SetInitialBoardPieces() {

	var sq;
	var sq120;
	var pce;

	ClearAllPieces();

	for(sq = 0; sq < 64; ++sq) {
		sq120 = SQ120(sq);
		pce = ChessBoard.pieces[sq120];
		if(pce >= PIECES.wP && pce <= PIECES.bK) {
			AddGUIPiece(sq120, pce);
		}
	}
}

function DeSelectSq(sq) {
	$('.Square').each( function(index) {
		if(PieceIsOnSq(sq, $(this).position().top, $(this).position().left) == BOOL.TRUE) {
				$(this).removeClass('SquareSelected');
		}
	} );
}

function SetSqSelected(sq) {
	$('.Square').each( function(index) {
		if(PieceIsOnSq(sq, $(this).position().top, $(this).position().left) == BOOL.TRUE) {
				$(this).addClass('SquareSelected');
		}
	} );
}

function ClickedSquare(pageX, pageY) {
	var position = $('#Board').position();

	var workedX = Math.floor(position.left);
	var workedY = Math.floor(position.top);

	pageX = Math.floor(pageX);
	pageY = Math.floor(pageY);

	var file = Math.floor((pageX-workedX) / 60);
	var rank = 7 - Math.floor((pageY-workedY) / 60);

	var sq = FR2SQ(file,rank);

	console.log('Clicked sq:' + PrSq(sq));

	SetSqSelected(sq);

	return sq;
}

$(document).on('click','.Piece', function (e) {
	if(UserMove.from == SQUARES.NO_SQ) {
		UserMove.from = ClickedSquare(e.pageX, e.pageY);
	} else {
		UserMove.to = ClickedSquare(e.pageX, e.pageY);
	}

	MakeUserMove();

});

$(document).on('click','.Square', function (e) {
	if(UserMove.from != SQUARES.NO_SQ) {
		UserMove.to = ClickedSquare(e.pageX, e.pageY);
		MakeUserMove();
	}

});

function MakeUserMove() {

	if(UserMove.from != SQUARES.NO_SQ && UserMove.to != SQUARES.NO_SQ) {

		console.log("User Move:" + PrSq(UserMove.from) + PrSq(UserMove.to));

		var parsed = ParseMove(UserMove.from,UserMove.to);

		if(parsed != NOMOVE) {
			MakeMove(parsed);
			PrintBoard();
			MoveGUIPiece(parsed);
			CheckAndSet();
			PreSearch();
		}

		DeSelectSq(UserMove.from);
		DeSelectSq(UserMove.to);

		UserMove.from = SQUARES.NO_SQ;
		UserMove.to = SQUARES.NO_SQ;
	}

}

function PieceIsOnSq(sq, top, left) {

	if( (RanksBrd[sq] == 7 - Math.round(top/60) ) &&
		FilesBrd[sq] == Math.round(left/60) ) {
		return BOOL.TRUE;
	}

	return BOOL.FALSE;

}

function RemoveGUIPiece(sq) {
	$('.Piece').each( function(index) {
		if(PieceIsOnSq(sq, $(this).position().top, $(this).position().left) == BOOL.TRUE) {
			if (ChessBoard.side == COLOURS.WHITE){
                var piece = $(this).clone();
                piece.css('top',0);
                piece.css('left',-10);
                $("#white-captured-pieces").html(piece);
			}else {
                var piece = $(this).clone();
                piece.css('top',0);
                piece.css('left',-10);
                $("#black-captured-pieces").html(piece);
			}
			$(this).remove();
		}
	} );

}

function AddGUIPiece(sq, pce) {

	var file = FilesBrd[sq];
	var rank = RanksBrd[sq];
	var rankName = "rank" + (rank+1);
	var	fileName = "file" + (file+1);
	var pieceFileName = "images/" + SideChar[PieceCol[pce]] + PceChar[pce].toUpperCase() + ".png";
	var	imageString = "<image src=\"" + pieceFileName + "\" class=\"Piece " + rankName + " " + fileName + "\"/>";
	$("#Board").append(imageString);
}

function MoveGUIPiece(move) {

	var from = FROMSQ(move);
	var to = TOSQ(move);

	if(move & MFLAGEP) {
		var epRemove;
		if(ChessBoard.side == COLOURS.BLACK) {
			epRemove = to - 10;
		} else {
			epRemove = to + 10;
		}
		RemoveGUIPiece(epRemove);
	} else if(CAPTURED(move)) {
		RemoveGUIPiece(to);
	}

	var file = FilesBrd[to];
	var rank = RanksBrd[to];
	var rankName = "rank" + (rank+1);
	var	fileName = "file" + (file+1);

	$('.Piece').each( function(index) {
		if(PieceIsOnSq(from, $(this).position().top, $(this).position().left) == BOOL.TRUE) {
			$(this).removeClass();
			$(this).addClass("Piece " + rankName + " " + fileName);
		}
	} );

	if(move & MFLAGCA) {
		switch(to) {
			case SQUARES.G1: RemoveGUIPiece(SQUARES.H1); AddGUIPiece(SQUARES.F1, PIECES.wR); break;
			case SQUARES.C1: RemoveGUIPiece(SQUARES.A1); AddGUIPiece(SQUARES.D1, PIECES.wR); break;
			case SQUARES.G8: RemoveGUIPiece(SQUARES.H8); AddGUIPiece(SQUARES.F8, PIECES.bR); break;
			case SQUARES.C8: RemoveGUIPiece(SQUARES.A8); AddGUIPiece(SQUARES.D8, PIECES.bR); break;
		}
	} else if (PROMOTED(move)) {
		RemoveGUIPiece(to);
		AddGUIPiece(to, PROMOTED(move));
	}

}

function DrawMaterial() {

	if (ChessBoard.pceNum[PIECES.wP]!=0 || ChessBoard.pceNum[PIECES.bP]!=0) return BOOL.FALSE;
	if (ChessBoard.pceNum[PIECES.wQ]!=0 || ChessBoard.pceNum[PIECES.bQ]!=0 ||
					ChessBoard.pceNum[PIECES.wR]!=0 || ChessBoard.pceNum[PIECES.bR]!=0) return BOOL.FALSE;
	if (ChessBoard.pceNum[PIECES.wB] > 1 || ChessBoard.pceNum[PIECES.bB] > 1) {return BOOL.FALSE;}
    if (ChessBoard.pceNum[PIECES.wN] > 1 || ChessBoard.pceNum[PIECES.bN] > 1) {return BOOL.FALSE;}

	if (ChessBoard.pceNum[PIECES.wN]!=0 && ChessBoard.pceNum[PIECES.wB]!=0) {return BOOL.FALSE;}
	if (ChessBoard.pceNum[PIECES.bN]!=0 && ChessBoard.pceNum[PIECES.bB]!=0) {return BOOL.FALSE;}

	return BOOL.TRUE;
}

function ThreeFoldRep() {
	var i = 0, r = 0;

	for(i = 0; i < ChessBoard.hisPly; ++i) {
		if (ChessBoard.history[i].posKey == ChessBoard.posKey) {
		    r++;
		}
	}
	return r;
}

function CheckResult() {
	if(ChessBoard.fiftyMove >= 100) {
		alert("GAME DRAWN {fifty move rule}");
		 return BOOL.TRUE;
	}

	if (ThreeFoldRep() >= 2) {
        alert("GAME DRAWN {3-fold repetition}");
     	return BOOL.TRUE;
    }

	if (DrawMaterial() == BOOL.TRUE) {
        alert("GAME DRAWN {insufficient material to mate}");
     	return BOOL.TRUE;
    }

    GenerateMoves();

    var MoveNum = 0;
	var found = 0;

	for(MoveNum = ChessBoard.moveListStart[ChessBoard.ply]; MoveNum < ChessBoard.moveListStart[ChessBoard.ply + 1]; ++MoveNum)  {

        if ( MakeMove(ChessBoard.moveList[MoveNum]) == BOOL.FALSE)  {
            continue;
        }
        found++;
		TakeMove();
		break;
    }

	if(found != 0) return BOOL.FALSE;

	var InCheck = SqAttacked(ChessBoard.pList[PCEINDEX(Kings[ChessBoard.side],0)], ChessBoard.side^1);

	if(InCheck == BOOL.TRUE) {
		if(ChessBoard.side == COLOURS.WHITE) {
            alert("GAME OVER {Black Mates}");
	      return BOOL.TRUE;
        } else {
            alert("GAME OVER {White Mates}");
	      return BOOL.TRUE;
        }
	} else {
        alert("GAME DRAWN {Stale Mates}");
		return BOOL.TRUE;
	}

	return BOOL.FALSE;
}

function CheckAndSet() {
	if(CheckResult() == BOOL.TRUE) {
		GameController.GameOver = BOOL.TRUE;
	} else {
		GameController.GameOver = BOOL.FALSE;
		$("#GameStatus").text('');
	}
}

function PreSearch() {
	if(GameController.GameOver == BOOL.FALSE) {
		ChessBoardSearchController.thinking = BOOL.TRUE;
		setTimeout( function() { StartSearch(); }, 200 );
	}
}

function StartSearch() {

	ChessBoardSearchController.depth = MAXDEPTH;
	var t = $.now();
	var tt = 1;
	console.log('tt : '+tt);

	ChessBoardSearchController.time = parseInt(tt) * 1000;
	SearchPosition();

	MakeMove(ChessBoardSearchController.best);
	MoveGUIPiece(ChessBoardSearchController.best);
	CheckAndSet();
}














































