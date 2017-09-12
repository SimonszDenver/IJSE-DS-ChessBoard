var ChessBoard = {};

ChessBoard.pieces = new Array(BOARD_SQUARE_NUM);
ChessBoard.side = COLOURS.WHITE;
ChessBoard.fiftyMove = 0;
ChessBoard.hisPly = 0;
ChessBoard.history = [];
ChessBoard.ply = 0;
ChessBoard.enPas = 0;
ChessBoard.castlePerm = 0;
ChessBoard.material = new Array(2);
ChessBoard.pceNum = new Array(13);
ChessBoard.pList = new Array(14 * 10);
ChessBoard.posKey = 0;
ChessBoard.moveList = new Array(MAXDEPTH * MAXPOSITIONMOVES);
ChessBoard.moveScores = new Array(MAXDEPTH * MAXPOSITIONMOVES);
ChessBoard.moveListStart = new Array(MAXDEPTH);
ChessBoard.PvTable = [];
ChessBoard.PvArray = new Array(MAXDEPTH);
ChessBoard.searchHistory = new Array( 14 * BOARD_SQUARE_NUM);
ChessBoard.searchKillers = new Array(3 * MAXDEPTH);


var ChessBoardSearchController = {};

ChessBoardSearchController.nodes;
ChessBoardSearchController.fh;
ChessBoardSearchController.fhf;
ChessBoardSearchController.depth;
ChessBoardSearchController.time;
ChessBoardSearchController.start;
ChessBoardSearchController.stop;
ChessBoardSearchController.best;
ChessBoardSearchController.thinking;


var GameController = {};
GameController.EngineSide = COLOURS.BOTH;
GameController.PlayerSide = COLOURS.BOTH;
GameController.GameOver = BOOL.FALSE;

var UserMove = {};
UserMove.from = SQUARES.NO_SQ;
UserMove.to = SQUARES.NO_SQ;
