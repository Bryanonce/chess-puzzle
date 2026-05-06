import { useEffect, useMemo, useState } from "react"
import type { Board, PieceType, Position } from "../../types/chess"
import { isPositionEqual } from "../../utils/board"
import { ChessIcon } from "../ChessIcon"

interface ChessBoardProps {
  board: Board
  puzzleInitial: Position | null
  puzzleEnd: Position | null
  possibleMovements: Position[]
  onCellClick: (position: Position) => void
  moveAnimation?: {
    from: Position
    to: Position
    piece: PieceType
    id: number
  } | null
}

export const ChessBoard: React.FC<ChessBoardProps> = ({
  board,
  puzzleInitial,
  puzzleEnd,
  possibleMovements,
  onCellClick,
  moveAnimation,
}) => {
  const [animate, setAnimate] = useState(false)

  useEffect(() => {
    if (!moveAnimation) return
    setAnimate(false)
    const raf = window.requestAnimationFrame(() => setAnimate(true))
    return () => window.cancelAnimationFrame(raf)
  }, [moveAnimation?.id])

  const movingTo = useMemo(() => moveAnimation?.to ?? null, [moveAnimation])

  const moveStyle = useMemo(() => {
    if (!moveAnimation) return null
    const dx = (moveAnimation.to.cell - moveAnimation.from.cell) * 72
    const dy = (moveAnimation.to.row - moveAnimation.from.row) * 72

    return {
      top: moveAnimation.from.row * 72,
      left: moveAnimation.from.cell * 72,
      transform: animate ? `translate(${dx}px, ${dy}px)` : "translate(0px, 0px)",
    }
  }, [moveAnimation, animate])

  return (
    <div className="board-wrapper">
      <div className="board-stage">
        {moveAnimation && moveStyle && (
          <div className="move-piece" style={moveStyle}>
            <ChessIcon piece={moveAnimation.piece} />
          </div>
        )}

        {board.map((row, rowIndex) => (
          <div className="board-row" key={rowIndex}>
            {row.map((piece, cellIndex) => {
            const cellPosition = { row: rowIndex, cell: cellIndex }
            const isEndCell = !!puzzleEnd && isPositionEqual(puzzleEnd, cellPosition)
            const isInitialCell =
              !!puzzleInitial && isPositionEqual(puzzleInitial, cellPosition)
            const isPossibleCell = possibleMovements.some((movement) =>
              isPositionEqual(movement, cellPosition),
            )
              const isMovingDestination =
                !!movingTo && isPositionEqual(movingTo, cellPosition)

            return (
              <button
                className={`board-cell ${isEndCell ? "cell-end" : ""} ${
                  (rowIndex + cellIndex) % 2 === 0 ? "cell-light" : "cell-dark"
                }`}
                key={`${rowIndex}-${cellIndex}`}
                onClick={() => onCellClick(cellPosition)}
              >
                <div className={`movement-dot ${isPossibleCell ? "movement-visible" : ""}`} />
                {piece && !isMovingDestination && (
                  <ChessIcon
                    piece={piece}
                    style={{
                      border: isInitialCell ? "2px solid green" : "none",
                    }}
                  />
                )}
              </button>
            )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

