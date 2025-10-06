
import React, { useState, useEffect } from 'react';
import { CoinIcon, PencilIcon, ShopIcon, InventoryIcon, SettingsIcon, GlobeIcon } from './icons';
import { Skin, PieceType as PieceEnum } from '../types';
import { SHOP_ITEMS } from '../constants';
import { audioService } from '../services/audioService';

interface MenuProps {
  playerName: string;
  onSetName: (name: string) => void;
  onStartGame: (difficulty: 'easy' | 'medium' | 'hard') => void;
  onGoToShop: () => void;
  onGoToInventory: () => void;
  onOpenSettings: () => void;
  playerAvatarUrl: string;
  playerXP: number;
  playerCoins: number;
  wins: number;
  losses: number;
}

const MAX_XP_PER_LEVEL = 100;

const FeaturedItemPreview: React.FC<{ skin: Skin }> = ({ skin }) => {
    let skinClasses = 'w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ease-in-out relative';
    let textClasses = 'relative z-10 text-4xl';
    let textStyles: React.CSSProperties = { textShadow: '1px 1px 3px rgba(0,0,0,0.7)' };

    switch (skin.id) {
        case 'classic':
            skinClasses += ` border-4 border-black bg-red-700`;
            textClasses += ' text-white';
            break;
        case 'neon':
            skinClasses += ` bg-black border-2 border-pink-500 shadow-[0_0_10px_2px_#EC4899]`;
            textClasses += ` text-pink-400`;
            textStyles = { textShadow: `0 0 8px #EC4899` };
            break;
        case 'inkwash':
            skinClasses += ` bg-amber-50 border-2 border-stone-400 shadow-md`;
            textClasses += ` text-black font-serif`;
            textStyles = { textShadow: '0px 0px 1px rgba(0,0,0,0.5)' };
            break;
        default:
            skinClasses += ` border-2 bg-gradient-to-b from-red-500 to-red-800 border-red-900 shadow-[0_3px_6px_rgba(0,0,0,0.4),inset_0_3px_3px_rgba(255,255,255,0.2)]`;
            textClasses += ' text-white';
            break;
    }

    return (
        <div class="flex flex-col items-center">
            <div class={skinClasses}>
                <span class={textClasses} style={textStyles}>帥</span>
            </div>
            <p class="mt-2 text-gray-300 text-xs">Board Skin</p>
        </div>
    );
};


const Menu: React.FC<MenuProps> = ({ 
    playerName, onSetName, onStartGame, onGoToShop, onGoToInventory, onOpenSettings, 
    playerAvatarUrl, playerXP, playerCoins, wins, losses 
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(playerName);
  const [featuredItem, setFeaturedItem] = useState<Skin | null>(null);

  useEffect(() => {
    if (SHOP_ITEMS.length > 0) {
        const randomItem = SHOP_ITEMS[Math.floor(Math.random() * SHOP_ITEMS.length)];
        setFeaturedItem(randomItem);
    }
  }, []);

  const playerLevel = Math.floor(playerXP / MAX_XP_PER_LEVEL) + 1;
  const currentLevelXP = playerXP % MAX_XP_PER_LEVEL;
  const xpBarWidth = `${currentLevelXP}%`;
  const totalGames = wins + losses;

  const handleNameSave = () => {
    if (nameInput.trim()) {
        onSetName(nameInput.trim());
    } else {
        setNameInput(playerName);
    }
    setIsEditingName(false);
  };

  return (
    <div class="min-h-screen bg-[#0F172A] text-white flex flex-col items-center justify-center p-2 sm:p-4 font-sans">
        <div class="w-full max-w-5xl mx-auto space-y-3 md:space-y-4">
            <div class="text-center">
                <h1 class="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-cyan-400">
                    Chess AI Arena
                </h1>
                <p class="text-gray-400 mt-1 text-xs">Five in a row. Infinite possibilities.</p>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                {/* Player Profile */}
                <div class="bg-slate-800/50 border border-slate-700 rounded-xl p-3 flex flex-col space-y-2.5 h-full shadow-lg">
                    <div class="flex items-center space-x-3">
                         <img src={playerAvatarUrl} alt="Player Avatar" class="w-12 h-12 rounded-full border-2 border-slate-600" />
                         <div class="flex-grow">
                             {isEditingName ? (
                                <input 
                                    type="text" 
                                    value={nameInput}
                                    onChange={(e) => setNameInput(e.target.value)}
                                    onBlur={handleNameSave}
                                    onKeyDown={(e) => e.key === 'Enter' && handleNameSave()}
                                    class="bg-slate-700 text-white rounded px-2 py-1 w-full text-sm font-bold"
                                    autoFocus
                                />
                            ) : (
                                <h2 onClick={() => { audioService.playClickSound(); setIsEditingName(true);}} class="text-sm md:text-base font-bold flex items-center cursor-pointer">{playerName} <span class="text-cyan-400 ml-1.5"><PencilIcon/></span></h2>
                            )}
                             <p class="text-xs font-semibold text-cyan-400">Level {playerLevel}</p>
                             <div class="flex items-center mt-0.5">
                                <CoinIcon />
                                <span class="ml-1.5 font-bold text-yellow-400 text-xs">{playerCoins}</span>
                            </div>
                         </div>
                    </div>
                    <div class="flex-grow">
                        <div class="flex justify-between items-center text-[10px] text-gray-400 mb-1">
                            <span>XP</span>
                            <span>{currentLevelXP} / {MAX_XP_PER_LEVEL}</span>
                        </div>
                        <div class="w-full bg-slate-900 rounded-full h-1.5 border border-slate-700">
                            <div class="bg-cyan-500 h-full rounded-full" style={{width: xpBarWidth}}></div>
                        </div>
                    </div>
                    <div class="grid grid-cols-3 text-center bg-slate-900/50 p-1 rounded-md">
                        <div>
                            <p class="text-base md:text-lg font-bold text-green-400">{wins}</p>
                            <p class="text-[9px] text-gray-400">WINS</p>
                        </div>
                        <div>
                            <p class="text-base md:text-lg font-bold text-red-400">{losses}</p>
                            <p class="text-[9px] text-gray-400">LOSSES</p>
                        </div>
                        <div>
                            <p class="text-base md:text-lg font-bold">{totalGames}</p>
                            <p class="text-[9px] text-gray-400">TOTAL</p>
                        </div>
                    </div>
                </div>
                
                {/* Featured Item */}
                <div class="bg-slate-800/50 border border-slate-700 rounded-xl p-3 flex flex-col justify-between items-center text-center shadow-lg h-full">
                    <span class="text-[10px] font-bold text-gray-400 tracking-widest">FEATURED ITEM</span>
                    {featuredItem ? (
                        <>
                            <div class="my-2 flex-grow flex flex-col items-center justify-center">
                                <p class="text-xl md:text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-400">{featuredItem.name}</p>
                                <p class="text-gray-400 text-[10px] mb-2">Limited Edition Board Skin</p>
                                <FeaturedItemPreview skin={featuredItem} />
                            </div>
                            <button onClick={onGoToShop} class="bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-1 px-4 rounded-md transition-colors shadow-md text-xs">
                                Go to Shop
                            </button>
                        </>
                    ) : (
                        <div class="my-2 text-gray-400">No items in shop.</div>
                    )}
                </div>

                {/* Action Buttons */}
                <div class="grid grid-cols-2 grid-rows-2 gap-3 md:gap-4 h-full">
                    <button onClick={onGoToShop} class="bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex flex-col items-center justify-center space-y-1 font-bold text-sm hover:from-purple-500 transition-all duration-300 transform hover:scale-105 shadow-lg"><ShopIcon /><span>Shop</span></button>
                    <button onClick={onGoToInventory} class="bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl flex flex-col items-center justify-center space-y-1 font-bold text-sm hover:from-teal-400 transition-all duration-300 transform hover:scale-105 shadow-lg"><InventoryIcon /><span>Inventory</span></button>
                    <button onClick={onOpenSettings} class="bg-slate-700 rounded-xl flex flex-col items-center justify-center space-y-1 font-semibold text-sm hover:bg-slate-600 transition-colors shadow-lg"><SettingsIcon /><span>Settings</span></button>
                    <button class="bg-slate-700 rounded-xl flex flex-col items-center justify-center space-y-1 font-semibold cursor-not-allowed opacity-50 shadow-lg text-sm"><GlobeIcon /><span>Play Online</span></button>
                </div>
            </div>

            <div>
                <h2 class="text-lg md:text-xl font-bold mb-3 text-center mt-3 md:mt-4">Choose Your Opponent</h2>
                <div class="w-full grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                    <div class="bg-[#1E293B] p-3 rounded-xl flex flex-col items-center text-center border border-gray-700 transform hover:scale-105 hover:border-cyan-400 transition-all duration-300">
                        <img src="https://i.pravatar.cc/150?u=ai_meow" alt="Meow" class="w-14 h-14 rounded-full mb-2 border-2 border-cyan-400" />
                        <h3 class="text-base md:text-lg font-bold">Meow</h3>
                        <p class="text-gray-400 mt-1 mb-3 h-12 text-xs">A cute little cat new to the game. Perfect for those who don't like challenges.</p>
                        <button onClick={() => onStartGame('easy')} class="w-full bg-cyan-500 text-black py-1.5 rounded-lg font-bold text-sm hover:bg-cyan-400 transition-colors">Challenge</button>
                    </div>
                    <div class="bg-[#1E293B] p-3 rounded-xl flex flex-col items-center text-center border border-gray-700 transform hover:scale-105 hover:border-purple-400 transition-all duration-300">
                        <img src="https://i.pravatar.cc/150?u=ai_nova" alt="Nova" class="w-14 h-14 rounded-full mb-2 border-2 border-purple-400" />
                        <h3 class="text-base md:text-lg font-bold">Nova</h3>
                        <p class="text-gray-400 mt-1 mb-3 h-12 text-xs">A beautiful girl who is a master of strategy. Promises an intellectual date.</p>
                        <button onClick={() => onStartGame('medium')} class="w-full bg-cyan-500 text-black py-1.5 rounded-lg font-bold text-sm hover:bg-cyan-400 transition-colors">Challenge</button>
                    </div>
                    <div class="bg-[#1E293B] p-3 rounded-xl flex flex-col items-center text-center border border-gray-700 transform hover:scale-105 hover:border-red-400 transition-all duration-300">
                        <img src="https://i.pravatar.cc/150?u=ai_kael" alt="Kael" class="w-14 h-14 rounded-full mb-2 border-2 border-red-400" />
                        <h3 class="text-base md:text-lg font-bold">Kael</h3>
                        <p class="text-gray-400 mt-1 mb-3 h-12 text-xs">A young hacker, thinks carefully before acting, defeat is inevitable.</p>
                        <button onClick={() => onStartGame('hard')} class="w-full bg-cyan-500 text-black py-1.5 rounded-lg font-bold text-sm hover:bg-cyan-400 transition-colors">Challenge</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default Menu;