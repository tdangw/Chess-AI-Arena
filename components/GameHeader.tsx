
import React, { useState } from 'react';
import { Player, AIOpponent } from '../types';
import { SettingsIcon, UndoIcon, EmojiIcon, HintIcon, ResignIcon } from './icons';
import { TURN_DURATION_SECONDS } from '../constants';
import EmojiPicker from './EmojiPicker';

interface GameHeaderProps {
    playerName: string;
    playerAvatarUrl: string;
    currentPlayer: Player;
    winner: Player | null;
    gameTimer: number;
    turnTimer: number;
    turnDuration: number;
    wins: number;
    losses: number;
    onUndo: () => void;
    onOpenSettings: () => void;
    onSelectEmoji: (emoji: string) => void;
    ownedEmojis: string[];
    onHint: () => void;
    onResign: () => void;
    opponent: AIOpponent | null;
}

const GameHeader: React.FC<GameHeaderProps> = ({ 
    playerName, playerAvatarUrl, currentPlayer, winner, gameTimer, turnTimer, turnDuration,
    wins, losses, onUndo, onOpenSettings, onSelectEmoji, ownedEmojis, onHint, onResign, opponent
}) => {
    const [isPickerVisible, setIsPickerVisible] = useState(false);
    
    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    };
    
    const getTimerColor = (currentTime: number) => {
        const percentage = (currentTime / turnDuration) * 100;
        if (percentage < 30) return 'bg-red-500';
        if (percentage < 70) return 'bg-yellow-500';
        return 'bg-green-500';
    }

    const handleEmojiSelect = (emoji: string) => {
        onSelectEmoji(emoji);
        setIsPickerVisible(false);
    }

    const timerIndicatorStyle = { width: `${(turnTimer/turnDuration)*100}%`};
    const playerGlow = currentPlayer === Player.Red && !winner ? 'shadow-[0_0_15px_3px_#38bdf8] animate-pulse' : '';
    const aiGlow = currentPlayer === Player.Black && !winner ? 'shadow-[0_0_15px_3px_#f472b6] animate-pulse' : '';

    const opponentName = opponent?.name || 'Meow';
    const opponentLevel = opponent?.level || 1;
    const opponentAvatarUrl = opponent?.avatarUrl || 'https://i.pravatar.cc/150?u=ai_meow';

    return (
        <div class="w-full max-w-sm md:max-w-md text-white font-sans z-20">
            <div class="relative flex justify-center items-center mb-2 sm:mb-4 space-x-2 sm:space-x-4 md:space-x-6">
                <button onClick={onOpenSettings} class="text-gray-400 hover:text-white" title="Settings"><SettingsIcon /></button>
                <button onClick={onUndo} class="text-gray-400 hover:text-white" title="Undo"><UndoIcon /></button>
                <button onClick={onHint} class="text-gray-400 hover:text-white" title="Hint"><HintIcon /></button>
                <div class="relative">
                    <button onClick={() => setIsPickerVisible(p => !p)} class="text-gray-400 hover:text-white" title="Emoji"><EmojiIcon /></button>
                     {isPickerVisible && <EmojiPicker onSelect={handleEmojiSelect} ownedEmojis={ownedEmojis} />}
                </div>
                <button onClick={onResign} class="text-gray-400 hover:text-white" title="Resign"><ResignIcon /></button>
            </div>
            <div class="flex flex-col justify-between items-center bg-[#1E293B]/80 p-2 sm:p-3 rounded-lg relative overflow-hidden">
                <div class="w-full flex justify-between items-center">
                    {/* Player 1 Info */}
                    <div class="flex items-center space-x-2 z-10">
                        <img src={playerAvatarUrl} alt="Player 1" class={`w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-blue-400 transition-all duration-300 ${playerGlow}`} />
                        <div>
                            <p class="font-bold text-[11px] sm:text-xs">{playerName}</p>
                            <p class="text-[10px] sm:text-[11px] text-gray-400">Lv. 1</p>
                        </div>
                    </div>
                    
                    {/* Score & Timer */}
                    <div class="text-center z-10">
                        <p class="text-xs sm:text-sm">{`Win ${wins} - Lose ${losses}`}</p>
                        <p class="text-xl sm:text-2xl font-bold">{formatTime(gameTimer)}</p>
                    </div>

                    {/* Player 2 Info */}
                    <div class="flex items-center space-x-2 z-10">
                         <div>
                            <p class="font-bold text-[11px] sm:text-xs text-right">{opponentName}</p>
                            <p class="text-[10px] sm:text-[11px] text-gray-400 text-right">Lv. {opponentLevel} AI</p>
                        </div>
                        <img src={opponentAvatarUrl} alt="Player 2" class={`w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-pink-400 transition-all duration-300 ${aiGlow}`} />
                    </div>
                </div>
                 {/* Progress Bar */}
                <div class="absolute bottom-0 left-0 w-full h-[3px] bg-black/30">
                    <div class={`${getTimerColor(turnTimer)} h-full transition-all duration-500`} style={timerIndicatorStyle}></div>
                </div>
            </div>
        </div>
    );
};

export default GameHeader;