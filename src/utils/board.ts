import type { Board, Dimensions, PieceType, Position } from "../types/chess"

const EMPTY_CELL = null

export const isValidDimensions = (dimensions: Dimensions): boolean => {
  return (
    Number.isInteger(dimensions.horizontal) &&
    Number.isInteger(dimensions.vertical) &&
    dimensions.horizontal > 0 &&
    dimensions.vertical > 0
  )
}

export const isInsideBoard = (
  board: Board,
  position: Position,
): boolean => {
  if (board.length === 0 || board[0].length === 0) return false

  return (
    position.row >= 0 &&
    position.row < board.length &&
    position.cell >= 0 &&
    position.cell < board[0].length
  )
}

export const createBoard = (dimensions: Dimensions): Board => {
  return Array.from({ length: dimensions.vertical }, () =>
    Array.from({ length: dimensions.horizontal }, () => EMPTY_CELL),
  )
}

export const setPiece = (
  board: Board,
  position: Position,
  piece: PieceType | null,
): Board => {
  if (!isInsideBoard(board, position)) return board

  return board.map((row, rowIndex) =>
    rowIndex === position.row
      ? row.map((cell, cellIndex) =>
          cellIndex === position.cell ? piece : cell,
        )
      : [...row],
  )
}

export const isPositionEqual = (left: Position, right: Position): boolean => {
  return left.row === right.row && left.cell === right.cell
}
