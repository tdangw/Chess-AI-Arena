export enum Player {
  Red = 'Red',
  Black = 'Black',
}

export enum PieceType {
  General = 'General',
  Advisor = 'Advisor',
  Elephant = 'Elephant',
  Horse = 'Horse',
  Chariot = 'Chariot',
  Cannon = 'Cannon',
  Soldier = 'Soldier',
}

export interface Position {
  x: number;
  y: number;
}

export interface Piece {
  id: number;
  player: Player;
  type: PieceType;
  position: Position;
}

export interface Move {
  from: Position;
  to: Position;
}

export type BoardState = (Piece | null)[][];

export interface Skin {
  id: string;
  name: string;
  price: number;
}

export interface Avatar {
  id: string;
  name: string;
  price: number;
  url: string;
}

export interface Theme {
  id: string;
  name: string;
  price: number;
}

export interface EmojiItem {
  id: string;
  name: string;
  price: number;
  char: string;
}
