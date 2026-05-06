import type { Board, Position } from "../../types/chess"
import { isPositionEqual } from "../../utils/board"
import { ChessIcon } from "../ChessIcon"

interface ChessBoardProps {
  board: Board
  puzzleInitial: Position | null
  puzzleEnd: Position | null
  possibleMovements: Position[]
  onCellClick: (position: Position) => void
}

export const ChessBoard: React.FC<ChessBoardProps> = ({
  board,
  puzzleInitial,
  puzzleEnd,
  possibleMovements,
  onCellClick,
}) => {
  return (
    <div className="board-wrapper">
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

            return (
              <button
                className={`board-cell ${isEndCell ? "cell-end" : ""} ${
                  (rowIndex + cellIndex) % 2 === 0 ? "cell-light" : "cell-dark"
                }`}
                key={`${rowIndex}-${cellIndex}`}
                onClick={() => onCellClick(cellPosition)}
              >
                <div className={`movement-dot ${isPossibleCell ? "movement-visible" : ""}`} />
                {piece && (
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
  )
}

