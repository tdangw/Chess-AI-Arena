import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Player, Piece, Position, Move, Skin, Avatar, Theme, EmojiItem, PieceType, AIOpponent } from './types';
import Board from './components/Board';
import Menu from './components/Menu';
import Shop from './components/Shop';
import Inventory from './components/Inventory';
import GameHeader from './components/GameHeader';
import EndGameModal from './components/EndGameModal';
import SettingsModal from './components/SettingsModal';
import ConfirmModal from './components/ConfirmModal';
import PieceComponent from './components/Piece';
import { INITIAL_PIECES, PIECE_UNICODE, TURN_DURATION_SECONDS, AVATAR_ITEMS, DEFAULT_GAME_TIME_SECONDS, AI_OPPONENTS, MUSIC_TRACKS } from './constants';
import { getValidMoves, isCheckmate, isCheck } from './services/gameLogic';
import { getLocalAIMove } from './services/localAi';
import { audioService } from './services/audioService';

type GameView = 'menu' | 'game' | 'shop' | 'inventory';
type AIDifficulty = 'easy' | 'medium' | 'hard';

// --- Persisted Data Logic ---
interface SavedPlayerData {
    playerName: string;
    playerXP: number;
    playerCoins: number;
    wins: number;
    losses: number;
    ownedSkins: string[];
    equippedSkin: string;
    ownedAvatars: string[];
    equippedAvatar: string;
    ownedThemes: string[];
    equippedTheme: string;
    ownedEmojis: string[];
    soundEnabled: boolean;
    musicEnabled: boolean;
    musicTrack: string;
    soundVolume: number;
    musicVolume: number;
    gameDuration: number;
    turnDuration: number;
}

const getInitialState = (): SavedPlayerData => {
    const defaultState: SavedPlayerData = {
        playerName: 'Player_5566',
        playerXP: 55,
        playerCoins: 9960,
        wins: 0,
        losses: 0,
        ownedSkins: ['default', 'inkwash'],
        equippedSkin: 'default',
        ownedAvatars: ['player1'],
        equippedAvatar: 'player1',
        ownedThemes: ['default'],
        equippedTheme: 'default',
        ownedEmojis: ['e1', 'e2', 'e3', 'e4', 'e5', 'e6', 'e7', 'e8'],
        soundEnabled: true,
        musicEnabled: true,
        musicTrack: MUSIC_TRACKS[0].src,
        soundVolume: 1,
        musicVolume: 0.5,
        gameDuration: DEFAULT_GAME_TIME_SECONDS,
        turnDuration: TURN_DURATION_SECONDS,
    };

    try {
        const savedDataString = localStorage.getItem('chessAiArenaData');
        if (savedDataString) {
            const savedData = JSON.parse(savedDataString);
            return { ...defaultState, ...savedData };
        }
    } catch (error) {
        console.error("Failed to load data from localStorage", error);
    }

    return defaultState;
};


// --- First Move Animation Component ---
const redGeneral: Piece = { id: -1, player: Player.Red, type: PieceType.General, position: { x: 4, y: 4.5 } };
const blackGeneral: Piece = { id: -2, player: Player.Black, type: PieceType.General, position: { x: 4, y: 4.5 } };

interface FirstMoveAnimationProps {
    onAnimationEnd: (firstPlayer: Player) => void;
    equippedSkin: string;
}

const FirstMoveAnimation: React.FC<FirstMoveAnimationProps> = ({ onAnimationEnd, equippedSkin }) => {
    const [winner, setWinner] = useState<Player | null>(null);
    const firstPlayer = useMemo(() => Math.random() < 0.5 ? Player.Red : Player.Black, []);

    useEffect(() => {
        audioService.playDecidingSound();
        const timer = setTimeout(() => {
            setWinner(firstPlayer);
             if (firstPlayer === Player.Red) {
                audioService.playFirstMovePlayerSound();
            } else {
                audioService.playFirstMoveAISound();
            }
            setTimeout(() => onAnimationEnd(firstPlayer), 2000);
        }, 1500);
        return () => clearTimeout(timer);
    }, [firstPlayer, onAnimationEnd]);
    
    return (
        <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center rounded-lg z-50">
            <div className="relative w-48 h-24">
                <div className={`absolute top-0 w-24 h-24 transition-all duration-500 ease-out flex items-center justify-center ${winner ? (winner === Player.Red ? 'left-1/2 -translate-x-1/2 scale-125' : 'left-0 opacity-0 -translate-x-full') : 'left-0 animate-slide-in-left'}`}>
                    <PieceComponent 
                        piece={redGeneral}
                        isSelected={false}
                        isLastMove={false}
                        onPieceClick={() => {}}
                        onPieceDragStart={() => {}}
                        equippedSkin={equippedSkin}
                        isDraggable={false}
                    />
                </div>
                <div className={`absolute top-0 w-24 h-24 transition-all duration-500 ease-out flex items-center justify-center ${winner ? (winner === Player.Black ? 'left-1/2 -translate-x-1/2 scale-125' : 'right-0 opacity-0 translate-x-full') : 'right-0 animate-slide-in-right'}`}>
                    <PieceComponent 
                        piece={blackGeneral}
                        isSelected={false}
                        isLastMove={false}
                        onPieceClick={() => {}}
                        onPieceDragStart={() => {}}
                        equippedSkin={equippedSkin}
                        isDraggable={false}
                    />
                </div>
            </div>
            <p className="text-white font-semibold text-xl mt-4 transition-opacity duration-300">
                {winner ? `${winner === Player.Red ? 'Bạn đi' : 'AI đi'} trước!` : 'Đang quyết định ai đi trước...'}
            </p>
            <style>{`
                @keyframes slide-in-left { 0% { transform: translateX(-100vw); } 80% { transform: translateX(0); } 100% { transform: translateX(0); }}
                @keyframes slide-in-right { 0% { transform: translateX(100vw); } 80% { transform: translateX(0); } 100% { transform: translateX(0); }}
                .animate-slide-in-left { animation: slide-in-left 1s cubic-bezier(0.25, 1, 0.5, 1); }
                .animate-slide-in-right { animation: slide-in-right 1s cubic-bezier(0.25, 1, 0.5, 1); }
            `}</style>
        </div>
    );
};

// --- Entry Screen Component ---
interface EntryScreenProps {
  onEnter: () => void;
}

const EntryScreen: React.FC<EntryScreenProps> = ({ onEnter }) => {
  return (
    <div className="absolute inset-0 bg-[#0F172A] flex flex-col items-center justify-center z-[100] font-sans">
        <h1 className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-cyan-400 text-center">
            Cờ Tướng AI Arena
        </h1>
        <p className="text-gray-400 mt-2 text-lg text-center">Một trận chiến trí tuệ bên kia sông.</p>
        <button 
            onClick={onEnter} 
            className="mt-12 text-2xl font-bold bg-cyan-500 text-black py-4 px-10 rounded-lg transition-transform hover:scale-105 animate-pulse shadow-lg shadow-cyan-500/30"
        >
            CHƠI NGAY!
        </button>
    </div>
  );
};


const App: React.FC = () => {
    const [initialState] = useState(getInitialState);
    
    const [view, setView] = useState<GameView>('menu');
    const [previousView, setPreviousView] = useState<GameView | null>(null);
    const [pieces, setPieces] = useState<Piece[]>(INITIAL_PIECES);
    const [currentPlayer, setCurrentPlayer] = useState<Player>(Player.Red);
    const [selectedPiece, setSelectedPiece] = useState<Piece | null>(null);
    const [validMoves, setValidMoves] = useState<Position[]>([]);
    const [lastMove, setLastMove] = useState<Move | null>(null);
    const [gameState, setGameState] = useState<'playing' | 'check' | 'checkmate'>('playing');
    const [winner, setWinner] = useState<Player | null>(null);
    const [moveHistory, setMoveHistory] = useState<Piece[][]>([JSON.parse(JSON.stringify(INITIAL_PIECES))]);
    const [hintMove, setHintMove] = useState<Move | null>(null);
    const [aiThinkingMove, setAiThinkingMove] = useState<Move | null>(null);
    const [currentOpponent, setCurrentOpponent] = useState<AIOpponent | null>(AI_OPPONENTS[0]);
    const [aiDifficulty, setAiDifficulty] = useState<AIDifficulty>('easy');

    // Player Stats & Customization
    const [playerName, setPlayerName] = useState(initialState.playerName);
    const [playerXP, setPlayerXP] = useState(initialState.playerXP);
    const [playerCoins, setPlayerCoins] = useState(initialState.playerCoins);
    const [wins, setWins] = useState(initialState.wins);
    const [losses, setLosses] = useState(initialState.losses);
    const [ownedSkins, setOwnedSkins] = useState(initialState.ownedSkins);
    const [equippedSkin, setEquippedSkin] = useState(initialState.equippedSkin);
    const [ownedAvatars, setOwnedAvatars] = useState(initialState.ownedAvatars);
    const [equippedAvatar, setEquippedAvatar] = useState(initialState.equippedAvatar);
    const [ownedThemes, setOwnedThemes] = useState(initialState.ownedThemes);
    const [equippedTheme, setEquippedTheme] = useState(initialState.equippedTheme);
    const [ownedEmojis, setOwnedEmojis] = useState(initialState.ownedEmojis);


    // Modals, Popups & Timers
    const [showEntryScreen, setShowEntryScreen] = useState(true);
    const [showEndGameModal, setShowEndGameModal] = useState(false);
    const [showEndGameAnimation, setShowEndGameAnimation] = useState<'win' | 'lose' | null>(null);
    const [showFirstMoveAnimation, setShowFirstMoveAnimation] = useState(false);
    const [showCheckWarning, setShowCheckWarning] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [showResignConfirm, setShowResignConfirm] = useState(false);
    const [animatingEmoji, setAnimatingEmoji] = useState<{emoji: string, from: 'player' | 'ai'} | null>(null);
    const [gameDuration, setGameDuration] = useState(initialState.gameDuration);
    const [turnDuration, setTurnDuration] = useState(initialState.turnDuration);
    const [gameTimer, setGameTimer] = useState(gameDuration);
    const [turnTimer, setTurnTimer] = useState(turnDuration);
    const [lastGameResult, setLastGameResult] = useState({ xpGained: 0, coinsGained: 0, initialXP: 0 });
    
    // Settings State
    const [soundEnabled, setSoundEnabled] = useState(initialState.soundEnabled);
    const [musicEnabled, setMusicEnabled] = useState(initialState.musicEnabled);
    const [musicTrack, setMusicTrack] = useState(initialState.musicTrack);
    const [soundVolume, setSoundVolume] = useState(initialState.soundVolume);
    const [musicVolume, setMusicVolume] = useState(initialState.musicVolume);

    // Save state to localStorage on change
    useEffect(() => {
        const dataToSave: SavedPlayerData = {
            playerName, playerXP, playerCoins, wins, losses,
            ownedSkins, equippedSkin, ownedAvatars, equippedAvatar,
            ownedThemes, equippedTheme, ownedEmojis,
            soundEnabled, musicEnabled, musicTrack, soundVolume, musicVolume,
            gameDuration, turnDuration,
        };

        try {
            localStorage.setItem('chessAiArenaData', JSON.stringify(dataToSave));
        } catch (error) {
            console.error("Failed to save data to localStorage", error);
        }
    }, [
        playerName, playerXP, playerCoins, wins, losses,
        ownedSkins, equippedSkin, ownedAvatars, equippedAvatar,
        ownedThemes, equippedTheme, ownedEmojis,
        soundEnabled, musicEnabled, musicTrack, soundVolume, musicVolume,
        gameDuration, turnDuration
    ]);

    // Audio Effects
    useEffect(() => { audioService.setSoundEnabled(soundEnabled); }, [soundEnabled]);
    useEffect(() => { audioService.setMusicEnabled(musicEnabled && (view === 'menu' || view === 'game')); }, [musicEnabled, view]);
    useEffect(() => { audioService.setSoundVolume(soundVolume); }, [soundVolume]);
    useEffect(() => { audioService.setMusicVolume(musicVolume); }, [musicVolume]);
    useEffect(() => { audioService.changeMusic(musicTrack) }, [musicTrack]);


    // Navigation
    const startGame = (difficulty: AIDifficulty) => {
        audioService.playClickSound();
        const opponent = AI_OPPONENTS.find(o => o.difficulty === difficulty);
        if (opponent) {
            setCurrentOpponent(opponent);
        }
        setAiDifficulty(difficulty);
        handleReset(false);
        setView('game');
        setShowFirstMoveAnimation(true);
    };

    const handleNavigate = (newView: GameView) => {
        audioService.playClickSound();
        if (view === 'game' || view === 'menu') {
            setPreviousView(view);
        }
        setView(newView);
    };
    
    const handleBack = () => {
        audioService.playClickSound();
        if (previousView) {
            setView(previousView);
            setPreviousView(null);
        } else {
            setView('menu');
        }
    };
    
    // Timer Logic
    useEffect(() => {
        if (gameState !== 'playing' && gameState !== 'check' || view !== 'game' || showFirstMoveAnimation) return;
        
        const turnInterval = setInterval(() => {
            setTurnTimer(t => (t > 0 ? t - 1 : 0));
        }, 1000);
        
        const gameInterval = (currentPlayer === Player.Red) ? setInterval(() => {
            setGameTimer(t => (t > 0 ? t - 1 : 0));
        }, 1000) : undefined;
        
        return () => {
            clearInterval(turnInterval);
            if (gameInterval) clearInterval(gameInterval);
        };
    }, [currentPlayer, gameState, view, showFirstMoveAnimation]);

    const endGame = useCallback((gameWinner: Player) => {
        setWinner(gameWinner);
        setGameState('checkmate');
        setShowEndGameAnimation(gameWinner === Player.Red ? 'win' : 'lose');
        
        const isWin = gameWinner === Player.Red;
        if (isWin) {
            audioService.playWinSound();
        } else {
            audioService.playLoseSound();
        }

        const xpGained = isWin ? 20 : 5;
        const coinsGained = isWin ? 25 : 10;

        if (isWin) {
            setWins(w => w + 1);
        } else {
            setLosses(l => l + 1);
        }

        setLastGameResult({ xpGained, coinsGained, initialXP: playerXP });

        setTimeout(() => {
            setPlayerXP(xp => xp + xpGained);
            setPlayerCoins(c => c + coinsGained);
            setShowEndGameModal(true);
            setShowEndGameAnimation(null);
        }, 3000);
    }, [playerXP]);

    useEffect(() => {
        if (gameState === 'checkmate') return;

        if (turnTimer === 0) {
            const winnerByTime = currentPlayer === Player.Red ? Player.Black : Player.Red;
            endGame(winnerByTime);
        } else if (gameTimer === 0) {
            endGame(Player.Black);
        }
    }, [turnTimer, gameTimer, currentPlayer, gameState, endGame]);

    const handleReset = useCallback((playSound = true) => {
        if (playSound) audioService.playClickSound();
        const initialPiecesState = JSON.parse(JSON.stringify(INITIAL_PIECES));
        setPieces(initialPiecesState);
        setCurrentPlayer(Player.Red);
        setSelectedPiece(null);
        setValidMoves([]);
        setLastMove(null);
        setGameState('playing');
        setWinner(null);
        setShowEndGameModal(false);
        setShowEndGameAnimation(null);
        setShowCheckWarning(false);
        setHintMove(null);
        setAiThinkingMove(null);
        setMoveHistory([initialPiecesState]);
        setGameTimer(gameDuration);
        setTurnTimer(turnDuration);
        setShowFirstMoveAnimation(true);
    }, [gameDuration, turnDuration]);
    
    const nextTurn = useCallback((currentPieces: Piece[], nextPlayer: Player) => {
        setCurrentPlayer(nextPlayer);
        setSelectedPiece(null);
        setValidMoves([]);
        setTurnTimer(turnDuration);

        if (isCheckmate(currentPieces, nextPlayer)) {
            const gameWinner = nextPlayer === Player.Red ? Player.Black : Player.Red;
            endGame(gameWinner);
        } else if (isCheck(currentPieces, nextPlayer)) {
            setGameState('check');
            audioService.playCheckSound();
            setShowCheckWarning(true);
            setTimeout(() => setShowCheckWarning(false), 2000);
        } else {
            setGameState('playing');
        }
    }, [endGame, turnDuration]);

    const makeMove = useCallback((from: Position, to: Position) => {
        const pieceToMove = pieces.find(p => p.position.x === from.x && p.position.y === from.y);
        if (!pieceToMove) return;

        const isCapture = pieces.some(p => p.position.x === to.x && p.position.y === to.y);
        if (isCapture) {
            audioService.playCaptureSound();
        } else {
            audioService.playMoveSound();
        }

        const newPieces = pieces.filter(p => !(p.position.x === to.x && p.position.y === to.y));
        const movedPieces = newPieces.map(p => 
            p.id === pieceToMove.id ? { ...p, position: to } : p
        );

        setPieces(movedPieces);
        setLastMove({ from, to });
        setHintMove(null);
        setMoveHistory(hist => [...hist, JSON.parse(JSON.stringify(movedPieces))]);
        
        const nextPlayer = currentPlayer === Player.Red ? Player.Black : Player.Red;
        nextTurn(movedPieces, nextPlayer);
    }, [pieces, currentPlayer, nextTurn]);

    useEffect(() => {
        if (currentPlayer === Player.Black && (gameState === 'playing' || gameState === 'check') && view === 'game' && !showFirstMoveAnimation) {
            const performAiMove = async () => {
                await new Promise(resolve => setTimeout(resolve, 500));
                
                const aiResult = await getLocalAIMove(
                    pieces, 
                    Player.Black, 
                    moveHistory,
                    aiDifficulty,
                    (move) => setAiThinkingMove(move)
                );

                setAiThinkingMove(null);

                if (aiResult && aiResult.move) {
                    makeMove(aiResult.move.from, aiResult.move.to);
                    if (aiResult.emoji) {
                        setTimeout(() => {
                            setAnimatingEmoji({ emoji: aiResult.emoji!, from: 'ai' });
                            setTimeout(() => setAnimatingEmoji(null), 3500);
                        }, 700);
                    }
                } else {
                    endGame(Player.Red);
                }
            };
            performAiMove();
        }
    }, [currentPlayer, pieces, gameState, makeMove, view, endGame, moveHistory, showFirstMoveAnimation, aiDifficulty]);

    const handleSquareClick = (pos: Position) => {
        if (gameState === 'checkmate' || currentPlayer !== Player.Red || showEndGameAnimation || showFirstMoveAnimation) return;

        const clickedPiece = pieces.find(p => p.position.x === pos.x && p.position.y === pos.y);

        if (selectedPiece) {
            const isValid = validMoves.some(move => move.x === pos.x && move.y === pos.y);
            if (isValid) {
                makeMove(selectedPiece.position, pos);
            } else if (clickedPiece && clickedPiece.player === currentPlayer) {
                audioService.playSelectSound();
                setSelectedPiece(clickedPiece);
                setValidMoves(getValidMoves(pieces, clickedPiece));
            } else {
                setSelectedPiece(null);
                setValidMoves([]);
            }
        } else {
            if (clickedPiece && clickedPiece.player === currentPlayer) {
                audioService.playSelectSound();
                setSelectedPiece(clickedPiece);
                setValidMoves(getValidMoves(pieces, clickedPiece));
            }
        }
    };

    const handlePieceDragStart = (piece: Piece) => {
        if (gameState === 'checkmate' || piece.player !== Player.Red || showEndGameAnimation || showFirstMoveAnimation) return;
        audioService.playSelectSound();
        setSelectedPiece(piece);
        setValidMoves(getValidMoves(pieces, piece));
    };

    const handleUndo = () => {
        audioService.playClickSound();
        if (moveHistory.length < 3 || currentPlayer !== Player.Red || showEndGameAnimation || showFirstMoveAnimation) return;
    
        const stateBeforePlayerMove = moveHistory[moveHistory.length - 3];
    
        setPieces(stateBeforePlayerMove);
        setMoveHistory(hist => hist.slice(0, -2));
        
        const isNowInCheck = isCheck(stateBeforePlayerMove, Player.Red);
        if (isNowInCheck) {
            audioService.playCheckSound();
        }

        setCurrentPlayer(Player.Red);
        setGameState(isNowInCheck ? 'check' : 'playing');
        setSelectedPiece(null);
        setValidMoves([]);
        setLastMove(null);
        setTurnTimer(turnDuration);
    };

    const handleHint = async () => {
        audioService.playClickSound();
        if (currentPlayer !== Player.Red || gameState === 'checkmate' || hintMove) return;
        const hintResult = await getLocalAIMove(pieces, Player.Red, moveHistory, 'easy', () => {});
        if (hintResult && hintResult.move) {
            setHintMove(hintResult.move);
            setTimeout(() => setHintMove(null), 3000);
        }
    };

    const handleBuyItem = (item: Skin | Avatar | Theme | EmojiItem, type: 'skin' | 'avatar' | 'theme' | 'emoji') => {
        audioService.playClickSound();
        if (playerCoins < item.price) return;
        setPlayerCoins(c => c - item.price);
        if (type === 'skin') setOwnedSkins(s => [...s, item.id]);
        if (type === 'avatar') setOwnedAvatars(a => [...a, item.id]);
        if (type === 'theme') setOwnedThemes(t => [...t, item.id]);
        if (type === 'emoji') setOwnedEmojis(e => [...e, item.id]);
    };
    const handleEquipItem = (itemId: string, type: 'skin' | 'avatar' | 'theme') => {
        audioService.playClickSound();
        if (type === 'skin') setEquippedSkin(itemId);
        if (type === 'avatar') setEquippedAvatar(itemId);
        if (type === 'theme') setEquippedTheme(itemId);
    };

    const handleResign = () => {
        audioService.playClickSound();
        setShowResignConfirm(true);
    };
    
    const confirmResign = () => {
        audioService.playClickSound();
        setShowResignConfirm(false);
        setIsSettingsOpen(false);
        endGame(Player.Black);
    };
    
    const handleSelectEmoji = (emoji: string) => {
        audioService.playClickSound();
        setAnimatingEmoji({ emoji, from: 'player' });
        setTimeout(() => setAnimatingEmoji(null), 3500);
    }
    
    const handleFirstMoveDecided = (firstPlayer: Player) => {
        setCurrentPlayer(firstPlayer);
        setShowFirstMoveAnimation(false);
    };

    const handleEnterApp = () => {
        audioService.unlockAudio();
        setShowEntryScreen(false);
    };

    const playerAvatarUrl = AVATAR_ITEMS.find(a => a.id === equippedAvatar)?.url || 'https://i.pravatar.cc/150?u=player1';

    const { capturedRedPieces, capturedBlackPieces } = useMemo(() => {
        const currentPieceIds = new Set(pieces.map(p => p.id));
        const captured = INITIAL_PIECES.filter(p => !currentPieceIds.has(p.id));
        return {
            capturedRedPieces: captured.filter(p => p.player === Player.Red).sort((a,b) => a.id - b.id),
            capturedBlackPieces: captured.filter(p => p.player === Player.Black).sort((a,b) => a.id - b.id)
        };
    }, [pieces]);

    const renderView = () => {
        switch(view) {
            case 'shop':
                return <Shop 
                    playerCoins={playerCoins}
                    ownedSkins={ownedSkins}
                    ownedAvatars={ownedAvatars}
                    ownedThemes={ownedThemes}
                    ownedEmojis={ownedEmojis}
                    onBuyItem={handleBuyItem}
                    onBack={handleBack}
                />;
            case 'inventory':
                return <Inventory
                    ownedSkins={ownedSkins}
                    equippedSkin={equippedSkin}
                    ownedAvatars={ownedAvatars}
                    equippedAvatar={equippedAvatar}
                    ownedThemes={ownedThemes}
                    equippedTheme={equippedTheme}
                    ownedEmojis={ownedEmojis}
                    onEquipItem={handleEquipItem}
                    onBack={handleBack}
                />;
            case 'game':
                return (
                    <div className="min-h-screen w-full bg-[#0F172A] text-white flex flex-col items-center justify-start pt-1 px-2 sm:px-4 font-sans relative overflow-hidden">
                         <style>{`
                            @keyframes fade-in-out-fast {
                                0% { opacity: 0; transform: scale(0.8); }
                                20% { opacity: 1; transform: scale(1.1); }
                                80% { opacity: 1; transform: scale(1); }
                                100% { opacity: 0; transform: scale(0.9); }
                            }
                            .animate-check-warning { animation: fade-in-out-fast 2s ease-in-out forwards; }
                            @keyframes fall-and-settle {
                                0% { transform: translateY(-50px) scale(0.3); opacity: 0; }
                                50% { transform: translateY(calc(50vh - 120px)) scale(1.1); opacity: 1; animation-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1); }
                                65% { transform: translateY(calc(50vh - 150px)) scale(0.95); animation-timing-function: ease-in; }
                                80% { transform: translateY(calc(50vh - 120px)) scale(1); opacity: 1; }
                                90% { transform: translateY(calc(50vh - 120px)) scale(1); opacity: 1; }
                                100% { transform: translateY(calc(50vh - 110px)) scale(0.9); opacity: 0; }
                            }
                            .animate-fall-and-settle { animation: fall-and-settle 3.5s ease-out forwards; }
                            @keyframes sun-shimmer {
                                0% { transform: rotate(45deg) translate(-100%, -100%); }
                                100% { transform: rotate(45deg) translate(100%, 100%); }
                            }
                            .animate-sun-shimmer { animation: sun-shimmer 12s linear infinite; }
                            
                            /* New Win/Loss Animations */
                            @keyframes confetti-fall {
                                0% { transform: translateY(-10vh) rotateZ(0deg); opacity: 1; }
                                100% { transform: translateY(100vh) rotateZ(360deg); opacity: 0; }
                            }
                            .confetti {
                                position: absolute;
                                width: 10px;
                                height: 10px;
                                background-color: #fde047;
                                opacity: 0;
                                animation: confetti-fall 3s linear infinite;
                            }
                            @keyframes banner-in {
                                0% { transform: scaleX(0); opacity: 0; }
                                100% { transform: scaleX(1); opacity: 1; }
                            }
                            .animate-banner-in { animation: banner-in 0.5s 0.2s ease-out forwards; }

                            @keyframes win-text-in {
                                0% { transform: scale(0.5); opacity: 0; }
                                50% { transform: scale(1.2); opacity: 1; }
                                100% { transform: scale(1); opacity: 1; }
                            }
                            @keyframes win-text-shimmer {
                                0%, 100% { text-shadow: 0 0 8px #fde047, 0 0 16px #facc15, 0 0 24px #eab308; }
                                50% { text-shadow: 0 0 16px #fde047, 0 0 24px #facc15, 0 0 32px #eab308, 0 0 40px #ca8a04; }
                            }
                            .animate-win-text { 
                                animation: win-text-in 1s ease-out forwards, win-text-shimmer 2s ease-in-out infinite; 
                            }

                            @keyframes lose-popup-in {
                                0% { transform: scale(0.7) translateY(20px); opacity: 0; }
                                100% { transform: scale(1) translateY(0); opacity: 1; }
                            }
                            .animate-lose-popup { animation: lose-popup-in 0.4s ease-out forwards; }
                        `}</style>

                        {showFirstMoveAnimation && (
                            <FirstMoveAnimation 
                                onAnimationEnd={handleFirstMoveDecided}
                                equippedSkin={equippedSkin}
                            />
                        )}

                        <GameHeader 
                            playerName={playerName}
                            playerAvatarUrl={playerAvatarUrl}
                            currentPlayer={currentPlayer} 
                            winner={winner}
                            gameTimer={gameTimer}
                            turnTimer={turnTimer}
                            turnDuration={turnDuration}
                            wins={wins}
                            losses={losses}
                            onUndo={handleUndo}
                            onOpenSettings={() => {
                                audioService.playClickSound();
                                setIsSettingsOpen(true);
                            }}
                            onSelectEmoji={handleSelectEmoji}
                            ownedEmojis={ownedEmojis}
                            onHint={handleHint}
                            onResign={handleResign}
                            opponent={currentOpponent}
                        />

                        <div className="relative w-full max-w-sm md:max-w-md mx-auto mt-5 sm:mt-7 transition-all duration-500">
                            <Board
                                pieces={pieces}
                                selectedPiece={selectedPiece}
                                validMoves={validMoves}
                                lastMove={lastMove}
                                hintMove={hintMove}
                                aiThinkingMove={aiThinkingMove}
                                onSquareClick={handleSquareClick}
                                onPieceDragStart={handlePieceDragStart}
                                equippedSkin={equippedSkin}
                                equippedTheme={equippedTheme}
                                currentPlayer={currentPlayer}
                            />
                             {showEndGameAnimation && (
                                <div className="absolute inset-0 flex items-center justify-center z-40 pointer-events-none">
                                    {showEndGameAnimation === 'win' && (
                                        <>
                                            {Array.from({ length: 50 }).map((_, i) => (
                                                <div key={i} className="confetti" style={{ left: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 3}s`, animationDuration: `${2 + Math.random() * 2}s`, backgroundColor: ['#fde047', '#f9a8d4', '#67e8f9'][i%3] }}></div>
                                            ))}
                                            <div className="absolute w-full max-w-md h-32 bg-gradient-to-r from-transparent via-yellow-900/50 to-transparent animate-banner-in">
                                                <div className="absolute inset-0 bg-repeat bg-center opacity-10" style={{backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23fbbf24\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'}}></div>
                                            </div>
                                            <h1 className="text-5xl md:text-6xl font-extrabold text-yellow-300 animate-win-text">
                                                BẠN THẮNG!
                                            </h1>
                                        </>
                                    )}
                                    {showEndGameAnimation === 'lose' && (
                                        <div className="bg-slate-900/90 border-2 border-red-500 rounded-lg p-6 shadow-2xl animate-lose-popup">
                                            <h1 className="text-4xl md:text-5xl font-extrabold text-red-500" style={{textShadow: '0 0 10px #000'}}>
                                                BẠN THUA!
                                            </h1>
                                        </div>
                                    )}
                                </div>
                            )}
                            {showCheckWarning && (
                                <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
                                    <h2 className="text-2xl md:text-3xl font-bold text-yellow-400 animate-check-warning" style={{ textShadow: '0 0 10px #000' }}>
                                        Chiếu tướng!
                                    </h2>
                                </div>
                            )}
                            {showEndGameModal && winner && (
                                <EndGameModal 
                                    winner={winner} 
                                    onPlayAgain={handleReset}
                                    onLeaveRoom={handleBack}
                                    initialXP={lastGameResult.initialXP}
                                    xpGained={lastGameResult.xpGained}
                                    coinsGained={lastGameResult.coinsGained}
                                />
                            )}
                        </div>

                        <div className="w-full max-w-sm md:max-w-md mx-auto mt-2 grid grid-cols-2 gap-2 h-20">
                            <div className="bg-slate-800/30 rounded p-1 flex flex-wrap-reverse content-start items-start gap-1">
                                {capturedBlackPieces.map(piece => (
                                    <div key={piece.id} title={piece.type} className="w-7 h-7 rounded-full flex items-center justify-center bg-gradient-to-b from-gray-700 to-gray-900 border border-black shadow-sm">
                                        <span className="text-white text-lg font-bold" style={{textShadow: '1px 1px 2px #000'}}>{PIECE_UNICODE[piece.player][piece.type]}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="bg-slate-800/30 rounded p-1 flex flex-wrap-reverse content-start items-start gap-1">
                                {capturedRedPieces.map(piece => (
                                    <div key={piece.id} title={piece.type} className="w-7 h-7 rounded-full flex items-center justify-center bg-gradient-to-b from-red-500 to-red-800 border border-red-900 shadow-sm">
                                        <span className="text-white text-lg font-bold" style={{textShadow: '1px 1px 2px #000'}}>{PIECE_UNICODE[piece.player][piece.type]}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        
                        {animatingEmoji && (
                             <div className={`absolute top-0 h-full w-24 z-30 pointer-events-none ${animatingEmoji.from === 'player' ? 'left-[calc(50%-13rem)]' : 'right-[calc(50%-13rem)]'} `}>
                                <div className="relative w-full h-full">
                                    <span className="absolute top-[60px] text-7xl animate-fall-and-settle" style={{ textShadow: '0 0 15px rgba(0,0,0,0.5)' }}>
                                        {animatingEmoji.emoji}
                                    </span>
                                </div>
                            </div>
                        )}
                       
                         {showResignConfirm && (
                            <ConfirmModal
                                title="Đầu Hàng"
                                message="Bạn có chắc muốn đầu hàng không? Điều này sẽ được tính là một trận thua."
                                onConfirm={confirmResign}
                                onCancel={() => {
                                    audioService.playClickSound();
                                    setShowResignConfirm(false);
                                }}
                            />
                        )}
                    </div>
                );
            case 'menu':
            default:
                return <Menu 
                    playerName={playerName}
                    onSetName={setPlayerName}
                    onStartGame={startGame} 
                    onGoToShop={() => handleNavigate('shop')}
                    onGoToInventory={() => handleNavigate('inventory')}
                    onOpenSettings={() => {
                        audioService.playClickSound();
                        setIsSettingsOpen(true);
                    }}
                    playerAvatarUrl={playerAvatarUrl}
                    playerXP={playerXP}
                    playerCoins={playerCoins}
                    wins={wins}
                    losses={losses}
                />;
        }
    }

    return (
        <div className="w-full min-h-screen bg-[#0F172A]">
            {showEntryScreen && <EntryScreen onEnter={handleEnterApp} />}
            <div className={showEntryScreen ? 'opacity-0 pointer-events-none' : 'opacity-100 transition-opacity duration-700'}>
                {renderView()}
                {isSettingsOpen && (
                    <SettingsModal
                        context={view === 'game' ? 'game' : 'menu'}
                        soundEnabled={soundEnabled}
                        onToggleSound={() => {
                            audioService.playClickSound();
                            setSoundEnabled(p => !p);
                        }}
                        musicEnabled={musicEnabled}
                        onToggleMusic={() => {
                            audioService.playClickSound();
                            setMusicEnabled(p => !p);
                        }}
                        selectedTrack={musicTrack}
                        onSelectTrack={setMusicTrack}
                        soundVolume={soundVolume}
                        onSetSoundVolume={setSoundVolume}
                        musicVolume={musicVolume}
                        onSetMusicVolume={setMusicVolume}
                        gameDuration={gameDuration}
                        onSetGameDuration={setGameDuration}
                        turnDuration={turnDuration}
                        onSetTurnDuration={setTurnDuration}
                        onClose={() => {
                            audioService.playClickSound();
                            setIsSettingsOpen(false);
                        }}
                        onGoToShop={() => {
                            handleNavigate('shop');
                            setIsSettingsOpen(false);
                        }}
                        onGoToInventory={() => {
                            handleNavigate('inventory');
                            setIsSettingsOpen(false);
                        }}
                    />
                )}
            </div>
        </div>
    );
};

export default App;