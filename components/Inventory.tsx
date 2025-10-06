
import React, { useState } from 'react';
import { SHOP_ITEMS, AVATAR_ITEMS, THEME_ITEMS, EMOJI_ITEMS } from '../constants';
import { BackIcon } from './icons';

interface InventoryProps {
    ownedSkins: string[];
    equippedSkin: string;
    ownedAvatars: string[];
    equippedAvatar: string;
    ownedThemes: string[];
    equippedTheme: string;
    ownedEmojis: string[];
    onEquipItem: (itemId: string, type: 'skin' | 'avatar' | 'theme') => void;
    onBack: () => void;
}

type InventoryTab = 'skins' | 'avatars' | 'themes' | 'emojis';

const SkinPreview: React.FC<{ skinId: string }> = ({ skinId }) => {
    let skinClasses = 'w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ease-in-out';
    let textClasses = 'relative z-10 text-4xl';
    let textStyles: React.CSSProperties = { textShadow: '1px 1px 3px rgba(0,0,0,0.7)' };

    switch (skinId) {
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
        case 'default':
        default:
            skinClasses += ` border-2 bg-gradient-to-b from-red-500 to-red-800 border-red-900 shadow-[0_3px_6px_rgba(0,0,0,0.4),inset_0_3px_3px_rgba(255,255,255,0.2)]`;
            textClasses += ' text-white';
            break;
    }

    return (
        <div className={skinClasses}>
            <span className={textClasses} style={textStyles}>帥</span>
        </div>
    );
};

const TabButton: React.FC<{ active: boolean, onClick: () => void, children: React.ReactNode }> = ({ active, onClick, children }) => (
    <button onClick={onClick} className={`py-2 px-2 text-xl font-semibold ${active ? 'border-b-4 border-cyan-400 text-white' : 'text-gray-500'}`}>
        {children}
    </button>
);

const Inventory: React.FC<InventoryProps> = ({ ownedSkins, equippedSkin, ownedAvatars, equippedAvatar, ownedThemes, equippedTheme, ownedEmojis, onEquipItem, onBack }) => {
    const [activeTab, setActiveTab] = useState<InventoryTab>('skins');

    const renderSkins = () => {
        const allItems = [{ id: 'default', name: 'Default' }, ...SHOP_ITEMS];
        const ownedItems = allItems.filter(item => ownedSkins.includes(item.id));
        return (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {ownedItems.map(item => (
                    <InventoryCard key={item.id} name={item.name} isEquipped={equippedSkin === item.id} onEquip={() => onEquipItem(item.id, 'skin')}>
                        <SkinPreview skinId={item.id} />
                    </InventoryCard>
                ))}
            </div>
        );
    };
    
    const renderAvatars = () => {
        const allItems = [{id: 'player1', name: 'Default', url: 'https://i.pravatar.cc/150?u=player1'}, ...AVATAR_ITEMS];
        const ownedItems = allItems.filter(item => ownedAvatars.includes(item.id));
        return (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {ownedItems.map(item => (
                    <InventoryCard key={item.id} name={item.name} isEquipped={equippedAvatar === item.id} onEquip={() => onEquipItem(item.id, 'avatar')}>
                        <img src={item.url} alt={item.name} className="w-20 h-20 rounded-full" />
                    </InventoryCard>
                ))}
            </div>
        );
    };
    
    const renderThemes = () => {
        const allItems = [{id: 'default', name: 'Default'}, ...THEME_ITEMS];
        const ownedItems = allItems.filter(item => ownedThemes.includes(item.id));
         return (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {ownedItems.map(item => (
                    <InventoryCard key={item.id} name={item.name} isEquipped={equippedTheme === item.id} onEquip={() => onEquipItem(item.id, 'theme')}>
                         <div className={`w-20 h-20 rounded-lg border-4 ${item.id === 'summer' ? 'bg-amber-200 border-sky-700' : 'bg-[#F3D39C] border-[#B58863]'}`}></div>
                    </InventoryCard>
                ))}
            </div>
        );
    };

    const renderEmojis = () => {
        const ownedItems = EMOJI_ITEMS.filter(item => ownedEmojis.includes(item.id));
        return (
            <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-6">
                {ownedItems.map(item => (
                     <div key={item.id} className="bg-[#1E293B] p-4 rounded-2xl flex flex-col items-center text-center border border-gray-700">
                        <div className="w-24 h-24 bg-gray-800/50 rounded-lg flex items-center justify-center mb-4 text-6xl">
                           {item.char}
                        </div>
                        <h3 className="text-xl font-bold">{item.name}</h3>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-[#0F172A] text-white p-8 font-sans">
            <div className="w-full max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-5xl font-bold">Inventory</h1>
                    <button onClick={onBack} className="bg-gray-700 px-4 py-2 rounded-lg font-semibold flex items-center space-x-2 hover:bg-gray-600">
                        <BackIcon />
                        <span>Back</span>
                    </button>
                </div>

                <div className="mb-8">
                    <div className="flex space-x-6 border-b-2 border-gray-700">
                         <TabButton active={activeTab === 'skins'} onClick={() => setActiveTab('skins')}>Skins</TabButton>
                        <TabButton active={activeTab === 'avatars'} onClick={() => setActiveTab('avatars')}>Avatars</TabButton>
                        <TabButton active={activeTab === 'themes'} onClick={() => setActiveTab('themes')}>Themes</TabButton>
                        <TabButton active={activeTab === 'emojis'} onClick={() => setActiveTab('emojis')}>Emojis</TabButton>
                    </div>
                </div>

                {activeTab === 'skins' && renderSkins()}
                {activeTab === 'avatars' && renderAvatars()}
                {activeTab === 'themes' && renderThemes()}
                {activeTab === 'emojis' && renderEmojis()}
            </div>
        </div>
    );
};

const InventoryCard: React.FC<{name: string, isEquipped: boolean, onEquip: () => void, children: React.ReactNode}> = ({ name, isEquipped, onEquip, children }) => (
    <div className={`bg-[#1E293B] p-4 rounded-2xl flex flex-col items-center text-center border ${isEquipped ? 'border-cyan-400' : 'border-gray-700'}`}>
        <div className="w-24 h-24 bg-gray-800/50 rounded-lg flex items-center justify-center mb-4">
            {children}
        </div>
        <h3 className="text-xl font-bold">{name}</h3>
        <div className="my-4 grow"></div>
        <button 
            onClick={onEquip}
            disabled={isEquipped}
            className={`w-full py-2 rounded-lg font-bold transition-colors ${
                isEquipped 
                ? 'bg-cyan-500 text-black cursor-not-allowed' 
                : 'bg-gray-600 text-white hover:bg-gray-500'
            }`}
        >
            {isEquipped ? 'Equipped' : 'Equip'}
        </button>
    </div>
);

export default Inventory;