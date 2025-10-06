import { Player, PieceType, Piece, Skin, Avatar, Theme, EmojiItem, AIOpponent } from './types';

let idCounter = 0;

const createPiece = (player: Player, type: PieceType, x: number, y: number): Piece => ({
  id: idCounter++,
  player,
  type,
  position: { x, y },
});

export const INITIAL_PIECES: Piece[] = [
  // Black pieces
  createPiece(Player.Black, PieceType.Chariot, 0, 0),
  createPiece(Player.Black, PieceType.Horse, 1, 0),
  createPiece(Player.Black, PieceType.Elephant, 2, 0),
  createPiece(Player.Black, PieceType.Advisor, 3, 0),
  createPiece(Player.Black, PieceType.General, 4, 0),
  createPiece(Player.Black, PieceType.Advisor, 5, 0),
  createPiece(Player.Black, PieceType.Elephant, 6, 0),
  createPiece(Player.Black, PieceType.Horse, 7, 0),
  createPiece(Player.Black, PieceType.Chariot, 8, 0),
  createPiece(Player.Black, PieceType.Cannon, 1, 2),
  createPiece(Player.Black, PieceType.Cannon, 7, 2),
  createPiece(Player.Black, PieceType.Soldier, 0, 3),
  createPiece(Player.Black, PieceType.Soldier, 2, 3),
  createPiece(Player.Black, PieceType.Soldier, 4, 3),
  createPiece(Player.Black, PieceType.Soldier, 6, 3),
  createPiece(Player.Black, PieceType.Soldier, 8, 3),

  // Red pieces
  createPiece(Player.Red, PieceType.Chariot, 0, 9),
  createPiece(Player.Red, PieceType.Horse, 1, 9),
  createPiece(Player.Red, PieceType.Elephant, 2, 9),
  createPiece(Player.Red, PieceType.Advisor, 3, 9),
  createPiece(Player.Red, PieceType.General, 4, 9),
  createPiece(Player.Red, PieceType.Advisor, 5, 9),
  createPiece(Player.Red, PieceType.Elephant, 6, 9),
  createPiece(Player.Red, PieceType.Horse, 7, 9),
  createPiece(Player.Red, PieceType.Chariot, 8, 9),
  createPiece(Player.Red, PieceType.Cannon, 1, 7),
  createPiece(Player.Red, PieceType.Cannon, 7, 7),
  createPiece(Player.Red, PieceType.Soldier, 0, 6),
  createPiece(Player.Red, PieceType.Soldier, 2, 6),
  createPiece(Player.Red, PieceType.Soldier, 4, 6),
  createPiece(Player.Red, PieceType.Soldier, 6, 6),
  createPiece(Player.Red, PieceType.Soldier, 8, 6),
];

export const PIECE_UNICODE: Record<Player, Record<PieceType, string>> = {
  [Player.Red]: {
    [PieceType.General]: '帥',
    [PieceType.Advisor]: '仕',
    [PieceType.Elephant]: '相',
    [PieceType.Horse]: '傌',
    [PieceType.Chariot]: '俥',
    [PieceType.Cannon]: '炮',
    [PieceType.Soldier]: '兵',
  },
  [Player.Black]: {
    [PieceType.General]: '將',
    [PieceType.Advisor]: '士',
    [PieceType.Elephant]: '象',
    [PieceType.Horse]: '馬',
    [PieceType.Chariot]: '車',
    [PieceType.Cannon]: '砲',
    [PieceType.Soldier]: '卒',
  },
};

export const BOARD_WIDTH = 9;
export const BOARD_HEIGHT = 10;
export const DEFAULT_GAME_TIME_SECONDS = 1800; // 30 minutes total
export const TURN_DURATION_SECONDS = 180; // 3 minutes per turn

export const SHOP_ITEMS: Skin[] = [
    { id: 'classic', name: 'Classic Flat', price: 300 },
    { id: 'neon', name: 'Neon Glow', price: 500 },
    { id: 'inkwash', name: 'Ink Wash', price: 750 },
    { id: 'western', name: 'Western Style', price: 1200 },
];

export const AVATAR_ITEMS: Avatar[] = [
    { id: 'avatar1', name: 'Cool Dude', price: 200, url: 'https://i.pravatar.cc/150?u=avatar1' },
    { id: 'avatar2', name: 'Happy Gal', price: 200, url: 'https://i.pravatar.cc/150?u=avatar2' },
    { id: 'avatar3', name: 'Thinker', price: 350, url: 'https://i.pravatar.cc/150?u=avatar3' },
    { id: 'avatar4', name: 'Gamer Girl', price: 350, url: 'https://i.pravatar.cc/150?u=avatar4' },
];

export const THEME_ITEMS: Theme[] = [
    { id: 'summer', name: 'Summer', price: 1000 },
];

export const EMOJI_ITEMS: EmojiItem[] = [
    { id: 'e1', name: 'Laughing', price: 50, char: '😂' },
    { id: 'e2', name: 'Heart Eyes', price: 50, char: '😍' },
    { id: 'e3', name: 'Thinking', price: 50, char: '🤔' },
    { id: 'e4', name: 'Crying', price: 50, char: '😭' },
    { id: 'e5', name: 'Angry', price: 50, char: '😡' },
    { id: 'e6', name: 'Thumbs Up', price: 50, char: '👍' },
    { id: 'e7', name: 'Fire', price: 75, char: '🔥' },
    { id: 'e8', name: 'Mind Blown', price: 75, char: '🤯' },
    { id: 'e9', name: 'Face Palm', price: 50, char: '🤦' },
    { id: 'e10', name: 'Shush', price: 75, char: '🤫' },
    { id: 'e11', name: 'Wink', price: 50, char: '😉' },
    { id: 'e12', name: 'Clown', price: 100, char: '🤡' },
    { id: 'e13', name: 'Angel', price: 75, char: '😇' },
    { id: 'e14', name: 'Devil', price: 75, char: '😈' },
    { id: 'e15', name: 'Dizzy', price: 50, char: '😵' },
    { id: 'e16', name: 'Sleepy', price: 50, char: '😴' },
    { id: 'e17', name: 'Sunglasses', price: 100, char: '😎' },
    { id: 'e18', name: 'Sweat', price: 50, char: '😅' },
    { id: 'e19', name: 'Vomit', price: 50, char: '🤮' },
    { id: 'e20', name: 'Flex', price: 100, char: '💪' },
];

export const AI_OPPONENTS: AIOpponent[] = [
    {
        id: 'meow',
        name: 'Meow',
        difficulty: 'easy',
        level: 1,
        avatarUrl: 'https://i.pravatar.cc/150?u=ai_meow'
    },
    {
        id: 'nova',
        name: 'Nova',
        difficulty: 'medium',
        level: 3,
        avatarUrl: 'https://i.pravatar.cc/150?u=ai_nova'
    },
    {
        id: 'kael',
        name: 'Kael',
        difficulty: 'hard',
        level: 5,
        avatarUrl: 'https://i.pravatar.cc/150?u=ai_kael'
    }
];

export const MUSIC_TRACKS: { name: string, src: string }[] = [
    { name: 'Celestial', src: 'assets/sounds/music.mp3' },
    { name: 'Battle Drums', src: 'assets/sounds/music_1.mp3' },
    { name: 'Peaceful Garden', src: 'assets/sounds/music_2.mp3' },
    { name: 'Synthwave Beats', src: 'assets/sounds/music_3.mp3' },
];
