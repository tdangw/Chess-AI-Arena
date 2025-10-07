import React from 'react';
import { CloseIcon } from './icons';
import { audioService } from '../services/audioService';
import { MUSIC_TRACKS } from '../constants';

interface SettingsModalProps {
    context: 'game' | 'menu';
    soundEnabled: boolean;
    onToggleSound: () => void;
    musicEnabled: boolean;
    onToggleMusic: () => void;
    selectedTrack: string;
    onSelectTrack: (trackSrc: string) => void;
    soundVolume: number;
    onSetSoundVolume: (volume: number) => void;
    musicVolume: number;
    onSetMusicVolume: (volume: number) => void;
    gameDuration: number;
    onSetGameDuration: (duration: number) => void;
    turnDuration: number;
    onSetTurnDuration: (duration: number) => void;
    onClose: () => void;
    onGoToShop: () => void;
    onGoToInventory: () => void;
}


const SettingsModal: React.FC<SettingsModalProps> = ({ 
    context, 
    soundEnabled, onToggleSound, 
    musicEnabled, onToggleMusic, 
    selectedTrack, onSelectTrack, 
    soundVolume, onSetSoundVolume,
    musicVolume, onSetMusicVolume,
    gameDuration, onSetGameDuration,
    turnDuration, onSetTurnDuration,
    onClose, onGoToShop, onGoToInventory 
}) => {
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

    const renderSelect = (id: string, label: string, value: string | number, onChange: (val: any) => void, options: {label: string, value: string | number}[]) => (
        <div>
            <label htmlFor={id} className="font-semibold text-sm mb-1 block">{label}</label>
            <div className="relative">
                <select
                    id={id}
                    value={value}
                    onChange={(e) => {
                        audioService.playClickSound();
                        onChange(e.target.value);
                    }}
                    onClick={() => audioService.playClickSound()}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg p-2 appearance-none focus:outline-none focus:ring-2 focus:ring-cyan-500 text-xs"
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
             <style>{`
                .range-thumb::-webkit-slider-thumb {
                  -webkit-appearance: none;
                  appearance: none;
                  width: 20px;
                  height: 20px;
                  background: #22d3ee; /* cyan-400 */
                  border-radius: 50%;
                  cursor: pointer;
                }
                .range-thumb::-moz-range-thumb {
                  width: 20px;
                  height: 20px;
                  background: #22d3ee;
                  border-radius: 50%;
                  cursor: pointer;
                }
             `}</style>
            <div className="bg-[#1E293B] w-full max-w-sm rounded-2xl p-6 text-white border-2 border-gray-700 shadow-lg relative animate-fade-in-up">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
                    <CloseIcon />
                </button>
                <h2 className="text-3xl font-bold mb-6 text-center text-cyan-400">Settings</h2>

                <div className="space-y-5">
                    <div>
                        <label htmlFor="sound-volume" className="font-semibold text-lg mb-2 block">Sound</label>
                        <div className="flex items-center gap-4">
                            <input
                                id="sound-volume"
                                type="range"
                                min="0"
                                max="1"
                                step="0.05"
                                value={soundVolume}
                                onChange={(e) => onSetSoundVolume(Number(e.target.value))}
                                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer range-thumb flex-grow"
                            />
                            <button onClick={onToggleSound} className={`text-sm font-bold w-16 text-center border-2 rounded-md py-1 transition-colors ${soundEnabled ? 'bg-cyan-500 text-black border-cyan-500' : 'text-gray-400 border-slate-600'}`}>
                                {soundEnabled ? 'ON' : 'OFF'}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label htmlFor="music-volume" className="font-semibold text-lg mb-2 block">Music</label>
                        <div className="flex items-center gap-4">
                             <input
                                id="music-volume"
                                type="range"
                                min="0"
                                max="1"
                                step="0.05"
                                value={musicVolume}
                                onChange={(e) => onSetMusicVolume(Number(e.target.value))}
                                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer range-thumb flex-grow"
                            />
                            <button onClick={onToggleMusic} className={`text-sm font-bold w-16 text-center border-2 rounded-md py-1 transition-colors ${musicEnabled ? 'bg-cyan-500 text-black border-cyan-500' : 'text-gray-400 border-slate-600'}`}>
                                {musicEnabled ? 'ON' : 'OFF'}
                            </button>
                        </div>
                    </div>
                    
                    <div className="pt-2">
                       {renderSelect('music-select', 'Select Music', selectedTrack, (val) => onSelectTrack(val), MUSIC_TRACKS.map(track => ({label: track.name, value: track.src})))}
                    </div>
                    {context === 'menu' && (
                         <div className="pt-2 grid grid-cols-2 gap-4">
                            {renderSelect('duration-select', 'Game Time', gameDuration, (v) => onSetGameDuration(Number(v)), gameDurations)}
                            {renderSelect('turn-duration-select', 'Turn Time', turnDuration, (v) => onSetTurnDuration(Number(v)), turnDurations)}
                        </div>
                    )}
                </div>

                {context === 'game' && (
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
                )}

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