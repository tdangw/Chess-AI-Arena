
import React from 'react';
import { Piece as PieceType, Position, Player, Move } from '../types';
import Piece from './Piece';
import { BOARD_WIDTH, BOARD_HEIGHT } from '../constants';

interface BoardProps {
  pieces: PieceType[];
  selectedPiece: PieceType | null;
  validMoves: Position[];
  lastMove: Move | null;
  hintMove: Move | null;
  aiThinkingMove: Move | null;
  onSquareClick: (pos: Position) => void;
  onPieceDragStart: (piece: PieceType) => void;
  equippedSkin: string;
  equippedTheme: string;
  currentPlayer: Player;
}

const PalaceLine = ({ x1, y1, x2, y2, color }: { x1: number; y1: number; x2: number; y2: number, color: string }) => {
    const boardWidthUnits = BOARD_WIDTH - 1;
    const boardHeightUnits = BOARD_HEIGHT - 1;

    // Convert grid coordinates to percentages
    const left1 = (x1 / boardWidthUnits) * 100;
    const top1 = (y1 / boardHeightUnits) * 100;
    const left2 = (x2 / boardWidthUnits) * 100;
    const top2 = (y2 / boardHeightUnits) * 100;

    const dx_percent = left2 - left1;
    const dy_percent = top2 - top1;

    // Board aspect ratio is 8:9 (width:height)
    const aspectRatio = (boardWidthUnits) / (boardHeightUnits); // 8/9

    const length = Math.sqrt(Math.pow(dx_percent, 2) + Math.pow(dy_percent / aspectRatio, 2));
    const angle = Math.atan2(dy_percent / aspectRatio, dx_percent) * (180 / Math.PI);

    return (
        <div
            className={`absolute h-[1.5px] origin-top-left ${color}`}
            style={{
                left: `${left1}%`,
                top: `${top1}%`,
                width: `${length}%`,
                transform: `rotate(${angle}deg)`,
            }}
        />
    );
};

// Fix: Changed component to React.FC to correctly handle the 'key' prop in loops.
interface PositionMarkerProps {
    pos: Position;
    color: string;
}

const PositionMarker: React.FC<PositionMarkerProps> = ({ pos, color }) => {
    const baseClasses = `absolute ${color}`;
    const hLine = `w-3 h-[1.5px]`;
    const vLine = `w-[1.5px] h-3`;
    const gap = '0.2rem';

    const left = `calc(${(pos.x / (BOARD_WIDTH - 1)) * 100}%)`;
    const top = `calc(${(pos.y / (BOARD_HEIGHT - 1)) * 100}%)`;

    return (
        <>
            {/* Top-left */}
            {pos.x > 0 && <div className={`${baseClasses} ${hLine}`} style={{ top, left, transform: `translate(calc(-100% - ${gap}), -50%)` }} />}
            {pos.x > 0 && <div className={`${baseClasses} ${vLine}`} style={{ top, left, transform: `translate(-50%, calc(-100% - ${gap}))` }} />}
            {/* Top-right */}
            {pos.x < BOARD_WIDTH - 1 && <div className={`${baseClasses} ${hLine}`} style={{ top, left, transform: `translate(${gap}, -50%)` }} />}
            {pos.x < BOARD_WIDTH - 1 && <div className={`${baseClasses} ${vLine}`} style={{ top, left, transform: `translate(-50%, calc(-100% - ${gap}))` }} />}
            {/* Bottom-left */}
            {pos.x > 0 && <div className={`${baseClasses} ${hLine}`} style={{ top, left, transform: `translate(calc(-100% - ${gap}), -50%)` }} />}
            {pos.x > 0 && <div className={`${baseClasses} ${vLine}`} style={{ top, left, transform: `translate(-50%, ${gap})` }} />}
            {/* Bottom-right */}
            {pos.x < BOARD_WIDTH - 1 && <div className={`${baseClasses} ${hLine}`} style={{ top, left, transform: `translate(${gap}, -50%)` }} />}
            {pos.x < BOARD_WIDTH - 1 && <div className={`${baseClasses} ${vLine}`} style={{ top, left, transform: `translate(-50%, ${gap})` }} />}
        </>
    );
};


const Board: React.FC<BoardProps> = ({ pieces, selectedPiece, validMoves, lastMove, hintMove, aiThinkingMove, onSquareClick, onPieceDragStart, equippedSkin, equippedTheme, currentPlayer }) => {
    const isSummerTheme = equippedTheme === 'summer';
    const boardClasses = `relative w-full aspect-[8/9] border-4 shadow-2xl mx-auto ${isSummerTheme ? 'bg-amber-200 border-sky-700' : 'bg-[#F3D39C] border-[#B58863]'}`;
    const lineColor = isSummerTheme ? 'bg-sky-800/30' : 'bg-black/30';
    const riverTextClasses = `absolute top-1/2 left-0 right-0 -translate-y-1/2 flex justify-center items-center text-sm md:text-base font-serif select-none pointer-events-none font-bold tracking-widest ${isSummerTheme ? 'text-sky-600/60' : 'text-[#B58863]/60'}`;
    const MARKER_POSITIONS = [
        {x: 1, y: 2}, {x: 7, y: 2}, {x: 0, y: 3}, {x: 2, y: 3}, {x: 4, y: 3}, {x: 6, y: 3}, {x: 8, y: 3},
        {x: 1, y: 7}, {x: 7, y: 7}, {x: 0, y: 6}, {x: 2, y: 6}, {x: 4, y: 6}, {x: 6, y: 6}, {x: 8, y: 6}
    ];
    const ringOffsetColor = isSummerTheme ? 'ring-offset-amber-200' : 'ring-offset-[#F3D39C]';

    const renderGridLines = () => {
        const lines = [];
        // Vertical lines (split for river)
        for (let i = 1; i < BOARD_WIDTH - 1; i++) {
            lines.push(<div key={`v-${i}-t`} className={`absolute ${lineColor}`} style={{ left: `calc(${(i / (BOARD_WIDTH - 1)) * 100}%)`, top: 0, height: `calc(4 / 9 * 100%)`, width: '1px', transform: 'translateX(-0.5px)' }}></div>);
            lines.push(<div key={`v-${i}-b`} className={`absolute ${lineColor}`} style={{ left: `calc(${(i / (BOARD_WIDTH - 1)) * 100}%)`, bottom: 0, height: `calc(4 / 9 * 100%)`, width: '1px', transform: 'translateX(-0.5px)' }}></div>);
        }
        // Horizontal lines
        for (let i = 0; i < BOARD_HEIGHT; i++) {
            lines.push(<div key={`h-${i}`} className={`absolute ${lineColor}`} style={{ top: `calc(${(i / (BOARD_HEIGHT - 1)) * 100}%)`, left:0, right: 0, height: '1.5px', transform: 'translateY(-0.75px)' }}></div>);
        }
        // Full-height vertical borders
        lines.push(<div key="v-left" className={`absolute ${lineColor}`} style={{ left: 0, top: 0, bottom: 0, width: '2px' }}></div>);
        lines.push(<div key="v-right" className={`absolute ${lineColor}`} style={{ right: 0, top: 0, bottom: 0, width: '2px' }}></div>);

        return lines;
    };
      
    const renderClickableSquares = () => {
        const squares = [];
        for(let y = 0; y < BOARD_HEIGHT; y++) {
            for(let x=0; x < BOARD_WIDTH; x++) {
                const pos = { x, y };
                squares.push(
                    <div key={`${x}-${y}`} 
                         className="absolute" 
                         style={{
                            width: `calc(100% / ${BOARD_WIDTH - 1})`,
                            height: `calc(100% / ${BOARD_HEIGHT - 1})`,
                            left: `calc(${(pos.x / (BOARD_WIDTH - 1)) * 100}%)`,
                            top: `calc(${(pos.y / (BOARD_HEIGHT - 1)) * 100}%)`,
                            transform: 'translate(-50%, -50%)',
                         }}
                         onClick={() => onSquareClick(pos)}
                         onDragOver={(e) => {
                             const isDroppable = validMoves.some(m => m.x === pos.x && m.y === pos.y);
                             if (isDroppable) {
                                 e.preventDefault();
                             }
                         }}
                         onDrop={(e) => {
                             e.preventDefault();
                             onSquareClick(pos);
                         }}
                    >
                    </div>
                );
            }
        }
        return squares;
    }

    return (
        <div className={boardClasses}>
            <style>{`
                @keyframes red-glow-pulse {
                    50% {
                        border-color: #f87171; /* red-400 */
                        box-shadow: 0 0 20px rgba(239, 68, 68, 0.9);
                    }
                }
                .animate-red-glow-pulse {
                    animation: red-glow-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                }
                @keyframes thinking-pulse {
                    50% {
                        background-color: rgba(236, 72, 153, 0.5);
                    }
                }
                .animate-thinking-pulse {
                    animation: thinking-pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                }
            `}</style>
            {isSummerTheme && (
                <div className="absolute inset-0 overflow-hidden rounded-md pointer-events-none">
                    <div className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] bg-gradient-to-br from-yellow-200/30 via-transparent to-transparent animate-sun-shimmer"></div>
                </div>
            )}
            {renderGridLines()}
            <PalaceLine x1={3} y1={0} x2={5} y2={2} color={lineColor} />
            <PalaceLine x1={5} y1={0} x2={3} y2={2} color={lineColor} />
            <PalaceLine x1={3} y1={7} x2={5} y2={9} color={lineColor} />
            <PalaceLine x1={5} y1={7} x2={3} y2={9} color={lineColor} />
            
            {MARKER_POSITIONS.map((pos, i) => <PositionMarker key={`marker-${i}`} pos={pos} color={lineColor} />)}

            <div className={riverTextClasses}>
                 <div className="flex items-baseline justify-center space-x-2 whitespace-nowrap">
                    <span>CỜ TƯỚNG AI ARENA</span>
                    <span className="text-xs font-sans font-normal tracking-normal opacity-70">by tdangw</span>
                </div>
            </div>
          
            {renderClickableSquares()}

            {lastMove && (
                <div
                    className="absolute w-5 h-5 bg-amber-500/40 rounded-full transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                    style={{
                        left: `calc(${(lastMove.from.x / (BOARD_WIDTH - 1)) * 100}%)`,
                        top: `calc(${(lastMove.from.y / (BOARD_HEIGHT - 1)) * 100}%)`,
                    }}
                />
            )}

            {validMoves.map((pos, i) => {
                const isCapture = pieces.some(p => p.position.x === pos.x && p.position.y === pos.y);
                const style = {
                    left: `calc(${(pos.x / (BOARD_WIDTH - 1)) * 100}%)`,
                    top: `calc(${(pos.y / (BOARD_HEIGHT - 1)) * 100}%)`,
                };
                if (isCapture) {
                     return (
                        <div
                            key={`capture-${i}`}
                            className="absolute w-12 h-12 md:w-14 md:h-14 border-4 border-red-500 rounded-full transform -translate-x-1/2 -translate-y-1/2 pointer-events-none animate-red-glow-pulse"
                            style={{
                                ...style,
                                boxShadow: '0 0 15px rgba(239, 68, 68, 0.7)',
                            }}
                        />
                    );
                } else {
                    return (
                        <div
                            key={`valid-${i}`}
                            className="absolute w-5 h-5 bg-green-500/50 rounded-full transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                            style={style}
                        />
                    );
                }
            })}

            {hintMove && (
                <>
                    <div className={`absolute w-12 h-12 md:w-14 md:h-14 rounded-full transform -translate-x-1/2 -translate-y-1/2 pointer-events-none ring-4 ring-blue-500 ring-offset-4 ${ringOffsetColor} animate-pulse`}
                        style={{
                            left: `calc(${(hintMove.from.x / (BOARD_WIDTH - 1)) * 100}%)`,
                            top: `calc(${(hintMove.from.y / (BOARD_HEIGHT - 1)) * 100}%)`,
                        }}
                    />
                    <div className="absolute w-12 h-12 md:w-14 md:h-14 rounded-full transform -translate-x-1/2 -translate-y-1/2 pointer-events-none ring-4 ring-blue-500 animate-pulse"
                        style={{
                            left: `calc(${(hintMove.to.x / (BOARD_WIDTH - 1)) * 100}%)`,
                            top: `calc(${(hintMove.to.y / (BOARD_HEIGHT - 1)) * 100}%)`,
                        }}
                    />
                </>
            )}

            {aiThinkingMove && (
                 <>
                    <div className="absolute w-11 h-11 md:w-12 md:h-12 rounded-full transform -translate-x-1/2 -translate-y-1/2 pointer-events-none bg-pink-500/30 animate-thinking-pulse"
                        style={{
                            left: `calc(${(aiThinkingMove.from.x / (BOARD_WIDTH - 1)) * 100}%)`,
                            top: `calc(${(aiThinkingMove.from.y / (BOARD_HEIGHT - 1)) * 100}%)`,
                        }}
                    />
                    <div className="absolute w-11 h-11 md:w-12 md:h-12 rounded-full transform -translate-x-1/2 -translate-y-1/2 pointer-events-none bg-pink-500/30 animate-thinking-pulse"
                        style={{
                            left: `calc(${(aiThinkingMove.to.x / (BOARD_WIDTH - 1)) * 100}%)`,
                            top: `calc(${(aiThinkingMove.to.y / (BOARD_HEIGHT - 1)) * 100}%)`,
                        }}
                    />
                </>
            )}
          
            {pieces.map(piece => (
                <Piece
                    key={piece.id}
                    piece={piece}
                    isSelected={selectedPiece?.id === piece.id}
                    isLastMove={lastMove?.to.x === piece.position.x && lastMove?.to.y === piece.position.y}
                    onPieceClick={() => onSquareClick(piece.position)}
                    onPieceDragStart={() => onPieceDragStart(piece)}
                    equippedSkin={equippedSkin}
                    isDraggable={piece.player === currentPlayer && currentPlayer === Player.Red}
                    onDrop={(e) => {
                        e.preventDefault();
                        onSquareClick(piece.position);
                    }}
                    onDragOver={(e) => {
                        const isDroppable = validMoves.some(m => m.x === piece.position.x && m.y === piece.position.y);
                        // Can only drop on opponent pieces
                        if (isDroppable && piece.player !== currentPlayer) {
                            e.preventDefault();
                        }
                    }}
                />
            ))}
        </div>
    );
};

export default Board;
