import { useState } from "react"
import type { Board, Dimensions, Position, PieceType } from "../types/chess"
import {
  createBoard,
  isPositionEqual,
  isValidDimensions,
  setPiece,
} from "../utils/board"
import { getPossibleMoves } from "../utils/movements"

interface PuzzleStore {
  dimensions: Dimensions
  board: Board
  puzzleInitial: Position | null
  puzzleEnd: Position | null
  possibleMovements: Position[]
}

const initialStore: PuzzleStore = {
  dimensions: { horizontal: 0, vertical: 0 },
  board: [],
  puzzleInitial: null,
  puzzleEnd: null,
  possibleMovements: [],
}

export const useChessPuzzle = () => {
  const [store, setStore] = useState<PuzzleStore>(initialStore)

  const start = (dimensions: Dimensions): boolean => {
    if (!isValidDimensions(dimensions)) return false

    setStore({
      dimensions,
      board: createBoard(dimensions),
      puzzleInitial: null,
      puzzleEnd: null,
      possibleMovements: [],
    })
    return true
  }

  const placePiece = (position: Position, piece: PieceType) => {
    setStore((prev) => ({
      ...prev,
      board: setPiece(prev.board, position, piece),
    }))
  }

  const setPuzzleInitial = (position: Position) => {
    setStore((prev) => ({ ...prev, puzzleInitial: position }))
  }

  const setPuzzleEnd = (position: Position) => {
    setStore((prev) => ({ ...prev, puzzleEnd: position }))
  }

  const calculateMoves = (position: Position) => {
    setStore((prev) => {
      const piece = prev.board[position.row]?.[position.cell] ?? null
      return {
        ...prev,
        possibleMovements: getPossibleMoves(prev.board, position, piece),
      }
    })
  }

  const movePiece = (from: Position, to: Position): boolean => {
    let moved = false

    setStore((prev) => {
      const canMove = prev.possibleMovements.some((movement) =>
        isPositionEqual(movement, to),
      )
      if (!canMove) {
        return { ...prev, possibleMovements: [] }
      }

      const originPiece = prev.board[from.row]?.[from.cell] ?? null
      if (!originPiece) {
        return { ...prev, possibleMovements: [] }
      }

      let board = setPiece(prev.board, to, originPiece)
      board = setPiece(board, from, null)

      moved = true

      return {
        ...prev,
        board,
        puzzleInitial:
          prev.puzzleInitial && isPositionEqual(prev.puzzleInitial, from)
            ? to
            : prev.puzzleInitial,
        possibleMovements: [],
      }
    })

    return moved
  }

  const movePieceDirect = (from: Position, to: Position): boolean => {
    let moved = false

    setStore((prev) => {
      const originPiece = prev.board[from.row]?.[from.cell] ?? null
      if (!originPiece) {
        return { ...prev, possibleMovements: [] }
      }

      const legalMoves = getPossibleMoves(prev.board, from, originPiece)
      const canMove = legalMoves.some((movement) => isPositionEqual(movement, to))
      if (!canMove) {
        return { ...prev, possibleMovements: [] }
      }

      let board = setPiece(prev.board, to, originPiece)
      board = setPiece(board, from, null)
      moved = true

      return {
        ...prev,
        board,
        puzzleInitial:
          prev.puzzleInitial && isPositionEqual(prev.puzzleInitial, from)
            ? to
            : prev.puzzleInitial,
        possibleMovements: [],
      }
    })

    return moved
  }

  const clearPossibleMoves = () => {
    setStore((prev) => ({ ...prev, possibleMovements: [] }))
  }

  return {
    store,
    start,
    placePiece,
    setPuzzleInitial,
    setPuzzleEnd,
    calculateMoves,
    movePiece,
    movePieceDirect,
    clearPossibleMoves,
  }
}
