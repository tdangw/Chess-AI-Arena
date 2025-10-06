import React, { useState, useEffect } from 'react';
import { Player } from '../types';
import { CoinIcon } from './icons';

interface EndGameModalProps {
    winner: Player;
    onPlayAgain: () => void;
    onLeaveRoom: () => void;
    initialXP: number;
    xpGained: number;
    coinsGained: number;
}

const MAX_XP_PER_LEVEL = 100;

const EndGameModal: React.FC<EndGameModalProps> = ({ winner, onPlayAgain, onLeaveRoom, initialXP, xpGained, coinsGained }) => {
    const [countdown, setCountdown] = useState(10);
    const isPlayerWinner = winner === Player.Red;
    const [displayXP, setDisplayXP] = useState(initialXP);

    useEffect(() => {
        if (countdown <= 0) {
            onLeaveRoom();
            return;
        }
        const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
        return () => clearTimeout(timer);
    }, [countdown, onLeaveRoom]);

    useEffect(() => {
        if (xpGained <= 0) return;
        
        const targetXP = initialXP + xpGained;
        const duration = 1500; // ms
        let startTime: number | null = null;

        const animate = (currentTime: number) => {
            if (startTime === null) startTime = currentTime;
            const elapsedTime = currentTime - startTime;
            const progress = Math.min(elapsedTime / duration, 1);
            
            const animatedXP = Math.floor(initialXP + progress * xpGained);
            setDisplayXP(animatedXP);

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                setDisplayXP(targetXP);
            }
        };

        requestAnimationFrame(animate);

    }, [initialXP, xpGained]);

    const playerLevel = Math.floor(displayXP / MAX_XP_PER_LEVEL) + 1;
    const currentLevelXP = displayXP % MAX_XP_PER_LEVEL;
    const barWidth = (currentLevelXP / MAX_XP_PER_LEVEL) * 100;

    return (
        <div className="absolute inset-0 bg-black/70 flex items-start justify-center pt-16 z-50 font-sans">
            <div className="bg-[#1E293B] w-full max-w-sm rounded-2xl p-8 text-center text-white border-2 border-gray-700 shadow-lg animate-fade-in-up">
                <h1 className={`text-6xl font-extrabold mb-4 ${isPlayerWinner ? 'text-green-400' : 'text-red-500'}`}>
                    {isPlayerWinner ? 'YOU WIN!' : 'YOU LOSE!'}
                </h1>

                <div className="bg-slate-800/50 p-4 rounded-lg mb-6">
                    <p className="text-sm text-gray-400">Level {playerLevel}</p>
                    <div className="w-full bg-gray-900 rounded-full h-4 my-2 border border-gray-700 relative overflow-hidden">
                        <div 
                            className="absolute left-0 top-0 h-full bg-cyan-500 rounded-full"
                            style={{ width: `${barWidth}%`, transition: 'width 0.1s linear' }}
                        ></div>
                        <span className="absolute text-xs font-bold inset-0 flex items-center justify-center text-shadow">
                            {currentLevelXP} / {MAX_XP_PER_LEVEL} XP
                        </span>
                    </div>
                    <div className="flex justify-center mt-4">
                        <div className="flex flex-col items-center">
                            <p className="text-lg font-bold text-yellow-400">REWARDS</p>
                            <div className="flex items-center mt-1 space-x-4">
                                <span className="text-2xl font-bold flex items-center"><CoinIcon /> +{coinsGained}</span>
                                <span className="text-2xl font-bold text-cyan-400">✨ +{xpGained} XP</span>
                            </div>
                        </div>
                    </div>
                </div>

                <button 
                    onClick={onPlayAgain}
                    className="w-full bg-green-500 text-white py-3 rounded-lg font-bold text-lg hover:bg-green-400 transition-colors mb-4"
                >
                    Play again!
                </button>
                <button 
                    onClick={onLeaveRoom}
                    className="w-full bg-gray-700 text-gray-300 py-3 rounded-lg font-bold text-lg hover:bg-gray-600 transition-colors"
                >
                    Leave room ({countdown})
                </button>
            </div>
             <style>{`
                @keyframes fade-in-up {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-up {
                    animation: fade-in-up 0.5s ease-out forwards;
                }
             `}</style>
        </div>
    );
};

export default EndGameModal;