export interface Dimensions {
  horizontal: number
  vertical: number
}

export interface Position {
  row: number
  cell: number
}

export type PieceType =
  | "pawn"
  | "rook"
  | "knight"
  | "bishop"
  | "queen"
  | "king"
  | "obstacle"

export type BoardCell = PieceType | null
export type Board = BoardCell[][]

export type GameStatus =
  | "generate"
  | "setChessPieces"
  | "setInitial"
  | "setEnd"
  | "play"
  | "move-piece"
