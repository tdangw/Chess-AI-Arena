
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Player, Piece, Position, Move, Skin, Avatar, Theme, EmojiItem, PieceType } from './types';
import Board from './components/Board';
import Menu from './components/Menu';
import Shop from './components/Shop';
import Inventory from './components/Inventory';
import GameHeader from './components/GameHeader';
import EndGameModal from './components/EndGameModal';
import SettingsModal from './components/SettingsModal';
import PieceComponent from './components/Piece';
import { INITIAL_PIECES, TURN_DURATION_SECONDS, AVATAR_ITEMS, EMOJI_ITEMS, DEFAULT_GAME_TIME_SECONDS } from './constants';
import { getValidMoves, isCheckmate, isCheck } from './services/gameLogic';
import { getLocalAIMove } from './services/localAi';

type GameView = 'menu' | 'game' | 'shop' | 'inventory';

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
        const timer = setTimeout(() => {
            setWinner(firstPlayer);
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
                {winner ? `${winner === Player.Red ? 'You go' : 'AI goes'} first!` : 'Deciding who goes first...'}
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


const App: React.FC = () => {
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

    // Player Stats & Customization
    const [playerName, setPlayerName] = useState('Player_5566');
    const [playerXP, setPlayerXP] = useState(50);
    const [playerCoins, setPlayerCoins] = useState(9950);
    const [wins, setWins] = useState(0);
    const [losses, setLosses] = useState(10);
    const [ownedSkins, setOwnedSkins] = useState<string[]>(['default']);
    const [equippedSkin, setEquippedSkin] = useState<string>('default');
    const [ownedAvatars, setOwnedAvatars] = useState<string[]>(['player1']);
    const [equippedAvatar, setEquippedAvatar] = useState<string>('player1');
    const [ownedThemes, setOwnedThemes] = useState<string[]>(['default']);
    const [equippedTheme, setEquippedTheme] = useState<string>('default');
    const [ownedEmojis, setOwnedEmojis] = useState<string[]>(['e1', 'e2', 'e3', 'e4', 'e5', 'e6', 'e7', 'e8']);


    // Modals, Popups & Timers
    const [showEndGameModal, setShowEndGameModal] = useState(false);
    const [showEndGameAnimation, setShowEndGameAnimation] = useState<'win' | 'lose' | null>(null);
    const [showFirstMoveAnimation, setShowFirstMoveAnimation] = useState(false);
    const [showCheckWarning, setShowCheckWarning] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [animatingEmoji, setAnimatingEmoji] = useState<{emoji: string, from: 'player' | 'ai'} | null>(null);
    const [gameDuration, setGameDuration] = useState(DEFAULT_GAME_TIME_SECONDS);
    const [turnDuration, setTurnDuration] = useState(TURN_DURATION_SECONDS);
    const [gameTimer, setGameTimer] = useState(gameDuration);
    const [turnTimer, setTurnTimer] = useState(turnDuration);
    const [lastGameResult, setLastGameResult] = useState({ xpGained: 0, coinsGained: 0, initialXP: 0 });
    
    // Settings State
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [musicEnabled, setMusicEnabled] = useState(true);
    const [musicTrack, setMusicTrack] = useState('Celestial');

    // Navigation
    const startGame = () => {
        handleReset();
        setView('game');
        setShowFirstMoveAnimation(true);
    };

    const handleNavigate = (newView: GameView) => {
        if (view === 'game' || view === 'menu') {
            setPreviousView(view);
        }
        setView(newView);
    };
    
    const handleBack = () => {
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
        
        let gameInterval: number | undefined;
        if (currentPlayer === Player.Red) { // Only tick game timer for the human player
            gameInterval = setInterval(() => {
                setGameTimer(t => (t > 0 ? t - 1 : 0));
            }, 1000);
        }
        
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
        }, 3000); // Show modal after 3s animation
    }, [playerXP]);

    useEffect(() => {
        if (gameState === 'checkmate') return;

        if (turnTimer === 0) {
            const winnerByTime = currentPlayer === Player.Red ? Player.Black : Player.Red;
            endGame(winnerByTime);
        } else if (gameTimer === 0) {
            endGame(Player.Black); // Player ran out of total time
        }
    }, [turnTimer, gameTimer, currentPlayer, gameState, endGame]);

    const handleReset = useCallback(() => {
        const initialPiecesState = JSON.parse(JSON.stringify(INITIAL_PIECES));
        setPieces(initialPiecesState);
        setCurrentPlayer(Player.Red); // Default starter, will be overwritten by animation
        setSelectedPiece(null);
        setValidMoves([]);
        setLastMove(null);
        setGameState('playing');
        setWinner(null);
        setShowEndGameModal(false);
        setShowEndGameAnimation(null);
        setShowCheckWarning(false);
        setHintMove(null);
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
            setShowCheckWarning(true);
            setTimeout(() => setShowCheckWarning(false), 2000); // Hide warning after 2s
        } else {
            setGameState('playing');
        }
    }, [endGame, turnDuration]);

    const makeMove = useCallback((from: Position, to: Position) => {
        const pieceToMove = pieces.find(p => p.position.x === from.x && p.position.y === from.y);
        if (!pieceToMove) return;

        const newPieces = pieces.filter(p => !(p.position.x === to.x && p.position.y === to.y));
        const movedPieces = newPieces.map(p => 
            p.id === pieceToMove.id ? { ...p, position: to } : p
        );

        setPieces(movedPieces);
        setLastMove({ from, to });
        setHintMove(null); // Clear hint after move
        setMoveHistory(hist => [...hist, JSON.parse(JSON.stringify(movedPieces))]);
        
        const nextPlayer = currentPlayer === Player.Red ? Player.Black : Player.Red;
        nextTurn(movedPieces, nextPlayer);
    }, [pieces, currentPlayer, nextTurn]);

    // AI Move Effect
    useEffect(() => {
        if (currentPlayer === Player.Black && (gameState === 'playing' || gameState === 'check') && view === 'game' && !showFirstMoveAnimation) {
            const performAiMove = () => {
                const aiResult = getLocalAIMove(pieces, Player.Black, moveHistory);
                if (aiResult && aiResult.move) {
                    makeMove(aiResult.move.from, aiResult.move.to);
                    if (aiResult.emoji) {
                        setTimeout(() => {
                            setAnimatingEmoji({ emoji: aiResult.emoji, from: 'ai' });
                            setTimeout(() => setAnimatingEmoji(null), 3500);
                        }, 700);
                    }
                } else {
                    endGame(Player.Red);
                }
            };
            const timer = setTimeout(performAiMove, 500);
            return () => clearTimeout(timer);
        }
    }, [currentPlayer, pieces, gameState, makeMove, view, endGame, moveHistory, showFirstMoveAnimation]);

    const handleSquareClick = (pos: Position) => {
        if (gameState === 'checkmate' || currentPlayer !== Player.Red || showEndGameAnimation || showFirstMoveAnimation) return;

        const clickedPiece = pieces.find(p => p.position.x === pos.x && p.position.y === pos.y);

        if (selectedPiece) {
            const isValid = validMoves.some(move => move.x === pos.x && move.y === pos.y);
            if (isValid) {
                makeMove(selectedPiece.position, pos);
            } else if (clickedPiece && clickedPiece.player === currentPlayer) {
                setSelectedPiece(clickedPiece);
                setValidMoves(getValidMoves(pieces, clickedPiece));
            } else {
                setSelectedPiece(null);
                setValidMoves([]);
            }
        } else {
            if (clickedPiece && clickedPiece.player === currentPlayer) {
                setSelectedPiece(clickedPiece);
                setValidMoves(getValidMoves(pieces, clickedPiece));
            }
        }
    };

    const handlePieceDragStart = (piece: Piece) => {
        if (gameState === 'checkmate' || piece.player !== Player.Red || showEndGameAnimation || showFirstMoveAnimation) return;
        setSelectedPiece(piece);
        setValidMoves(getValidMoves(pieces, piece));
    };

    const handleUndo = () => {
        if (moveHistory.length < 3 || currentPlayer !== Player.Red || showEndGameAnimation || showFirstMoveAnimation) return;
    
        const stateBeforePlayerMove = moveHistory[moveHistory.length - 3];
    
        setPieces(stateBeforePlayerMove);
        setMoveHistory(hist => hist.slice(0, -2));
        
        setCurrentPlayer(Player.Red);
        setGameState(isCheck(stateBeforePlayerMove, Player.Red) ? 'check' : 'playing');
        setSelectedPiece(null);
        setValidMoves([]);
        setLastMove(null);
        setTurnTimer(turnDuration);
    };

    const handleHint = () => {
        if (currentPlayer !== Player.Red || gameState === 'checkmate' || hintMove) return;
        const hintResult = getLocalAIMove(pieces, Player.Red, moveHistory);
        if (hintResult && hintResult.move) {
            setHintMove(hintResult.move);
            setTimeout(() => setHintMove(null), 3000); // Hint visible for 3 seconds
        }
    };

    // Shop & Inventory Logic
    const handleBuyItem = (item: Skin | Avatar | Theme | EmojiItem, type: 'skin' | 'avatar' | 'theme' | 'emoji') => {
        if (playerCoins < item.price) return;
        setPlayerCoins(c => c - item.price);
        if (type === 'skin') setOwnedSkins(s => [...s, item.id]);
        if (type === 'avatar') setOwnedAvatars(a => [...a, item.id]);
        if (type === 'theme') setOwnedThemes(t => [...t, item.id]);
        if (type === 'emoji') setOwnedEmojis(e => [...e, item.id]);
    };
    const handleEquipItem = (itemId: string, type: 'skin' | 'avatar' | 'theme') => {
        if (type === 'skin') setEquippedSkin(itemId);
        if (type === 'avatar') setEquippedAvatar(itemId);
        if (type === 'theme') setEquippedTheme(itemId);
    };

    const handleResign = () => {
        setIsSettingsOpen(false);
        endGame(Player.Black);
    };
    
    const handleSelectEmoji = (emoji: string) => {
        setAnimatingEmoji({ emoji, from: 'player' });
        setTimeout(() => setAnimatingEmoji(null), 3500);
    }
    
    const handleFirstMoveDecided = (firstPlayer: Player) => {
        setCurrentPlayer(firstPlayer);
        setShowFirstMoveAnimation(false);
    };

    const playerAvatarUrl = AVATAR_ITEMS.find(a => a.id === equippedAvatar)?.url || 'https://i.pravatar.cc/150?u=player1';

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
                            @keyframes zoom-in-out {
                                0% { transform: scale(0.5); opacity: 0; }
                                20% { transform: scale(1.2); opacity: 1; }
                                80% { transform: scale(1); opacity: 1; }
                                100% { transform: scale(1.5); opacity: 0; }
                            }
                            .animate-zoom-in-out {
                                animation: zoom-in-out 3s ease-in-out forwards;
                            }
                             @keyframes fade-in-out-fast {
                                0% { opacity: 0; transform: scale(0.8); }
                                20% { opacity: 1; transform: scale(1.1); }
                                80% { opacity: 1; transform: scale(1); }
                                100% { opacity: 0; transform: scale(0.9); }
                            }
                            .animate-check-warning {
                                animation: fade-in-out-fast 2s ease-in-out forwards;
                            }
                            @keyframes fall-and-settle {
                                0% { transform: translateY(-50px) scale(0.3); opacity: 0; }
                                50% { transform: translateY(calc(50vh - 120px)) scale(1.1); opacity: 1; animation-timing-function: cubic-bezier(0.215, 0.61, 0.355, 1); }
                                65% { transform: translateY(calc(50vh - 150px)) scale(0.95); animation-timing-function: ease-in; }
                                80% { transform: translateY(calc(50vh - 120px)) scale(1); opacity: 1; }
                                90% { transform: translateY(calc(50vh - 120px)) scale(1); opacity: 1; }
                                100% { transform: translateY(calc(50vh - 110px)) scale(0.9); opacity: 0; }
                            }
                            .animate-fall-and-settle {
                                animation: fall-and-settle 3.5s ease-out forwards;
                            }
                            @keyframes sun-shimmer {
                                0% { transform: rotate(45deg) translate(-100%, -100%); }
                                100% { transform: rotate(45deg) translate(100%, 100%); }
                            }
                            .animate-sun-shimmer {
                                animation: sun-shimmer 12s linear infinite;
                            }
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
                            onOpenSettings={() => setIsSettingsOpen(true)}
                            onSelectEmoji={handleSelectEmoji}
                            ownedEmojis={ownedEmojis}
                            onHint={handleHint}
                            onResign={handleResign}
                        />

                        <div className="w-full max-w-lg lg:max-w-xl mx-auto mt-4 sm:mt-6">
                            <Board
                                pieces={pieces}
                                selectedPiece={selectedPiece}
                                validMoves={validMoves}
                                lastMove={lastMove}
                                hintMove={hintMove}
                                onSquareClick={handleSquareClick}
                                onPieceDragStart={handlePieceDragStart}
                                equippedSkin={equippedSkin}
                                equippedTheme={equippedTheme}
                                currentPlayer={currentPlayer}
                            />
                        </div>
                        
                        {animatingEmoji && (
                             <div className={`absolute top-0 h-full w-24 z-30 pointer-events-none ${animatingEmoji.from === 'player' ? 'left-[calc(50%-18rem)]' : 'right-[calc(50%-18rem)]'} `}>
                                <div className="relative w-full h-full">
                                    <span className="absolute top-[60px] text-7xl animate-fall-and-settle" style={{ textShadow: '0 0 15px rgba(0,0,0,0.5)' }}>
                                        {animatingEmoji.emoji}
                                    </span>
                                </div>
                            </div>
                        )}
                        
                         {showEndGameAnimation && (
                            <div className="absolute inset-0 flex items-center justify-center z-40 pointer-events-none">
                                <h1 className={`text-7xl md:text-8xl font-extrabold animate-zoom-in-out ${showEndGameAnimation === 'win' ? 'text-green-400' : 'text-red-500'}`}
                                    style={{ textShadow: '0 0 20px rgba(0,0,0,0.7)' }}>
                                    {showEndGameAnimation === 'win' ? 'YOU WIN!' : 'YOU LOSE!'}
                                </h1>
                            </div>
                        )}
                        {showCheckWarning && (
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 mt-24 md:mt-32 z-30 pointer-events-none">
                                <h2 className="text-4xl md:text-5xl font-bold text-yellow-400 animate-check-warning" style={{ textShadow: '0 0 10px #000' }}>
                                    CHECK!
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
                );
            case 'menu':
            default:
                return <Menu 
                    playerName={playerName}
                    onSetName={setPlayerName}
                    onStartGame={startGame} 
                    onGoToShop={() => handleNavigate('shop')}
                    onGoToInventory={() => handleNavigate('inventory')}
                    onOpenSettings={() => setIsSettingsOpen(true)}
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
            {renderView()}
            {isSettingsOpen && (
                <SettingsModal
                    context={view === 'game' ? 'game' : 'menu'}
                    soundEnabled={soundEnabled}
                    onToggleSound={() => setSoundEnabled(p => !p)}
                    musicEnabled={musicEnabled}
                    onToggleMusic={() => setMusicEnabled(p => !p)}
                    selectedTrack={musicTrack}
                    onSelectTrack={setMusicTrack}
                    gameDuration={gameDuration}
                    onSetGameDuration={setGameDuration}
                    turnDuration={turnDuration}
                    onSetTurnDuration={setTurnDuration}
                    onClose={() => setIsSettingsOpen(false)}
                    onResign={handleResign}
                    onGoToShop={() => {
                        setIsSettingsOpen(false);
                        handleNavigate('shop');
                    }}
                    onGoToInventory={() => {
                        setIsSettingsOpen(false);
                        handleNavigate('inventory');
                    }}
                />
            )}
        </div>
    );
};

export default App;
