
import { Piece, Player, PieceType, Position } from '../types';
import { BOARD_WIDTH, BOARD_HEIGHT } from '../constants';

const isSamePosition = (pos1: Position, pos2: Position): boolean => {
    return pos1.x === pos2.x && pos1.y === pos2.y;
}

const getPieceAt = (pieces: Piece[], pos: Position): Piece | undefined => {
    return pieces.find(p => isSamePosition(p.position, pos));
}

const isInPalace = (pos: Position, player: Player): boolean => {
    if (pos.x < 3 || pos.x > 5) return false;
    if (player === Player.Red) {
        return pos.y >= 7 && pos.y <= 9;
    } else {
        return pos.y >= 0 && pos.y <= 2;
    }
}

const isInBounds = (pos: Position): boolean => {
    return pos.x >= 0 && pos.x < BOARD_WIDTH && pos.y >= 0 && pos.y < BOARD_HEIGHT;
}

const hasCrossedRiver = (pos: Position, player: Player): boolean => {
    return player === Player.Red ? pos.y < 5 : pos.y > 4;
}

const getPiecesBetween = (pieces: Piece[], from: Position, to: Position): Piece[] => {
    const intervening: Piece[] = [];
    if (from.x === to.x) { // Vertical
        const minY = Math.min(from.y, to.y);
        const maxY = Math.max(from.y, to.y);
        for (let y = minY + 1; y < maxY; y++) {
            const piece = getPieceAt(pieces, { x: from.x, y });
            if (piece) intervening.push(piece);
        }
    } else if (from.y === to.y) { // Horizontal
        const minX = Math.min(from.x, to.x);
        const maxX = Math.max(from.x, to.x);
        for (let x = minX + 1; x < maxX; x++) {
            const piece = getPieceAt(pieces, { x, y: from.y });
            if (piece) intervening.push(piece);
        }
    }
    return intervening;
}

const isValidMoveForPiece = (pieces: Piece[], piece: Piece, to: Position): boolean => {
    const { type, player, position: from } = piece;
    const dx = Math.abs(from.x - to.x);
    const dy = Math.abs(from.y - to.y);
    const targetPiece = getPieceAt(pieces, to);

    if (targetPiece && targetPiece.player === player) return false;
    if (!isInBounds(to)) return false;

    switch (type) {
        case PieceType.General:
            return isInPalace(to, player) && (dx + dy === 1);
        case PieceType.Advisor:
            return isInPalace(to, player) && dx === 1 && dy === 1;
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
            if (targetPiece) { // Capturing
                return screen.length === 1;
            } else { // Moving
                return screen.length === 0;
            }
        case PieceType.Soldier:
            if (player === Player.Red) {
                if (hasCrossedRiver(from, player)) {
                    return (from.y - to.y === 1 && dx === 0) || (dy === 0 && dx === 1);
                } else {
                    return from.y - to.y === 1 && dx === 0;
                }
            } else { // Black
                if (hasCrossedRiver(from, player)) {
                    return (to.y - from.y === 1 && dx === 0) || (dy === 0 && dx === 1);
                } else {
                    return to.y - from.y === 1 && dx === 0;
                }
            }
        default:
            return false;
    }
}

export const getValidMoves = (pieces: Piece[], selectedPiece: Piece): Position[] => {
    const validMoves: Position[] = [];
    for (let y = 0; y < BOARD_HEIGHT; y++) {
        for (let x = 0; x < BOARD_WIDTH; x++) {
            const to = { x, y };
            if (isValidMoveForPiece(pieces, selectedPiece, to)) {
                // Simulate move to check for check
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


export const isCheck = (pieces: Piece[], player: Player): boolean => {
    const playerGeneral = pieces.find(p => p.type === PieceType.General && p.player === player);
    if (!playerGeneral) return false;
    const opponent = player === Player.Red ? Player.Black : Player.Red;
    const opponentPieces = pieces.filter(p => p.player === opponent);

    for (const piece of opponentPieces) {
        if (isValidMoveForPiece(pieces, piece, playerGeneral.position)) {
            return true;
        }
    }
    // Flying General rule
    const opponentGeneral = pieces.find(p => p.type === PieceType.General && p.player === opponent);
    if(opponentGeneral && playerGeneral.position.x === opponentGeneral.position.x){
        if(getPiecesBetween(pieces, playerGeneral.position, opponentGeneral.position).length === 0){
            return true;
        }
    }
    return false;
};

export const isCheckmate = (pieces: Piece[], player: Player): boolean => {
    if (!isCheck(pieces, player)) return false;
    const playerPieces = pieces.filter(p => p.player === player);
    for (const piece of playerPieces) {
        const moves = getValidMoves(pieces, piece);
        if (moves.length > 0) return false;
    }
    return true;
};