
import React from 'react';
import { CloseIcon } from './icons';
import { audioService } from '../services/audioService';

interface SettingsModalProps {
    context: 'game' | 'menu';
    soundEnabled: boolean;
    onToggleSound: () => void;
    musicEnabled: boolean;
    onToggleMusic: () => void;
    selectedTrack: string;
    onSelectTrack: (track: string) => void;
    gameDuration: number;
    onSetGameDuration: (duration: number) => void;
    turnDuration: number;
    onSetTurnDuration: (duration: number) => void;
    onClose: () => void;
    onResign: () => void;
    onGoToShop: () => void;
    onGoToInventory: () => void;
}


const SettingsModal: React.FC<SettingsModalProps> = ({ 
    context, 
    soundEnabled, onToggleSound, 
    musicEnabled, onToggleMusic, 
    selectedTrack, onSelectTrack, 
    gameDuration, onSetGameDuration,
    turnDuration, onSetTurnDuration,
    onClose, onResign, onGoToShop, onGoToInventory 
}) => {
    const musicTracks = ['Celestial', 'Battle Drums', 'Peaceful Garden', 'Synthwave Beats'];
    const gameDurations = [
        { label: '10 Min', value: 600 },
        { label: '15 Min', value: 900 },
        { label: '30 Min', value: 1800 },
        { label: '45 Min', value: 2700 },
    ];
    const turnDurations = [
        { label: '1 Min', value: 60 },
        { label: '3 Min', value: 180 },
        { label: '5 Min', value: 300 },
    ];

    const renderSelect = (id: string, label: string, value: number, onChange: (val: number) => void, options: {label: string, value: number}[]) => (
        <div>
            <label htmlFor={id} className="font-semibold text-base mb-2 block">{label}</label>
            <div className="relative">
                <select
                    id={id}
                    value={value}
                    onChange={(e) => {
                        audioService.playClickSound();
                        onChange(Number(e.target.value));
                    }}
                    onClick={() => audioService.playClickSound()}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 appearance-none focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
                >
                    {options.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
            </div>
        </div>
    );

    return (
        <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-50 font-sans">
            <div className="bg-[#1E293B] w-full max-w-sm rounded-2xl p-6 text-white border-2 border-gray-700 shadow-lg relative animate-fade-in-up">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
                    <CloseIcon />
                </button>
                <h2 className="text-3xl font-bold mb-6 text-center text-cyan-400">Settings</h2>

                <div className="space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-700 pb-4">
                        <span className="font-semibold text-lg">Sound</span>
                        <button onClick={onToggleSound} className="text-lg font-bold text-cyan-400 w-16 text-center">
                            {soundEnabled ? 'ON' : 'OFF'}
                        </button>
                    </div>
                    <div className="flex justify-between items-center border-b border-slate-700 pb-4">
                        <span className="font-semibold text-lg">Music</span>
                        <button onClick={onToggleMusic} className="text-lg font-bold text-cyan-400 w-16 text-center">
                            {musicEnabled ? 'ON' : 'OFF'}
                        </button>
                    </div>
                    
                    <div className="pt-2">
                       {renderSelect('music-select', 'Select Music', 0, (val) => onSelectTrack(musicTracks[val]), musicTracks.map((track, i) => ({label: track, value: i})))}
                    </div>
                    {context === 'menu' && (
                         <div className="pt-2 grid grid-cols-2 gap-4">
                            {renderSelect('duration-select', 'Game Time', gameDuration, onSetGameDuration, gameDurations)}
                            {renderSelect('turn-duration-select', 'Turn Time', turnDuration, onSetTurnDuration, turnDurations)}
                        </div>
                    )}
                </div>

                {context === 'game' ? (
                    <>
                        <div className="mt-8 grid grid-cols-2 gap-4">
                            <button
                                onClick={onGoToShop}
                                className="w-full bg-purple-600 text-white py-3 rounded-lg font-bold text-base hover:bg-purple-500 transition-colors"
                            >
                                Shop
                            </button>
                            <button
                                onClick={onGoToInventory}
                                className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold text-base hover:bg-indigo-500 transition-colors"
                            >
                                Inventory
                            </button>
                        </div>
                        <button
                            onClick={onResign}
                            className="w-full mt-4 bg-red-600 text-white py-3 rounded-lg font-bold text-base hover:bg-red-500 transition-colors"
                        >
                            Resign Game
                        </button>
                    </>
                ) : null}

                <button
                    onClick={onClose}
                    className="w-full mt-6 bg-slate-700 text-slate-200 py-3 rounded-lg font-bold text-base hover:bg-slate-600 transition-colors"
                >
                    Close
                </button>
            </div>
             <style>{`
                @keyframes fade-in-up {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-up {
                    animation: fade-in-up 0.3s ease-out forwards;
                }
             `}</style>
        </div>
    );
};

export default SettingsModal;