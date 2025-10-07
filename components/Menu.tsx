
import React, { useState, useEffect } from 'react';
import { CoinIcon, PencilIcon, ShopIcon, InventoryIcon, SettingsIcon, GlobeIcon } from './icons';
import { Skin, } from '../types';
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
        <div className="flex flex-col items-center">
            <div className={skinClasses}>
                <span className={textClasses} style={textStyles}>帥</span>
            </div>
            <p className="mt-2 text-gray-300 text-xs">Giao diện bàn cờ</p>
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
    <div className="min-h-screen bg-[#0F172A] text-white flex flex-col items-center justify-center p-2 sm:p-4 font-sans">
        <div className="w-full max-w-5xl mx-auto space-y-3 md:space-y-4">
            <div className="text-center">
                <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-cyan-400">
                    Cờ Tướng AI Arena
                </h1>
                <p className="text-gray-400 mt-1 text-xs">Một trận chiến trí tuệ bên kia sông.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                {/* Player Profile */}
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-3 flex flex-col space-y-2.5 h-full shadow-lg">
                    <div className="flex items-center space-x-3">
                         <img src={playerAvatarUrl} alt="Player Avatar" className="w-12 h-12 rounded-full border-2 border-slate-600" />
                         <div className="flex-grow">
                             {isEditingName ? (
                                <input 
                                    type="text" 
                                    value={nameInput}
                                    onChange={(e) => setNameInput(e.target.value)}
                                    onBlur={handleNameSave}
                                    onKeyDown={(e) => e.key === 'Enter' && handleNameSave()}
                                    className="bg-slate-700 text-white rounded px-2 py-1 w-full text-sm font-bold"
                                    autoFocus
                                />
                            ) : (
                                <h2 onClick={() => { audioService.playClickSound(); setIsEditingName(true);}} className="text-sm md:text-base font-bold flex items-center cursor-pointer">{playerName} <span className="text-cyan-400 ml-1.5"><PencilIcon/></span></h2>
                            )}
                             <p className="text-xs font-semibold text-cyan-400">Cấp {playerLevel}</p>
                             <div className="flex items-center mt-0.5">
                                <CoinIcon />
                                <span className="ml-1.5 font-bold text-yellow-400 text-xs">{playerCoins}</span>
                            </div>
                         </div>
                    </div>
                    <div className="flex-grow">
                        <div className="flex justify-between items-center text-[10px] text-gray-400 mb-1">
                            <span>XP</span>
                            <span>{currentLevelXP} / {MAX_XP_PER_LEVEL}</span>
                        </div>
                        <div className="w-full bg-slate-900 rounded-full h-1.5 border border-slate-700">
                            <div className="bg-cyan-500 h-full rounded-full" style={{width: xpBarWidth}}></div>
                        </div>
                    </div>
                    <div className="grid grid-cols-3 text-center bg-slate-900/50 p-1 rounded-md">
                        <div>
                            <p className="text-base md:text-lg font-bold text-green-400">{wins}</p>
                            <p className="text-[9px] text-gray-400">THẮNG</p>
                        </div>
                        <div>
                            <p className="text-base md:text-lg font-bold text-red-400">{losses}</p>
                            <p className="text-[9px] text-gray-400">THUA</p>
                        </div>
                        <div>
                            <p className="text-base md:text-lg font-bold">{totalGames}</p>
                            <p className="text-[9px] text-gray-400">TỔNG</p>
                        </div>
                    </div>
                </div>
                
                {/* Featured Item */}
                <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-3 flex flex-col justify-between items-center text-center shadow-lg h-full">
                    <span className="text-[10px] font-bold text-gray-400 tracking-widest">VẬT PHẨM NỔI BẬT</span>
                    {featuredItem ? (
                        <>
                            <div className="my-2 flex-grow flex flex-col items-center justify-center">
                                <p className="text-xl md:text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-400">{featuredItem.name}</p>
                                <p className="text-gray-400 text-[10px] mb-2">Giao diện bàn cờ phiên bản giới hạn</p>
                                <FeaturedItemPreview skin={featuredItem} />
                            </div>
                            <button onClick={onGoToShop} className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-1 px-4 rounded-md transition-colors shadow-md text-xs">
                                Tới Cửa Hàng
                            </button>
                        </>
                    ) : (
                        <div className="my-2 text-gray-400">Không có vật phẩm trong cửa hàng.</div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 grid-rows-2 gap-3 md:gap-4 h-full">
                    <button onClick={onGoToShop} className="bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex flex-col items-center justify-center space-y-1 font-bold text-sm hover:from-purple-500 transition-all duration-300 transform hover:scale-105 shadow-lg"><ShopIcon /><span>Cửa Hàng</span></button>
                    <button onClick={onGoToInventory} className="bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl flex flex-col items-center justify-center space-y-1 font-bold text-sm hover:from-teal-400 transition-all duration-300 transform hover:scale-105 shadow-lg"><InventoryIcon /><span>Kho Đồ</span></button>
                    <button onClick={onOpenSettings} className="bg-slate-700 rounded-xl flex flex-col items-center justify-center space-y-1 font-semibold text-sm hover:bg-slate-600 transition-colors shadow-lg"><SettingsIcon /><span>Cài Đặt</span></button>
                    <button className="bg-slate-700 rounded-xl flex flex-col items-center justify-center space-y-1 font-semibold cursor-not-allowed opacity-50 shadow-lg text-sm"><GlobeIcon /><span>Chơi Online</span></button>
                </div>
            </div>

            <div>
                <h2 className="text-lg md:text-xl font-bold mb-3 text-center mt-3 md:mt-4">Chọn Đối Thủ</h2>
                <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
                    <div className="bg-[#1E293B] p-3 rounded-xl flex flex-col items-center text-center border border-gray-700 transform hover:scale-105 hover:border-cyan-400 transition-all duration-300">
                        <img src="https://i.pravatar.cc/150?u=ai_meow" alt="Meow" className="w-14 h-14 rounded-full mb-2 border-2 border-cyan-400" />
                        <h3 className="text-base md:text-lg font-bold">Meow</h3>
                        <p className="text-gray-400 mt-1 mb-3 h-12 text-xs">Một chú mèo con dễ thương mới tập chơi. Hoàn hảo cho những ai không thích thử thách.</p>
                        <button onClick={() => onStartGame('easy')} className="w-full bg-cyan-500 text-black py-1.5 rounded-lg font-bold text-sm hover:bg-cyan-400 transition-colors">Thách đấu</button>
                    </div>
                    <div className="bg-[#1E293B] p-3 rounded-xl flex flex-col items-center text-center border border-gray-700 transform hover:scale-105 hover:border-purple-400 transition-all duration-300">
                        <img src="https://i.pravatar.cc/150?u=ai_nova" alt="Nova" className="w-14 h-14 rounded-full mb-2 border-2 border-purple-400" />
                        <h3 className="text-base md:text-lg font-bold">Nova</h3>
                        <p className="text-gray-400 mt-1 mb-3 h-12 text-xs">Một cô gái xinh đẹp là bậc thầy chiến thuật. Hứa hẹn một cuộc hẹn hò trí tuệ.</p>
                        <button onClick={() => onStartGame('medium')} className="w-full bg-cyan-500 text-black py-1.5 rounded-lg font-bold text-sm hover:bg-cyan-400 transition-colors">Thách đấu</button>
                    </div>
                    <div className="bg-[#1E293B] p-3 rounded-xl flex flex-col items-center text-center border border-gray-700 transform hover:scale-105 hover:border-red-400 transition-all duration-300">
                        <img src="https://i.pravatar.cc/150?u=ai_kael" alt="Kael" className="w-14 h-14 rounded-full mb-2 border-2 border-red-400" />
                        <h3 className="text-base md:text-lg font-bold">Kael</h3>
                        <p className="text-gray-400 mt-1 mb-3 h-12 text-xs">Một hacker trẻ tuổi, suy nghĩ cẩn thận. Thách thức thật sự đang chờ bạn.</p>
                        <button onClick={() => onStartGame('hard')} className="w-full bg-cyan-500 text-black py-1.5 rounded-lg font-bold text-sm hover:bg-cyan-400 transition-colors">Thách đấu</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default Menu;