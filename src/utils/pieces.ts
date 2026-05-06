import {
  faChessBishop,
  faChessKing,
  faChessKnight,
  faChessPawn,
  faChessQueen,
  faChessRook,
  faSkullCrossbones,
  type IconDefinition,
} from "@fortawesome/free-solid-svg-icons"
import type { PieceType } from "../types/chess"

export const PIECE_OPTIONS: PieceType[] = [
  "bishop",
  "king",
  "knight",
  "pawn",
  "queen",
  "rook",
  "obstacle",
]

const pieceIconMap: Record<PieceType, IconDefinition> = {
  bishop: faChessBishop,
  king: faChessKing,
  knight: faChessKnight,
  pawn: faChessPawn,
  queen: faChessQueen,
  rook: faChessRook,
  obstacle: faSkullCrossbones,
}

export const getPieceIcon = (piece: PieceType): IconDefinition => {
  return pieceIconMap[piece]
}
