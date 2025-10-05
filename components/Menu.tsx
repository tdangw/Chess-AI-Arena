
import React, { useState, useEffect } from 'react';
import { CoinIcon, PencilIcon, ShopIcon, InventoryIcon, SettingsIcon, GlobeIcon } from './icons';
import { Skin } from '../types';
import { SHOP_ITEMS } from '../constants';

interface MenuProps {
  playerName: string;
  onSetName: (name: string) => void;
  onStartGame: () => void;
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

const Menu: React.FC<MenuProps> = ({ 
    playerName, onSetName, onStartGame, onGoToShop, onGoToInventory, onOpenSettings, 
    playerAvatarUrl, playerXP, playerCoins, wins, losses 
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(playerName);
  const [featuredItem, setFeaturedItem] = useState<Skin | null>(null);

  useEffect(() => {
    // Select a random item from the shop to feature
    if (SHOP_ITEMS.length > 0) {
        const featured = SHOP_ITEMS[Math.floor(Math.random() * SHOP_ITEMS.length)];
        setFeaturedItem(featured);
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
    <div className="min-h-screen bg-[#0F172A] text-white flex flex-col items-center justify-center p-4 font-sans">
        <div className="w-full max-w-5xl mx-auto space-y-4 md:space-y-6">
            <div className="text-center">
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-cyan-400">
                    Chess AI Arena
                </h1>
                <p className="text-gray-400 mt-1 text-xs md:text-sm">Five in a row. Infinite possibilities.</p>
            </div>
            
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 md:gap-6">
                {/* Player Profile */}
                <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-3 sm:p-4 flex flex-col space-y-3 h-fit shadow-lg">
                    <div className="flex items-center space-x-3">
                         <img src={playerAvatarUrl} alt="Player Avatar" className="w-14 h-14 rounded-full border-2 border-slate-600" />
                         <div className="flex-grow">
                             {isEditingName ? (
                                <input 
                                    type="text" 
                                    value={nameInput}
                                    onChange={(e) => setNameInput(e.target.value)}
                                    onBlur={handleNameSave}
                                    onKeyDown={(e) => e.key === 'Enter' && handleNameSave()}
                                    className="bg-slate-700 text-white rounded px-2 py-1 w-full text-base font-bold"
                                    autoFocus
                                />
                            ) : (
                                <h2 onClick={() => setIsEditingName(true)} className="text-base md:text-lg font-bold flex items-center cursor-pointer">{playerName} <span className="text-cyan-400 ml-2"><PencilIcon/></span></h2>
                            )}
                             <p className="text-xs font-semibold text-cyan-400">Level {playerLevel}</p>
                             <div className="flex items-center mt-1">
                                <CoinIcon />
                                <span className="ml-2 font-bold text-yellow-400 text-sm">{playerCoins}</span>
                            </div>
                         </div>
                    </div>
                    <div>
                        <div className="flex justify-between items-center text-xs text-gray-400 mb-1">
                            <span>XP</span>
                            <span>{currentLevelXP} / {MAX_XP_PER_LEVEL}</span>
                        </div>
                        <div className="w-full bg-slate-900 rounded-full h-2 border border-slate-700">
                            <div className="bg-cyan-500 h-full rounded-full" style={{width: xpBarWidth}}></div>
                        </div>
                    </div>
                    <div className="grid grid-cols-3 text-center bg-slate-900/50 p-1.5 rounded-lg">
                        <div>
                            <p className="text-lg md:text-xl font-bold text-green-400">{wins}</p>
                            <p className="text-[10px] text-gray-400">WINS</p>
                        </div>
                        <div>
                            <p className="text-lg md:text-xl font-bold text-red-400">{losses}</p>
                            <p className="text-[10px] text-gray-400">LOSSES</p>
                        </div>
                        <div>
                            <p className="text-lg md:text-xl font-bold">{totalGames}</p>
                            <p className="text-[10px] text-gray-400">TOTAL</p>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="xl:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-4 flex flex-col justify-between items-center text-center shadow-lg">
                        <span className="text-xs font-bold text-gray-400 tracking-widest">FEATURED ITEM</span>
                        {featuredItem ? (
                            <>
                                <div className="my-3 sm:my-4">
                                    <p className="text-2xl md:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-400">{featuredItem.name}</p>
                                    <p className="text-gray-400 text-xs mt-1">Limited Edition Board Skin</p>
                                </div>
                                <button onClick={onGoToShop} className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-1.5 px-5 sm:px-6 rounded-lg transition-colors shadow-md text-xs sm:text-sm">
                                    Go to Shop
                                </button>
                            </>
                        ) : (
                            <div className="my-3 sm:my-4 text-gray-400">No items in shop.</div>
                        )}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <button onClick={onGoToShop} className="h-full bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl flex flex-col items-center justify-center space-y-2 font-bold text-sm md:text-base hover:from-purple-500 transition-all duration-300 transform hover:scale-105 shadow-lg"><ShopIcon /><span>Shop</span></button>
                        <button onClick={onGoToInventory} className="h-full bg-gradient-to-br from-teal-500 to-cyan-500 rounded-2xl flex flex-col items-center justify-center space-y-2 font-bold text-sm md:text-base hover:from-teal-400 transition-all duration-300 transform hover:scale-105 shadow-lg"><InventoryIcon /><span>Inventory</span></button>
                        <button onClick={onOpenSettings} className="bg-slate-700 rounded-2xl flex items-center justify-center space-x-2 font-semibold text-sm hover:bg-slate-600 transition-colors shadow-lg"><SettingsIcon /><span>Settings</span></button>
                        <button className="bg-slate-700 rounded-2xl flex items-center justify-center space-x-2 font-semibold cursor-not-allowed opacity-50 shadow-lg text-sm"><GlobeIcon /><span>Play Online</span></button>
                    </div>
                </div>
            </div>

            <div>
                <h2 className="text-xl md:text-2xl font-bold mb-4 text-center mt-4 md:mt-6">Choose Your Opponent</h2>
                <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-[#1E293B] p-4 rounded-2xl flex flex-col items-center text-center border border-gray-700 transform hover:scale-105 hover:border-cyan-400 transition-all duration-300">
                        <img src="https://i.pravatar.cc/150?u=ai_meow" alt="Meow" className="w-16 h-16 rounded-full mb-3 border-2 border-cyan-400" />
                        <h3 className="text-lg md:text-xl font-bold">Meow</h3>
                        <p className="text-gray-400 mt-2 mb-4 h-14 text-xs">A cute little cat new to the game. Perfect for those who don't like challenges.</p>
                        <button onClick={onStartGame} className="w-full bg-cyan-500 text-black py-2 rounded-lg font-bold text-sm md:text-base hover:bg-cyan-400 transition-colors">Challenge</button>
                    </div>
                    <div className="bg-[#1E293B] p-4 rounded-2xl flex flex-col items-center text-center border border-gray-700 transform hover:scale-105 hover:border-purple-400 transition-all duration-300">
                        <img src="https://i.pravatar.cc/150?u=ai_nova" alt="Nova" className="w-16 h-16 rounded-full mb-3 border-2 border-purple-400" />
                        <h3 className="text-lg md:text-xl font-bold">Nova</h3>
                        <p className="text-gray-400 mt-2 mb-4 h-14 text-xs">A beautiful girl who is a master of strategy. Promises an intellectual date.</p>
                        <button onClick={onStartGame} className="w-full bg-cyan-500 text-black py-2 rounded-lg font-bold text-sm md:text-base hover:bg-cyan-400 transition-colors">Challenge</button>
                    </div>
                    <div className="bg-[#1E293B] p-4 rounded-2xl flex flex-col items-center text-center border border-gray-700 transform hover:scale-105 hover:border-red-400 transition-all duration-300">
                        <img src="https://i.pravatar.cc/150?u=ai_kael" alt="Kael" className="w-16 h-16 rounded-full mb-3 border-2 border-red-400" />
                        <h3 className="text-lg md:text-xl font-bold">Kael</h3>
                        <p className="text-gray-400 mt-2 mb-4 h-14 text-xs">A young hacker, thinks carefully before acting, defeat is inevitable.</p>
                        <button onClick={onStartGame} className="w-full bg-cyan-500 text-black py-2 rounded-lg font-bold text-sm md:text-base hover:bg-cyan-400 transition-colors">Challenge</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default Menu;
