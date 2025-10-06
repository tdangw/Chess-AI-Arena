
import React, { useState } from 'react';
import { Skin, Avatar, Theme, EmojiItem } from '../types';
import { SHOP_ITEMS, AVATAR_ITEMS, THEME_ITEMS, EMOJI_ITEMS } from '../constants';
import { BackIcon, CoinIcon } from './icons';

interface ShopProps {
    playerCoins: number;
    ownedSkins: string[];
    ownedAvatars: string[];
    ownedThemes: string[];
    ownedEmojis: string[];
    onBuyItem: (item: Skin | Avatar | Theme | EmojiItem, type: 'skin' | 'avatar' | 'theme' | 'emoji') => void;
    onBack: () => void;
}

type ShopTab = 'skins' | 'avatars' | 'themes' | 'emojis';

const SkinPreview: React.FC<{ skinId: string }> = ({ skinId }) => {
    const isRed = true; // Always show red for preview
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
        default:
            skinClasses += ` border-2 bg-gradient-to-b from-red-500 to-red-800 border-red-900 shadow-[0_3px_6px_rgba(0,0,0,0.4),inset_0_3px_3px_rgba(255,255,255,0.2)]`;
            textClasses += ' text-white';
            break;
    }

    return (
        <div class={skinClasses}>
            <span class={textClasses} style={textStyles}>帥</span>
        </div>
    );
};

const TabButton: React.FC<{ active: boolean, onClick: () => void, children: React.ReactNode }> = ({ active, onClick, children }) => (
    <button onClick={onClick} class={`py-2 px-2 text-xl font-semibold ${active ? 'border-b-4 border-cyan-400 text-white' : 'text-gray-500'}`}>
        {children}
    </button>
);


const Shop: React.FC<ShopProps> = ({ playerCoins, ownedSkins, ownedAvatars, ownedThemes, ownedEmojis, onBuyItem, onBack }) => {
    const [activeTab, setActiveTab] = useState<ShopTab>('skins');

    const renderSkins = () => (
        <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {SHOP_ITEMS.map(item => {
                const isOwned = ownedSkins.includes(item.id);
                const canAfford = playerCoins >= item.price;
                return (
                    <div key={item.id} class="bg-[#1E293B] p-4 rounded-2xl flex flex-col items-center text-center border border-gray-700">
                        <div class="w-24 h-24 bg-gray-800/50 rounded-lg flex items-center justify-center mb-4">
                            <SkinPreview skinId={item.id} />
                        </div>
                        <h3 class="text-xl font-bold">{item.name}</h3>
                        <div class="my-4 grow"></div>
                        <PurchaseButton isOwned={isOwned} canAfford={canAfford} price={item.price} onClick={() => onBuyItem(item, 'skin')} />
                    </div>
                );
            })}
        </div>
    );
    
    const renderAvatars = () => (
         <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {AVATAR_ITEMS.map(item => {
                const isOwned = ownedAvatars.includes(item.id);
                const canAfford = playerCoins >= item.price;
                return (
                    <div key={item.id} class="bg-[#1E293B] p-4 rounded-2xl flex flex-col items-center text-center border border-gray-700">
                        <div class="w-24 h-24 bg-gray-800/50 rounded-lg flex items-center justify-center mb-4">
                            <img src={item.url} alt={item.name} class="w-20 h-20 rounded-full" />
                        </div>
                        <h3 class="text-xl font-bold">{item.name}</h3>
                        <div class="my-4 grow"></div>
                        <PurchaseButton isOwned={isOwned} canAfford={canAfford} price={item.price} onClick={() => onBuyItem(item, 'avatar')} />
                    </div>
                );
            })}
        </div>
    );
    
    const renderThemes = () => (
        <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {THEME_ITEMS.map(item => {
                const isOwned = ownedThemes.includes(item.id);
                const canAfford = playerCoins >= item.price;
                return (
                    <div key={item.id} class="bg-[#1E293B] p-4 rounded-2xl flex flex-col items-center text-center border border-gray-700">
                        <div class="w-24 h-24 bg-gray-800/50 rounded-lg flex items-center justify-center mb-4">
                           <div class="w-20 h-20 rounded-lg bg-amber-200 border-4 border-sky-700"></div>
                        </div>
                        <h3 class="text-xl font-bold">{item.name}</h3>
                        <div class="my-4 grow"></div>
                        <PurchaseButton isOwned={isOwned} canAfford={canAfford} price={item.price} onClick={() => onBuyItem(item, 'theme')} />
                    </div>
                );
            })}
        </div>
    );

    const renderEmojis = () => (
        <div class="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-6">
            {EMOJI_ITEMS.map(item => {
                const isOwned = ownedEmojis.includes(item.id);
                const canAfford = playerCoins >= item.price;
                return (
                    <div key={item.id} class="bg-[#1E293B] p-4 rounded-2xl flex flex-col items-center text-center border border-gray-700">
                        <div class="w-24 h-24 bg-gray-800/50 rounded-lg flex items-center justify-center mb-4 text-6xl">
                            {item.char}
                        </div>
                        <h3 class="text-lg font-bold">{item.name}</h3>
                         <div class="my-4 grow"></div>
                        <PurchaseButton isOwned={isOwned} canAfford={canAfford} price={item.price} onClick={() => onBuyItem(item, 'emoji')} />
                    </div>
                );
            })}
        </div>
    );

    return (
        <div class="min-h-screen bg-[#0F172A] text-white p-8 font-sans">
            <div class="w-full max-w-7xl mx-auto">
                <div class="flex justify-between items-center mb-8">
                    <div class="flex items-center space-x-4">
                         <h1 class="text-5xl font-bold">Shop</h1>
                        <div class="flex items-center bg-gray-800 px-4 py-2 rounded-lg text-yellow-400 font-bold text-xl">
                            <CoinIcon />
                            <span class="ml-2">{playerCoins}</span>
                        </div>
                    </div>
                    <button onClick={onBack} class="bg-gray-700 px-4 py-2 rounded-lg font-semibold flex items-center space-x-2 hover:bg-gray-600">
                        <BackIcon />
                        <span>Back</span>
                    </button>
                </div>

                <div class="mb-8">
                    <div class="flex space-x-6 border-b-2 border-gray-700">
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

const PurchaseButton: React.FC<{isOwned: boolean, canAfford: boolean, price: number, onClick: () => void}> = ({ isOwned, canAfford, price, onClick}) => {
    if (isOwned) {
        return <button disabled class="w-full bg-green-600 text-white py-2 rounded-lg font-bold cursor-not-allowed">Owned</button>;
    }
    return (
        <button 
            onClick={onClick}
            disabled={!canAfford}
            class={`w-full py-2 rounded-lg font-bold flex items-center justify-center space-x-2 transition-colors ${
                canAfford 
                ? 'bg-cyan-500 text-black hover:bg-cyan-400' 
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }`}
        >
            <CoinIcon />
            <span>{price}</span>
        </button>
    );
};

export default Shop;