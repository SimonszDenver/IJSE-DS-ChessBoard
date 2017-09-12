
function PCEINDEX(pce, pceNum) {
	return (pce * 10 + pceNum);
}


function PrintBoard() {
	
	var sq,file,rank,piece;

	console.log("\nGame Board:\n");
	for(rank = RANKS.RANK_8; rank >= RANKS.RANK_1; rank--) {
		var line =(RankChar[rank] + "  ");
		for(file = FILES.FILE_A; file <= FILES.FILE_H; file++) {
			sq = FR2SQ(file,rank);
			piece = ChessBoard.pieces[sq];
			line += (" " + PceChar[piece] + " ");
		}

	}
	
	console.log("");
	var line = "   ";
	for(file = FILES.FILE_A; file <= FILES.FILE_H; file++) {
		line += (' ' + FileChar[file] + ' ');	
	}
	
	console.log(line);
	console.log("side:" + SideChar[ChessBoard.side] );
	console.log("enPas:" + ChessBoard.enPas);
	line = "";	
	
	if(ChessBoard.castlePerm & CASTLEBIT.WKCA) line += 'K';
	if(ChessBoard.castlePerm & CASTLEBIT.WQCA) line += 'Q';
	if(ChessBoard.castlePerm & CASTLEBIT.BKCA) line += 'k';
	if(ChessBoard.castlePerm & CASTLEBIT.BQCA) line += 'q';
	console.log("castle:" + line);
	console.log("key:" + ChessBoard.posKey.toString(16));
}

function GeneratePosKey() {

	var sq = 0;
	var finalKey = 0;
	var piece = PIECES.EMPTY;

	for(sq = 0; sq < BOARD_SQUARE_NUM; ++sq) {
		piece = ChessBoard.pieces[sq];
		if(piece != PIECES.EMPTY && piece != SQUARES.OFFBOARD) {			
			finalKey ^= PieceKeys[(piece * 120) + sq];
		}		
	}

	if(ChessBoard.side == COLOURS.WHITE) {
		finalKey ^= SideKey;
	}
	
	if(ChessBoard.enPas != SQUARES.NO_SQ) {		
		finalKey ^= PieceKeys[ChessBoard.enPas];
	}
	
	finalKey ^= CastleKeys[ChessBoard.castlePerm];
	
	return finalKey;

}


function UpdateListsMaterial() {	
	
	var piece,sq,index,colour;
	
	for(index = 0; index < 14 * 120; ++index) {
		ChessBoard.pList[index] = PIECES.EMPTY;
	}
	
	for(index = 0; index < 2; ++index) {		
		ChessBoard.material[index] = 0;		
	}	
	
	for(index = 0; index < 13; ++index) {
		ChessBoard.pceNum[index] = 0;
	}
	
	for(index = 0; index < 64; ++index) {
		sq = SQ120(index);
		piece = ChessBoard.pieces[sq];
		if(piece != PIECES.EMPTY) {
			
			colour = PieceCol[piece];		
			
			ChessBoard.material[colour] += PieceVal[piece];
			
			ChessBoard.pList[PCEINDEX(piece,ChessBoard.pceNum[piece])] = sq;
			ChessBoard.pceNum[piece]++;			
		}
	}
	
}

function ResetBoard() {
	
	var index = 0;
	
	for(index = 0; index < BOARD_SQUARE_NUM; ++index) {
		ChessBoard.pieces[index] = SQUARES.OFFBOARD;
	}
	
	for(index = 0; index < 64; ++index) {
		ChessBoard.pieces[SQ120(index)] = PIECES.EMPTY;
	}
	
	ChessBoard.side = COLOURS.BOTH;
	ChessBoard.enPas = SQUARES.NO_SQ;
	ChessBoard.fiftyMove = 0;	
	ChessBoard.ply = 0;
	ChessBoard.hisPly = 0;	
	ChessBoard.castlePerm = 0;	
	ChessBoard.posKey = 0;
	ChessBoard.moveListStart[ChessBoard.ply] = 0;
	
}


function ParseFen(fen) {

	ResetBoard();

	var rank = RANKS.RANK_8;
    var file = FILES.FILE_A;
    var piece = 0;
    var count = 0;
    var i = 0;
	var sq120 = 0;
	var fenCnt = 0; // fen[fenCnt]

	while ((rank >= RANKS.RANK_1) && fenCnt < fen.length) {
	    count = 1;
		switch (fen[fenCnt]) {
			case 'p': piece = PIECES.bP; break;
            case 'r': piece = PIECES.bR; break;
            case 'n': piece = PIECES.bN; break;
            case 'b': piece = PIECES.bB; break;
            case 'k': piece = PIECES.bK; break;
            case 'q': piece = PIECES.bQ; break;
            case 'P': piece = PIECES.wP; break;
            case 'R': piece = PIECES.wR; break;
            case 'N': piece = PIECES.wN; break;
            case 'B': piece = PIECES.wB; break;
            case 'K': piece = PIECES.wK; break;
            case 'Q': piece = PIECES.wQ; break;

            case '1':
            case '2':
            case '3':
            case '4':
            case '5':
            case '6':
            case '7':
            case '8':
                piece = PIECES.EMPTY;
                count = fen[fenCnt].charCodeAt() - '0'.charCodeAt();
                break;

            case '/':
            case ' ':
                rank--;
                file = FILES.FILE_A;
                fenCnt++;
                continue;
            default:
                console.log("FEN error");
                return;

		}

		for (i = 0; i < count; i++) {
			sq120 = FR2SQ(file,rank);
            ChessBoard.pieces[sq120] = piece;
			file++;
        }
		fenCnt++;
	} // while loop end

	ChessBoard.side = (fen[fenCnt] == 'w') ? COLOURS.WHITE : COLOURS.BLACK;
	fenCnt += 2;

	for (i = 0; i < 4; i++) {
        if (fen[fenCnt] == ' ') {
            break;
        }
		switch(fen[fenCnt]) {
			case 'K': ChessBoard.castlePerm |= CASTLEBIT.WKCA; break;
			case 'Q': ChessBoard.castlePerm |= CASTLEBIT.WQCA; break;
			case 'k': ChessBoard.castlePerm |= CASTLEBIT.BKCA; break;
			case 'q': ChessBoard.castlePerm |= CASTLEBIT.BQCA; break;
			default:	     break;
        }
		fenCnt++;
	}
	fenCnt++;

	if (fen[fenCnt] != '-') {
		file = fen[fenCnt].charCodeAt() - 'a'.charCodeAt();
		rank = fen[fenCnt + 1].charCodeAt() - '1'.charCodeAt();
		console.log("fen[fenCnt]:" + fen[fenCnt] + " File:" + file + " Rank:" + rank);
		ChessBoard.enPas = FR2SQ(file,rank);
    }

	ChessBoard.posKey = GeneratePosKey();
	UpdateListsMaterial();
}


function SqAttacked(sq, side) {
	var pce;
	var t_sq;
	var index;
	
	if(side == COLOURS.WHITE) {
		if(ChessBoard.pieces[sq - 11] == PIECES.wP || ChessBoard.pieces[sq - 9] == PIECES.wP) {
			return BOOL.TRUE;
		}
	} else {
		if(ChessBoard.pieces[sq + 11] == PIECES.bP || ChessBoard.pieces[sq + 9] == PIECES.bP) {
			return BOOL.TRUE;
		}	
	}
	
	for(index = 0; index < 8; index++) {
		pce = ChessBoard.pieces[sq + KnDir[index]];
		if(pce != SQUARES.OFFBOARD && PieceCol[pce] == side && PieceKnight[pce] == BOOL.TRUE) {
			return BOOL.TRUE;
		}
	}
	
	for(index = 0; index < 4; ++index) {		
		dir = RkDir[index];
		t_sq = sq + dir;
		pce = ChessBoard.pieces[t_sq];
		while(pce != SQUARES.OFFBOARD) {
			if(pce != PIECES.EMPTY) {
				if(PieceRookQueen[pce] == BOOL.TRUE && PieceCol[pce] == side) {
					return BOOL.TRUE;
				}
				break;
			}
			t_sq += dir;
			pce = ChessBoard.pieces[t_sq];
		}
	}
	
	for(index = 0; index < 4; ++index) {		
		dir = BiDir[index];
		t_sq = sq + dir;
		pce = ChessBoard.pieces[t_sq];
		while(pce != SQUARES.OFFBOARD) {
			if(pce != PIECES.EMPTY) {
				if(PieceBishopQueen[pce] == BOOL.TRUE && PieceCol[pce] == side) {
					return BOOL.TRUE;
				}
				break;
			}
			t_sq += dir;
			pce = ChessBoard.pieces[t_sq];
		}
	}
	
	for(index = 0; index < 8; index++) {
		pce = ChessBoard.pieces[sq + KiDir[index]];
		if(pce != SQUARES.OFFBOARD && PieceCol[pce] == side && PieceKing[pce] == BOOL.TRUE) {
			return BOOL.TRUE;
		}
	}
	
	return BOOL.FALSE;

}


