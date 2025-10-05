import React from 'react';
import { EMOJI_ITEMS } from '../constants';

interface EmojiPickerProps {
    onSelect: (emoji: string) => void;
    ownedEmojis: string[];
}

const EmojiPicker: React.FC<EmojiPickerProps> = ({ onSelect, ownedEmojis }) => {
    const availableEmojis = EMOJI_ITEMS.filter(item => ownedEmojis.includes(item.id));

    return (
        <div 
            className="absolute top-full mt-2 w-80 bg-[#1E293B] border border-gray-700 rounded-xl p-4 shadow-lg z-30 animate-fade-in-up"
            style={{ 
                left: '50%',
                // Center relative to parent (emoji icon), then shift left by ~1 button width + 1 gap
                transform: 'translateX(calc(-50% - 3.5rem))' 
            }}
        >
            <div className="grid grid-cols-5 gap-3">
                {availableEmojis.map(emojiItem => (
                    <button
                        key={emojiItem.id}
                        onClick={() => onSelect(emojiItem.char)}
                        className="text-4xl rounded-lg hover:bg-slate-700 transition-colors p-2 transform hover:scale-110"
                    >
                        {emojiItem.char}
                    </button>
                ))}
            </div>
            <style>{`
                @keyframes fade-in-up {
                    from { opacity: 0; transform: translateY(-10px) translateX(calc(-50% - 3.5rem)); }
                    to { opacity: 1; transform: translateY(0) translateX(calc(-50% - 3.5rem)); }
                }
                .animate-fade-in-up {
                    animation: fade-in-up 0.2s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default EmojiPicker;