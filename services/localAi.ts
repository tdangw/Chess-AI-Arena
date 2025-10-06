// @ts-ignore
import { Piece, Player, Position, Move, PieceType } from '../types';
import { EMOJI_ITEMS } from '../constants';

const workerCode = `
    const Player = { Red: 'Red', Black: 'Black' };
    const PieceType = { General: 'General', Advisor: 'Advisor', Elephant: 'Elephant', Horse: 'Horse', Chariot: 'Chariot', Cannon: 'Cannon', Soldier: 'Soldier' };
    const BOARD_WIDTH = 9;
    const BOARD_HEIGHT = 10;
    const PIECE_VALUES = {
      [PieceType.General]: 10000,
      [PieceType.Chariot]: 90,
      [PieceType.Horse]: 40,
      [PieceType.Cannon]: 45,
      [PieceType.Advisor]: 20,
      [PieceType.Elephant]: 20,
      [PieceType.Soldier]: 10,
    };

    // --- Start of duplicated game logic functions ---
    const isSamePosition = (pos1, pos2) => pos1.x === pos2.x && pos1.y === pos2.y;
    const getPieceAt = (pieces, pos) => pieces.find(p => isSamePosition(p.position, pos));
    const isInPalace = (pos, player) => {
        if (pos.x < 3 || pos.x > 5) return false;
        if (player === Player.Red) return pos.y >= 7 && pos.y <= 9;
        return pos.y >= 0 && pos.y <= 2;
    };
    const isInBounds = (pos) => pos.x >= 0 && pos.x < BOARD_WIDTH && pos.y >= 0 && pos.y < BOARD_HEIGHT;
    const hasCrossedRiver = (pos, player) => player === Player.Red ? pos.y < 5 : pos.y > 4;
    const getPiecesBetween = (pieces, from, to) => {
        const intervening = [];
        if (from.x === to.x) {
            const minY = Math.min(from.y, to.y);
            const maxY = Math.max(from.y, to.y);
            for (let y = minY + 1; y < maxY; y++) {
                const piece = getPieceAt(pieces, { x: from.x, y });
                if (piece) intervening.push(piece);
            }
        } else if (from.y === to.y) {
            const minX = Math.min(from.x, to.x);
            const maxX = Math.max(from.x, to.x);
            for (let x = minX + 1; x < maxX; x++) {
                const piece = getPieceAt(pieces, { x, y: from.y });
                if (piece) intervening.push(piece);
            }
        }
        return intervening;
    };
    const isValidMoveForPiece = (pieces, piece, to) => {
        const { type, player, position: from } = piece;
        const dx = Math.abs(from.x - to.x);
        const dy = Math.abs(from.y - to.y);
        const targetPiece = getPieceAt(pieces, to);
        if (targetPiece && targetPiece.player === player) return false;
        if (!isInBounds(to)) return false;
        switch (type) {
            case PieceType.General: return isInPalace(to, player) && (dx + dy === 1);
            case PieceType.Advisor: return isInPalace(to, player) && dx === 1 && dy === 1;
            case PieceType.Elephant:
                if (player === Player.Red ? to.y < 5 : to.y > 4) return false;
                if (dx === 2 && dy === 2) {
                    const eye = { x: (from.x + to.x) / 2, y: (from.y + to.y) / 2 };
                    return !getPieceAt(pieces, eye);
                }
                return false;
            case PieceType.Horse:
                if (!((dx === 1 && dy === 2) || (dx === 2 && dy === 1))) return false;
                const hobblePos = { x: from.x, y: from.y };
                if (dx === 2) hobblePos.x += (to.x - from.x) / 2;
                else hobblePos.y += (to.y - from.y) / 2;
                return !getPieceAt(pieces, hobblePos);
            case PieceType.Chariot:
                if (dx > 0 && dy > 0) return false;
                return getPiecesBetween(pieces, from, to).length === 0;
            case PieceType.Cannon:
                if (dx > 0 && dy > 0) return false;
                const screen = getPiecesBetween(pieces, from, to);
                if (targetPiece) return screen.length === 1;
                return screen.length === 0;
            case PieceType.Soldier:
                if (player === Player.Red) {
                    if (hasCrossedRiver(from, player)) return (from.y - to.y === 1 && dx === 0) || (dy === 0 && dx === 1);
                    return from.y - to.y === 1 && dx === 0;
                } else {
                    if (hasCrossedRiver(from, player)) return (to.y - from.y === 1 && dx === 0) || (dy === 0 && dx === 1);
                    return to.y - from.y === 1 && dx === 0;
                }
            default: return false;
        }
    };
    const isCheck = (pieces, player) => {
        const playerGeneral = pieces.find(p => p.type === PieceType.General && p.player === player);
        if (!playerGeneral) return false;
        const opponent = player === Player.Red ? Player.Black : Player.Red;
        const opponentPieces = pieces.filter(p => p.player === opponent);
        for (const piece of opponentPieces) {
            if (isValidMoveForPiece(pieces, piece, playerGeneral.position)) return true;
        }
        const opponentGeneral = pieces.find(p => p.type === PieceType.General && p.player === opponent);
        if (opponentGeneral && playerGeneral.position.x === opponentGeneral.position.x) {
            if (getPiecesBetween(pieces, playerGeneral.position, opponentGeneral.position).length === 0) return true;
        }
        return false;
    };
     const getValidMoves = (pieces, selectedPiece) => {
        const validMoves = [];
        for (let y = 0; y < BOARD_HEIGHT; y++) {
            for (let x = 0; x < BOARD_WIDTH; x++) {
                const to = { x, y };
                if (isValidMoveForPiece(pieces, selectedPiece, to)) {
                    const tempPieces = pieces.filter(p => p.id !== selectedPiece.id && (!getPieceAt(pieces, to) || getPieceAt(pieces, to)?.id !== p.id));
                    tempPieces.push({ ...selectedPiece, position: to });
                    if (!isCheck(tempPieces, selectedPiece.player)) {
                        validMoves.push(to);
                    }
                }
            }
        }
        return validMoves;
    };
    // --- End of duplicated game logic functions ---

    const getPositionalValue = (piece) => {
        if (piece.type === PieceType.Soldier) {
            if (piece.player === Player.Red) {
                if (piece.position.y < 5) return 10;
                if (piece.position.x >= 3 && piece.position.x <= 5) return 5;
            } else {
                if (piece.position.y > 4) return 10;
                if (piece.position.x >= 3 && piece.position.x <= 5) return 5;
            }
        }
        return 0;
    };
    const evaluateBoard = (pieces, player) => {
        let score = 0;
        for (const piece of pieces) {
            const value = PIECE_VALUES[piece.type] + getPositionalValue(piece);
            score += (piece.player === player ? value : -value);
        }
        return score;
    };
    const boardToStateString = (pieces) => {
        return pieces.slice().sort((a, b) => a.id - b.id).map(p => \`\${p.id}@\${p.position.x},\${p.position.y}\`).join(';');
    };
    const minimax = (pieces, depth, alpha, beta, maximizingPlayer, isMaximizing) => {
        if (depth === 0) return evaluateBoard(pieces, maximizingPlayer);
        
        const currentPlayer = isMaximizing ? maximizingPlayer : (maximizingPlayer === Player.Red ? Player.Black : Player.Red);
        const playerPieces = pieces.filter(p => p.player === currentPlayer);
        let bestValue = isMaximizing ? -Infinity : Infinity;
        
        const allMoves = [];
        for (const piece of playerPieces) {
            getValidMoves(pieces, piece).forEach(move => allMoves.push({ from: piece.position, to: move }));
        }

        if (allMoves.length === 0) return isCheck(pieces, currentPlayer) ? (isMaximizing ? -100000 : 100000) : 0;

        for (const move of allMoves) {
            const pieceToMove = pieces.find(p => p.position.x === move.from.x && p.position.y === move.from.y);
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
            if (beta <= alpha) break;
        }
        return bestValue;
    };

    self.onmessage = (e) => {
        const { pieces, aiPlayer, moveHistory, difficulty } = e.data;
        const aiPieces = pieces.filter(p => p.player === aiPlayer);
        let bestMove = null;
        let bestValue = -Infinity;
        let bestMovePutsPlayerInCheck = false;
        
        const depth = difficulty === 'easy' ? 1 : difficulty === 'medium' ? 2 : 3;

        const allValidMoves = [];
        for (const piece of aiPieces) {
            getValidMoves(pieces, piece).forEach(move => allValidMoves.push({ piece, move }));
        }
        
        allValidMoves.sort(() => Math.random() - 0.5);

        const currentEval = evaluateBoard(pieces, aiPlayer);
        const opponentPlayer = aiPlayer === Player.Red ? Player.Black : Player.Red;
        const previousStates = new Set(moveHistory.map(boardToStateString));

        for (const { piece, move } of allValidMoves) {
            const targetPiece = pieces.find(p => p.position.x === move.x && p.position.y === move.y);
            let tempPieces = pieces.filter(p => p.id !== targetPiece?.id);
            tempPieces = tempPieces.map(p => p.id === piece.id ? { ...p, position: move } : p);
            let boardValue = minimax(tempPieces, depth, -Infinity, Infinity, aiPlayer, false);
            
            if (previousStates.has(boardToStateString(tempPieces))) boardValue -= 500;
            
            const putsPlayerInCheck = isCheck(tempPieces, opponentPlayer);
            if (putsPlayerInCheck && currentEval > 20) boardValue += 50;

            if (boardValue > bestValue) {
                bestValue = boardValue;
                bestMove = { from: piece.position, to: move };
                bestMovePutsPlayerInCheck = putsPlayerInCheck;
                self.postMessage({ type: 'progress', move: bestMove });
            }
        }

        if (!bestMove && allValidMoves.length > 0) {
            const randomMove = allValidMoves[0];
            bestMove = { from: randomMove.piece.position, to: randomMove.move };
        }

        if (bestMove) {
            const randomEmojiChar = EMOJI_ITEMS[Math.floor(Math.random() * EMOJI_ITEMS.length)].char;
            const emoji = bestMovePutsPlayerInCheck ? '🔥' : (Math.random() > 0.8 ? randomEmojiChar : undefined);
            self.postMessage({ type: 'result', data: { move: bestMove, emoji } });
        } else {
             self.postMessage({ type: 'result', data: null });
        }
    };
`;

let aiWorker: Worker | null = null;

export const getLocalAIMove = async (
  pieces: Piece[],
  aiPlayer: Player,
  moveHistory: Piece[][],
  difficulty: 'easy' | 'medium' | 'hard',
  onProgress: (move: Move) => void
): Promise<{ move: Move; emoji?: string } | null> => {
  if (aiWorker) {
    aiWorker.terminate();
  }

  const workerScript = `const EMOJI_ITEMS = ${JSON.stringify(
    EMOJI_ITEMS
  )};\n${workerCode}`;
  const workerBlob = new Blob([workerScript], {
    type: 'application/javascript',
  });
  aiWorker = new Worker(URL.createObjectURL(workerBlob));

  return new Promise((resolve, reject) => {
    if (!aiWorker) {
      reject(new Error('Worker could not be created.'));
      return;
    }

    aiWorker.onmessage = (e) => {
      if (e.data.type === 'progress') {
        onProgress(e.data.move);
      } else if (e.data.type === 'result') {
        if (aiWorker) aiWorker.terminate();
        aiWorker = null;
        resolve(e.data.data);
      }
    };

    aiWorker.onerror = (e) => {
      console.error('AI Worker Error:', e);
      if (aiWorker) aiWorker.terminate();
      aiWorker = null;
      reject(e);
    };

    aiWorker.postMessage({ pieces, aiPlayer, moveHistory, difficulty });
  });
};
