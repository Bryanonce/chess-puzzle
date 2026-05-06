import type { Board, PieceType, Position } from "../types/chess"
import { isInsideBoard } from "./board"

const CARDINAL_DIRECTIONS = [
  { row: -1, cell: 0 },
  { row: 1, cell: 0 },
  { row: 0, cell: -1 },
  { row: 0, cell: 1 },
]

const DIAGONAL_DIRECTIONS = [
  { row: -1, cell: -1 },
  { row: -1, cell: 1 },
  { row: 1, cell: -1 },
  { row: 1, cell: 1 },
]

const KNIGHT_OFFSETS = [
  { row: -2, cell: -1 },
  { row: -2, cell: 1 },
  { row: -1, cell: -2 },
  { row: -1, cell: 2 },
  { row: 1, cell: -2 },
  { row: 1, cell: 2 },
  { row: 2, cell: -1 },
  { row: 2, cell: 1 },
]

const KING_OFFSETS = [
  { row: -1, cell: -1 },
  { row: -1, cell: 0 },
  { row: -1, cell: 1 },
  { row: 0, cell: -1 },
  { row: 0, cell: 1 },
  { row: 1, cell: -1 },
  { row: 1, cell: 0 },
  { row: 1, cell: 1 },
]

const getSlidingMoves = (
  board: Board,
  from: Position,
  directions: Position[],
): Position[] => {
  const moves: Position[] = []

  directions.forEach((direction) => {
    let row = from.row + direction.row
    let cell = from.cell + direction.cell

    while (isInsideBoard(board, { row, cell })) {
      if (board[row][cell]) break
      moves.push({ row, cell })
      row += direction.row
      cell += direction.cell
    }
  })

  return moves
}

const getFixedMoves = (
  board: Board,
  from: Position,
  offsets: Position[],
): Position[] => {
  return offsets
    .map((offset) => ({
      row: from.row + offset.row,
      cell: from.cell + offset.cell,
    }))
    .filter((target) => isInsideBoard(board, target) && !board[target.row][target.cell])
}

export const getPossibleMoves = (
  board: Board,
  from: Position,
  piece: PieceType | null,
): Position[] => {
  if (!piece) return []

  switch (piece) {
    case "pawn":
      return getFixedMoves(board, from, [{ row: -1, cell: 0 }])
    case "rook":
      return getSlidingMoves(board, from, CARDINAL_DIRECTIONS)
    case "bishop":
      return getSlidingMoves(board, from, DIAGONAL_DIRECTIONS)
    case "queen":
      return getSlidingMoves(board, from, [
        ...CARDINAL_DIRECTIONS,
        ...DIAGONAL_DIRECTIONS,
      ])
    case "king":
      return getFixedMoves(board, from, KING_OFFSETS)
    case "knight":
      return getFixedMoves(board, from, KNIGHT_OFFSETS)
    case "obstacle":
      return []
    default:
      return []
  }
}
