function GetPvLine(depth) {
	
	var move = ProbePvTable();
	var count = 0;
	
	while(move != NOMOVE && count < depth) {
	
		if( MoveExists(move) == BOOL.TRUE) {
			MakeMove(move);
			ChessBoard.PvArray[count++] = move;			
		} else {
			break;
		}		
		move = ProbePvTable();	
	}
	
	while(ChessBoard.ply > 0) {
		TakeMove();
	}
	
	return count;
	
}

function ProbePvTable() {
	var index = ChessBoard.posKey % PVENTRIES;
	
	if(ChessBoard.PvTable[index].posKey == ChessBoard.posKey) {
		return ChessBoard.PvTable[index].move;
	}
	
	return NOMOVE;
}

function StorePvMove(move) {
	var index = ChessBoard.posKey % PVENTRIES;
	ChessBoard.PvTable[index].posKey = ChessBoard.posKey;
	ChessBoard.PvTable[index].move = move;
}