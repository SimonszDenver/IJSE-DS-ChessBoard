

function PickNextMove(MoveNum) {

	var index = 0;
	var bestScore = -1;
	var bestNum = MoveNum;
	
	for(index = MoveNum; index < ChessBoard.moveListStart[ChessBoard.ply+1]; ++index) {
		if(ChessBoard.moveScores[index] > bestScore) {
			bestScore = ChessBoard.moveScores[index];
			bestNum = index;			
		}
	} 
	
	if(bestNum != MoveNum) {
		var temp = 0;
		temp = ChessBoard.moveScores[MoveNum];
		ChessBoard.moveScores[MoveNum] = ChessBoard.moveScores[bestNum];
		ChessBoard.moveScores[bestNum] = temp;
		
		temp = ChessBoard.moveList[MoveNum];
		ChessBoard.moveList[MoveNum] = ChessBoard.moveList[bestNum];
		ChessBoard.moveList[bestNum] = temp;
	}

}

function ClearPvTable() {
	
	for(index = 0; index < PVENTRIES; index++) {
			ChessBoard.PvTable[index].move = NOMOVE;
			ChessBoard.PvTable[index].posKey = 0;		
	}
}

function CheckUp() {
	if (( $.now() - ChessBoardSearchController.start ) > ChessBoardSearchController.time) {
		ChessBoardSearchController.stop = BOOL.TRUE;
	}
}

function IsRepetition() {
	var index = 0;
	
	for(index = ChessBoard.hisPly - ChessBoard.fiftyMove; index < ChessBoard.hisPly - 1; ++index) {
		if(ChessBoard.posKey == ChessBoard.history[index].posKey) {
			return BOOL.TRUE;
		}
	}
	
	return BOOL.FALSE;
}

function Quiescence(alpha, beta) {

	if ((ChessBoardSearchController.nodes & 2047) == 0) {
		CheckUp();
	}
	
	ChessBoardSearchController.nodes++;
	
	if( (IsRepetition() || ChessBoard.fiftyMove >= 100) && ChessBoard.ply != 0) {
		return 0;
	}
	
	if(ChessBoard.ply > MAXDEPTH -1) {
		return EvalPosition();
	}	
	
	var Score = EvalPosition();
	
	if(Score >= beta) {
		return beta;
	}
	
	if(Score > alpha) {
		alpha = Score;
	}
	
	GenerateCaptures();
	
	var MoveNum = 0;
	var Legal = 0;
	var OldAlpha = alpha;
	var BestMove = NOMOVE;
	var Move = NOMOVE;	
	
	for(MoveNum = ChessBoard.moveListStart[ChessBoard.ply]; MoveNum < ChessBoard.moveListStart[ChessBoard.ply + 1]; ++MoveNum) {
	
		PickNextMove(MoveNum);
		
		Move = ChessBoard.moveList[MoveNum];	

		if(MakeMove(Move) == BOOL.FALSE) {
			continue;
		}		
		Legal++;
		Score = -Quiescence( -beta, -alpha);
		
		TakeMove();
		
		if(ChessBoardSearchController.stop == BOOL.TRUE) {
			return 0;
		}
		
		if(Score > alpha) {
			if(Score >= beta) {
				if(Legal == 1) {
					ChessBoardSearchController.fhf++;
				}
				ChessBoardSearchController.fh++;	
				return beta;
			}
			alpha = Score;
			BestMove = Move;
		}		
	}
	
	if(alpha != OldAlpha) {
		StorePvMove(BestMove);
	}
	
	return alpha;

}

function AlphaBeta(alpha, beta, depth) {

	
	if(depth <= 0) {
		return Quiescence(alpha, beta);
	}
	
	if ((ChessBoardSearchController.nodes & 2047) == 0) {
		CheckUp();
	}
	
	ChessBoardSearchController.nodes++;
	
	if( (IsRepetition() || ChessBoard.fiftyMove >= 100) && 	ChessBoard.ply != 0) {
		return 0;
	}
	
	if(ChessBoard.ply > MAXDEPTH -1) {
		return EvalPosition();
	}	
	
	var InCheck = SqAttacked(ChessBoard.pList[PCEINDEX(Kings[ChessBoard.side],0)], ChessBoard.side^1);
	if(InCheck == BOOL.TRUE)  {
		depth++;
	}	
	
	var Score = -INFINITE;
	
	GenerateMoves();
	
	var MoveNum = 0;
	var Legal = 0;
	var OldAlpha = alpha;
	var BestMove = NOMOVE;
	var Move = NOMOVE;	
	
	var PvMove = ProbePvTable();

	if(PvMove != NOMOVE) {
		for(MoveNum = ChessBoard.moveListStart[ChessBoard.ply]; MoveNum < ChessBoard.moveListStart[ChessBoard.ply + 1]; ++MoveNum) {
			if(ChessBoard.moveList[MoveNum] == PvMove) {
				ChessBoard.moveScores[MoveNum] = 2000000;
				break;
			}
		}
	}
	
	for(MoveNum = ChessBoard.moveListStart[ChessBoard.ply]; MoveNum < ChessBoard.moveListStart[ChessBoard.ply + 1]; ++MoveNum) {
	
		PickNextMove(MoveNum);	
		
		Move = ChessBoard.moveList[MoveNum];	
		
		if(MakeMove(Move) == BOOL.FALSE) {
			continue;
		}		
		Legal++;
		Score = -AlphaBeta( -beta, -alpha, depth-1);
		
		TakeMove();
		
		if(ChessBoardSearchController.stop == BOOL.TRUE) {
			return 0;
		}
		
		if(Score > alpha) {
			if(Score >= beta) {
				if(Legal == 1) {
					ChessBoardSearchController.fhf++;
				}
				ChessBoardSearchController.fh++;		
				if((Move & MFLAGCAP) == 0) {
					ChessBoard.searchKillers[MAXDEPTH + ChessBoard.ply] = 
						ChessBoard.searchKillers[ChessBoard.ply];
					ChessBoard.searchKillers[ChessBoard.ply] = Move;
				}					
				return beta;
			}
			if((Move & MFLAGCAP) == 0) {
				ChessBoard.searchHistory[ChessBoard.pieces[FROMSQ(Move)] * BOARD_SQUARE_NUM + TOSQ(Move)]
						 += depth * depth;
			}
			alpha = Score;
			BestMove = Move;				
		}		
	}	
	
	if(Legal == 0) {
		if(InCheck == BOOL.TRUE) {
			return -MATE + ChessBoard.ply;
		} else {
			return 0;
		}
	}	
	
	if(alpha != OldAlpha) {
		StorePvMove(BestMove);
	}
	
	return alpha;
}

function ClearForSearch() {

	var index = 0;
	var index2 = 0;
	
	for(index = 0; index < 14 * BOARD_SQUARE_NUM; ++index) {				
		ChessBoard.searchHistory[index] = 0;	
	}
	
	for(index = 0; index < 3 * MAXDEPTH; ++index) {
		ChessBoard.searchKillers[index] = 0;
	}	
	
	ClearPvTable();
	ChessBoard.ply = 0;
	ChessBoardSearchController.nodes = 0;
	ChessBoardSearchController.fh = 0;
	ChessBoardSearchController.fhf = 0;
	ChessBoardSearchController.start = $.now();
	ChessBoardSearchController.stop = BOOL.FALSE;
}

function SearchPosition() {

	var bestMove = NOMOVE;
	var bestScore = -INFINITE;
	var Score = -INFINITE;
	var currentDepth = 0;
	var line;
	var PvNum;
	var c;
	ClearForSearch();
	
	for( currentDepth = 1; currentDepth <= ChessBoardSearchController.depth; ++currentDepth) {	
	
		Score = AlphaBeta(-INFINITE, INFINITE, currentDepth);
					
		if(ChessBoardSearchController.stop == BOOL.TRUE) {
			break;
		}
		
		bestScore = Score; 
		bestMove = ProbePvTable();
		line = 'D:' + currentDepth + ' Best:' + PrMove(bestMove) + ' Score:' + bestScore + 
				' nodes:' + ChessBoardSearchController.nodes;
				
		PvNum = GetPvLine(currentDepth);
		line += ' Pv:';
		for( c = 0; c < PvNum; ++c) {
			line += ' ' + PrMove(ChessBoard.PvArray[c]);
		}
		if(currentDepth!=1) {
			line += (" Ordering:" + ((ChessBoardSearchController.fhf/ChessBoardSearchController.fh)*100).toFixed(2) + "%");
		}
		console.log(line);
						
	}
	ChessBoardSearchController.best = bestMove;
	ChessBoardSearchController.thinking = BOOL.FALSE;
}

