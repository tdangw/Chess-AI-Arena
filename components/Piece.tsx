
import React from 'react';
import { Piece as PieceType, Player, PieceType as PieceEnum } from '../types';
import { PIECE_UNICODE } from '../constants';
import { 
    WesternKingIcon, WesternAdvisorIcon, WesternElephantIcon, WesternHorseIcon, 
    WesternChariotIcon, WesternCannonIcon, WesternSoldierIcon 
} from './icons';

interface PieceProps {
  piece: PieceType;
  isSelected: boolean;
  isLastMove: boolean;
  onPieceClick: () => void;
  onPieceDragStart: () => void;
  equippedSkin: string;
  isDraggable: boolean;
  onDrop?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
}

const WesternIcon: React.FC<{type: PieceEnum}> = ({ type }) => {
    switch (type) {
        case PieceEnum.General: return <WesternKingIcon />;
        case PieceEnum.Advisor: return <WesternAdvisorIcon />;
        case PieceEnum.Elephant: return <WesternElephantIcon />;
        case PieceEnum.Horse: return <WesternHorseIcon />;
        case PieceEnum.Chariot: return <WesternChariotIcon />;
        case PieceEnum.Cannon: return <WesternCannonIcon />;
        case PieceEnum.Soldier: return <WesternSoldierIcon />;
        default: return null;
    }
};

const Piece: React.FC<PieceProps> = ({ piece, isSelected, isLastMove, onPieceClick, onPieceDragStart, equippedSkin, isDraggable, onDrop, onDragOver }) => {
  const pieceChar = PIECE_UNICODE[piece.player][piece.type];
  const isRed = piece.player === Player.Red;

  const baseClasses = `absolute w-11 h-11 md:w-12 md:h-12 flex items-center justify-center 
                       font-bold text-xl md:text-2xl transform -translate-x-1/2 -translate-y-1/2
                       transition-all duration-300 ease-in-out rounded-full`;
  
  const cursorClass = isDraggable ? 'cursor-grab' : 'cursor-pointer';
  const selectedClass = isSelected ? 'ring-4 ring-blue-500' : '';
  const lastMoveClass = isLastMove ? 'shadow-[0_0_20px_8px_#F59E0B] ring-2 ring-amber-400' : '';
  
  let skinClasses = '';
  let textClasses = 'relative z-10';
  let textStyles: React.CSSProperties = { textShadow: '1px 1px 3px rgba(0,0,0,0.7)' };

  switch (equippedSkin) {
    case 'western':
        skinClasses = `border-2 ${isRed ? 'bg-red-700 border-red-900' : 'bg-gray-800 border-black'} shadow-lg`;
        break;

    case 'classic':
      skinClasses = `border-4 border-black ${isRed ? 'bg-red-700' : 'bg-gray-800'}`;
      textClasses += ' text-white';
      break;
    
    case 'neon':
      skinClasses = `bg-black border-2 ${isRed ? 'border-pink-500 shadow-[0_0_10px_2px_#EC4899]' : 'border-cyan-500 shadow-[0_0_10px_2px_#06B6D4]'}`;
      textClasses += ` ${isRed ? 'text-pink-400' : 'text-cyan-400'}`;
      textStyles = { textShadow: `0 0 8px ${isRed ? '#EC4899' : '#06B6D4'}` };
      break;

    case 'inkwash':
      skinClasses = `border-2 border-stone-400 shadow-md ${isRed ? 'bg-amber-50' : 'bg-stone-200'}`;
      textClasses += ` text-black font-serif`;
      textStyles = { textShadow: '0px 0px 1px rgba(0,0,0,0.5)' };
      break;

    case 'default':
    default:
      const pieceBg = isRed ? 'bg-gradient-to-b from-red-500 to-red-800' : 'bg-gradient-to-b from-gray-700 to-gray-900';
      const pieceBorder = isRed ? 'border-red-900' : 'border-black';
      const pieceShadow = 'shadow-[0_3px_6px_rgba(0,0,0,0.4),inset_0_3px_3px_rgba(255,255,255,0.2)]';
      skinClasses = `border-2 ${pieceBg} ${pieceBorder} ${pieceShadow}`;
      textClasses += ' text-white';
      break;
  }

  return (
    <button
      onClick={onPieceClick}
      draggable={isDraggable}
      onDragStart={onPieceDragStart}
      onDrop={onDrop}
      onDragOver={onDragOver}
      className={`${baseClasses} ${skinClasses} ${selectedClass} ${lastMoveClass} ${cursorClass}`}
      style={{
        left: `calc(${(piece.position.x / 8) * 100}%)`,
        top: `calc(${(piece.position.y / 9) * 100}%)`,
      }}
    >
      {equippedSkin === 'western' 
        ? <WesternIcon type={piece.type} />
        : <span className={textClasses} style={textStyles}>{pieceChar}</span>
      }
    </button>
  );
};

export default Piece;
