var GameType = {};

GameType.OneOrTwo = 0;

function ClearPiece(sq) {

	var pce = ChessBoard.pieces[sq];
	var col = PieceCol[pce];
	var index;
	var t_pceNum = -1;
	
	HASH_PCE(pce, sq);
	
	ChessBoard.pieces[sq] = PIECES.EMPTY;
	ChessBoard.material[col] -= PieceVal[pce];
	
	for(index = 0; index < ChessBoard.pceNum[pce]; ++index) {
		if(ChessBoard.pList[PCEINDEX(pce,index)] == sq) {
			t_pceNum = index;
			break;
		}
	}
	
	ChessBoard.pceNum[pce]--;
	ChessBoard.pList[PCEINDEX(pce, t_pceNum)] = ChessBoard.pList[PCEINDEX(pce, ChessBoard.pceNum[pce])];	

}

function AddPiece(sq, pce) {

	var col = PieceCol[pce];
	
	HASH_PCE(pce, sq);
	
	ChessBoard.pieces[sq] = pce;
	ChessBoard.material[col] += PieceVal[pce];
	ChessBoard.pList[PCEINDEX(pce, ChessBoard.pceNum[pce])] = sq;
	ChessBoard.pceNum[pce]++;

}

function MovePiece(from, to) {
	
	var index = 0;
	var pce = ChessBoard.pieces[from];
	
	HASH_PCE(pce, from);
	ChessBoard.pieces[from] = PIECES.EMPTY;
	
	HASH_PCE(pce,to);
	ChessBoard.pieces[to] = pce;
	
	for(index = 0; index < ChessBoard.pceNum[pce]; ++index) {
		if(ChessBoard.pList[PCEINDEX(pce,index)] == from) {
			ChessBoard.pList[PCEINDEX(pce,index)] = to;
			break;
		}
	}
	
}

function MakeMove(move) {
	
	var from = FROMSQ(move);
    var to = TOSQ(move);
    var side = ChessBoard.side;	

	ChessBoard.history[ChessBoard.hisPly].posKey = ChessBoard.posKey;

	if( (move & MFLAGEP) != 0) {
		if(side == COLOURS.WHITE) {
			ClearPiece(to-10);
		} else {
			ClearPiece(to+10);
		}
	} else if( (move & MFLAGCA) != 0) {
		switch(to) {
			case SQUARES.C1:
                MovePiece(SQUARES.A1, SQUARES.D1);
			break;
            case SQUARES.C8:
                MovePiece(SQUARES.A8, SQUARES.D8);
			break;
            case SQUARES.G1:
                MovePiece(SQUARES.H1, SQUARES.F1);
			break;
            case SQUARES.G8:
                MovePiece(SQUARES.H8, SQUARES.F8);
			break;
            default: break;
		}
	}
	
	if(ChessBoard.enPas != SQUARES.NO_SQ) HASH_EP();
	HASH_CA();
	
	ChessBoard.history[ChessBoard.hisPly].move = move;
    ChessBoard.history[ChessBoard.hisPly].fiftyMove = ChessBoard.fiftyMove;
    ChessBoard.history[ChessBoard.hisPly].enPas = ChessBoard.enPas;
    ChessBoard.history[ChessBoard.hisPly].castlePerm = ChessBoard.castlePerm;
    
    ChessBoard.castlePerm &= CastlePerm[from];
    ChessBoard.castlePerm &= CastlePerm[to];
    ChessBoard.enPas = SQUARES.NO_SQ;
    
    HASH_CA();
    
    var captured = CAPTURED(move);
    ChessBoard.fiftyMove++;
    
    if(captured != PIECES.EMPTY) {
        ClearPiece(to);
        ChessBoard.fiftyMove = 0;
    }
    
    ChessBoard.hisPly++;
	ChessBoard.ply++;
	
	if(PiecePawn[ChessBoard.pieces[from]] == BOOL.TRUE) {
        ChessBoard.fiftyMove = 0;
        if( (move & MFLAGPS) != 0) {
            if(side==COLOURS.WHITE) {
                ChessBoard.enPas=from+10;
            } else {
                ChessBoard.enPas=from-10;
            }
            HASH_EP();
        }
    }
    
    MovePiece(from, to);
    
    var prPce = PROMOTED(move);
    if(prPce != PIECES.EMPTY)   {       
        ClearPiece(to);
        AddPiece(to, prPce);
    }

    ChessBoard.side ^= 1;


    if (ChessBoard.side == 0){
        $("#side-tag").html('<form action=""> <input type="radio" name="side" value="female"> <label style="font-size: 18px">White Side</label><br> <input type="radio" name="side" value="other" checked> <label style="font-size: 18px"> Black Side</label> </form>');
    }else{
        $("#side-tag").html('<form action=""> <input type="radio" name="side" value="female" checked> <label style="font-size: 18px">White Side</label><br> <input type="radio" name="side" value="other"> <label style="font-size: 18px"> Black Side</label> </form>');
    }
    //
    // $("#side").html("<h2>"+displaySide+"'s Turn</h2>")
    // rotateBoard();

    HASH_SIDE();
    
    if(SqAttacked(ChessBoard.pList[PCEINDEX(Kings[side],0)], ChessBoard.side))  {
         TakeMove();
    	return BOOL.FALSE;
    }
    
    return BOOL.TRUE;
}

function TakeMove() {
	
	ChessBoard.hisPly--;
    ChessBoard.ply--;
    
    var move = ChessBoard.history[ChessBoard.hisPly].move;
	var from = FROMSQ(move);
    var to = TOSQ(move);
    
    if(ChessBoard.enPas != SQUARES.NO_SQ) HASH_EP();
    HASH_CA();
    
    ChessBoard.castlePerm = ChessBoard.history[ChessBoard.hisPly].castlePerm;
    ChessBoard.fiftyMove = ChessBoard.history[ChessBoard.hisPly].fiftyMove;
    ChessBoard.enPas = ChessBoard.history[ChessBoard.hisPly].enPas;
    
    if(ChessBoard.enPas != SQUARES.NO_SQ) HASH_EP();
    HASH_CA();
    
    ChessBoard.side ^= 1;
    HASH_SIDE();
    
    if( (MFLAGEP & move) != 0) {
        if(ChessBoard.side == COLOURS.WHITE) {
            AddPiece(to-10, PIECES.bP);
        } else {
            AddPiece(to+10, PIECES.wP);
        }
    } else if( (MFLAGCA & move) != 0) {
        switch(to) {
        	case SQUARES.C1: MovePiece(SQUARES.D1, SQUARES.A1); break;
            case SQUARES.C8: MovePiece(SQUARES.D8, SQUARES.A8); break;
            case SQUARES.G1: MovePiece(SQUARES.F1, SQUARES.H1); break;
            case SQUARES.G8: MovePiece(SQUARES.F8, SQUARES.H8); break;
            default: break;
        }
    }
    
    MovePiece(to, from);
    
    var captured = CAPTURED(move);

    if(captured != PIECES.EMPTY) {      
        AddPiece(to, captured);
    }else {
        console.log(captured);
    }
    
    if(PROMOTED(move) != PIECES.EMPTY)   {        
        ClearPiece(from);
        AddPiece(from, (PieceCol[PROMOTED(move)] == COLOURS.WHITE ? PIECES.wP : PIECES.bP));
    }
    
}


















































































