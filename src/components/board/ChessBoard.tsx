import { useMemo } from "react"
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
  const movingTo = useMemo(() => moveAnimation?.to ?? null, [moveAnimation])
  const movingFrom = useMemo(() => moveAnimation?.from ?? null, [moveAnimation])

  const moveStyle = useMemo(() => {
    if (!moveAnimation) return null
    const dxSteps = moveAnimation.to.cell - moveAnimation.from.cell
    const dySteps = moveAnimation.to.row - moveAnimation.from.row

    return {
      ["--from-row" as any]: `${moveAnimation.from.row}`,
      ["--from-cell" as any]: `${moveAnimation.from.cell}`,
      ["--dx-steps" as any]: `${dxSteps}`,
      ["--dy-steps" as any]: `${dySteps}`,
    }
  }, [moveAnimation])

  return (
    <div className="board-wrapper">
      <div className="board-stage">
        {moveAnimation && moveStyle && (
          <div key={moveAnimation.id} className="move-piece is-animating" style={moveStyle}>
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
              const isMovingSource =
                !!movingFrom && isPositionEqual(movingFrom, cellPosition)

            return (
              <button
                className={`board-cell ${isEndCell ? "cell-end" : ""} ${
                  (rowIndex + cellIndex) % 2 === 0 ? "cell-light" : "cell-dark"
                }`}
                key={`${rowIndex}-${cellIndex}`}
                onClick={() => onCellClick(cellPosition)}
              >
                <div className={`movement-dot ${isPossibleCell ? "movement-visible" : ""}`} />
                {piece && !isMovingDestination && !isMovingSource && (
                  <ChessIcon
                    piece={piece}
                    style={{
                      border: isInitialCell ? "2px solid green" : "none",
                      width: "calc(var(--cell-size) * 0.78)",
                      height: "calc(var(--cell-size) * 0.78)",
                      margin: 0,
                      padding: 0,
                      backgroundColor: "rgba(230, 230, 230, 0.95)",
                      boxShadow: "0 1px 2px rgba(0, 0, 0, 0.2)",
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

