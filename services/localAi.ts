import { Piece, Player, Position, Move, PieceType } from '../types';
import { getValidMoves, isCheck } from './gameLogic';
import { EMOJI_ITEMS } from '../constants';

const PIECE_VALUES: Record<PieceType, number> = {
  [PieceType.General]: 10000,
  [PieceType.Chariot]: 90,
  [PieceType.Horse]: 40,
  [PieceType.Cannon]: 45,
  [PieceType.Advisor]: 20,
  [PieceType.Elephant]: 20,
  [PieceType.Soldier]: 10,
};

// Simplified positional scoring for soldiers
const getPositionalValue = (piece: Piece): number => {
    if (piece.type === PieceType.Soldier) {
        if (piece.player === Player.Red) {
            // Reward soldiers for crossing the river
            if (piece.position.y < 5) return 10;
            // Reward soldiers on central files
            if (piece.position.x >= 3 && piece.position.x <= 5) return 5;
        } else { // Black player
            if (piece.position.y > 4) return 10;
            if (piece.position.x >= 3 && piece.position.x <= 5) return 5;
        }
    }
    return 0;
};


const evaluateBoard = (pieces: Piece[], player: Player): number => {
    let score = 0;
    for (const piece of pieces) {
        const value = PIECE_VALUES[piece.type] + getPositionalValue(piece);
        if (piece.player === player) {
            score += value;
        } else {
            score -= value;
        }
    }
    return score;
};

// Helper to create a unique string representation of the board state
const boardToStateString = (pieces: Piece[]): string => {
    return pieces
        .slice()
        .sort((a, b) => a.id - b.id)
        .map(p => `${p.id}@${p.position.x},${p.position.y}`)
        .join(';');
};

const minimax = (
    pieces: Piece[],
    depth: number,
    alpha: number,
    beta: number,
    maximizingPlayer: Player,
    isMaximizing: boolean
): number => {
    if (depth === 0) {
        return evaluateBoard(pieces, maximizingPlayer);
    }
    
    const currentPlayer = isMaximizing ? maximizingPlayer : (maximizingPlayer === Player.Red ? Player.Black : Player.Red);
    const playerPieces = pieces.filter(p => p.player === currentPlayer);
    let bestValue = isMaximizing ? -Infinity : Infinity;

    // Generate all possible moves for the current player
    const allMoves: { from: Position; to: Position }[] = [];
    for (const piece of playerPieces) {
        const validMoves = getValidMoves(pieces, piece);
        for (const move of validMoves) {
            allMoves.push({ from: piece.position, to: move });
        }
    }

    if (allMoves.length === 0) {
        // Checkmate or stalemate
        return isCheck(pieces, currentPlayer) ? (isMaximizing ? -100000 : 100000) : 0;
    }

    for (const move of allMoves) {
        // Simulate the move
        const pieceToMove = pieces.find(p => p.position.x === move.from.x && p.position.y === move.from.y)!;
        const targetPiece = pieces.find(p => p.position.x === move.to.x && p.position.y === move.to.y);
        
        let tempPieces = pieces.filter(p => p.id !== targetPiece?.id);
        tempPieces = tempPieces.map(p => p.id === pieceToMove.id ? { ...p, position: move.to } : p);

        const value = minimax(tempPieces, depth - 1, alpha, beta, maximizingPlayer, !isMaximizing);
        
        if (isMaximizing) {
            bestValue = Math.max(bestValue, value);
            alpha = Math.max(alpha, bestValue);
        } else {
            bestValue = Math.min(bestValue, value);
            beta = Math.min(beta, bestValue);
        }
        
        if (beta <= alpha) {
            break; // Alpha-beta pruning
        }
    }
    
    return bestValue;
};


export const getLocalAIMove = (pieces: Piece[], aiPlayer: Player, moveHistory: Piece[][]): { move: Move; emoji?: string } | null => {
    const aiPieces = pieces.filter(p => p.player === aiPlayer);
    let bestMove: Move | null = null;
    let bestValue = -Infinity;
    let bestMovePutsPlayerInCheck = false;
    const depth = 2; // Depth of 2 is reasonable for web performance

    const allValidMoves: { piece: Piece; move: Position }[] = [];
    for (const piece of aiPieces) {
        const moves = getValidMoves(pieces, piece);
        moves.forEach(move => allValidMoves.push({ piece, move }));
    }
    
    // Shuffle moves to add variability in case of equal scores
    allValidMoves.sort(() => Math.random() - 0.5);

    const currentEval = evaluateBoard(pieces, aiPlayer);
    const opponentPlayer = aiPlayer === Player.Red ? Player.Black : Player.Red;

    // Create a set of previous states from move history to detect loops
    const previousStates = new Set(moveHistory.map(boardToStateString));

    for (const { piece, move } of allValidMoves) {
        // Simulate the move
        const targetPiece = pieces.find(p => p.position.x === move.x && p.position.y === move.y);
        let tempPieces = pieces.filter(p => p.id !== targetPiece?.id);
        tempPieces = tempPieces.map(p => p.id === piece.id ? { ...p, position: move } : p);

        let boardValue = minimax(tempPieces, depth, -Infinity, Infinity, aiPlayer, false);
        
        // Anti-loop logic
        const newStateString = boardToStateString(tempPieces);
        if (previousStates.has(newStateString)) {
            boardValue -= 500; // Heavy penalty for repeating a move
        }
        
        const putsPlayerInCheck = isCheck(tempPieces, opponentPlayer);
        
        // Killer instinct: prioritize checks when ahead
        if (putsPlayerInCheck && currentEval > 20) {
            boardValue += 50; // Add a significant bonus for a checking move when winning
        }

        if (boardValue > bestValue) {
            bestValue = boardValue;
            bestMove = { from: piece.position, to: move };
            bestMovePutsPlayerInCheck = putsPlayerInCheck;
        }
    }

    if (!bestMove && allValidMoves.length > 0) {
        // Fallback to a random move if the AI fails to find a best move
        const randomMove = allValidMoves[0];
        return { move: { from: randomMove.piece.position, to: randomMove.move } };
    }

    if (bestMove) {
        const randomEmojiChar = EMOJI_ITEMS[Math.floor(Math.random() * EMOJI_ITEMS.length)].char;
        const emoji = bestMovePutsPlayerInCheck ? '🔥' : (Math.random() > 0.8 ? randomEmojiChar : undefined);
        return { move: bestMove, emoji };
    }

    return null;
};
