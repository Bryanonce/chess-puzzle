import { useEffect, useMemo, useState } from "react"
import { ChessIcon } from "./components/ChessIcon"
import { InputComponents } from "./components/InputComponents"
import { OptionChess } from "./components/OptionChess"
import { useChessPuzzle } from "./hooks/useChessPuzzle"
import type { GameStatus, PieceType, Position } from "./types/chess"
import { isPositionEqual, isValidDimensions } from "./utils/board"
import "./App.css"

const getStatusLabel = (status: GameStatus): string => {
  switch (status) {
    case "generate":
      return "Genera un tablero"
    case "setChessPieces":
      return "Selecciona celdas y agrega piezas"
    case "setInitial":
      return "Selecciona la posicion inicial"
    case "setEnd":
      return "Selecciona la posicion final"
    case "play":
      return "Elige una pieza para ver sus movimientos"
    case "move-piece":
      return "Elige el destino de la pieza"
    case "won":
      return "Ganaste, llegaste a la posicion final"
    default:
      return ""
  }
}

export const App: React.FC = () => {
  const [dimensions, setDimensions] = useState({ horizontal: 8, vertical: 8 })
  const [status, setStatus] = useState<GameStatus>("generate")
  const [selectedCell, setSelectedCell] = useState<Position | null>(null)
  const [pieceToMove, setPieceToMove] = useState<Position | null>(null)
  const [validationMessage, setValidationMessage] = useState("")
  const { store, start, placePiece, setPuzzleInitial, setPuzzleEnd, calculateMoves, movePiece } =
    useChessPuzzle()

  const canGenerate = useMemo(() => isValidDimensions(dimensions), [dimensions])
  const hasWon = useMemo(() => {
    return !!store.puzzleInitial && !!store.puzzleEnd && isPositionEqual(store.puzzleInitial, store.puzzleEnd)
  }, [store.puzzleInitial, store.puzzleEnd])

  useEffect(() => {
    if (hasWon) {
      setStatus("won")
    }
  }, [hasWon])

  const handleGenerate = () => {
    if (!start(dimensions)) {
      setValidationMessage("Ingresa dimensiones validas y mayores a cero.")
      return
    }
    setValidationMessage("")
    setSelectedCell(null)
    setPieceToMove(null)
    setStatus("setChessPieces")
  }

  const handleCellClick = (position: Position) => {
    switch (status) {
      case "setChessPieces":
        setSelectedCell(position)
        break
      case "setInitial":
        setPuzzleInitial(position)
        setSelectedCell(null)
        break
      case "setEnd":
        setPuzzleEnd(position)
        setSelectedCell(null)
        break
      case "play":
        if (!store.board[position.row][position.cell]) return
        calculateMoves(position)
        setPieceToMove(position)
        setStatus("move-piece")
        break
      case "move-piece":
        if (!pieceToMove) return
        movePiece(pieceToMove, position)
        if (!hasWon) {
          setStatus("play")
        }
        break
      case "won":
        break
      default:
        break
    }
  }

  const handlePieceSelect = (piece: PieceType) => {
    if (!selectedCell) return
    placePiece(selectedCell, piece)
    setSelectedCell(null)
  }

  const nextButton = useMemo(() => {
    switch (status) {
      case "setChessPieces":
        return { label: "Continuar", onClick: () => setStatus("setInitial") }
      case "setInitial":
        return { label: "Definir final", onClick: () => setStatus("setEnd") }
      case "setEnd":
        return { label: "Jugar", onClick: () => setStatus("play") }
      case "won":
        return {
          label: "Reiniciar",
          onClick: () => {
            const started = start(dimensions)
            if (!started) {
              setValidationMessage("Ingresa dimensiones validas y mayores a cero.")
              return
            }
            setValidationMessage("")
            setSelectedCell(null)
            setPieceToMove(null)
            setStatus("setChessPieces")
          },
        }
      default:
        return null
    }
  }, [status, dimensions, start])

  return (
    <div className="app">
      <h1>Chess Puzzle</h1>
      <p className="status-label">{getStatusLabel(status)}</p>

      <div>
        <InputComponents
          type="number"
          min={1}
          placeholder="vertical"
          value={dimensions.vertical}
          onChange={(event) =>
            setDimensions((prev) => ({ ...prev, vertical: Number(event.target.value) }))
          }
        />
        <InputComponents
          type="number"
          min={1}
          placeholder="horizontal"
          value={dimensions.horizontal}
          onChange={(event) =>
            setDimensions((prev) => ({ ...prev, horizontal: Number(event.target.value) }))
          }
        />
      </div>

      <div className="actions">
        {status === "generate" && (
          <button className="primary-button" disabled={!canGenerate} onClick={handleGenerate}>
            Generar
          </button>
        )}
        {nextButton && (
          <button className="primary-button" onClick={nextButton.onClick}>
            {nextButton.label}
          </button>
        )}
      </div>

      {validationMessage && <p className="error-text">{validationMessage}</p>}
      {status === "won" && <p className="success-text">Felicidades, eres el ganador.</p>}
      {selectedCell && status === "setChessPieces" && <OptionChess handleOnSelect={handlePieceSelect} />}

      <div className="board-wrapper">
        {store.board.map((row, rowIndex) => (
          <div className="board-row" key={rowIndex}>
            {row.map((piece, cellIndex) => {
              const cellPosition = { row: rowIndex, cell: cellIndex }
              const isEndCell =
                !!store.puzzleEnd && isPositionEqual(store.puzzleEnd, cellPosition)
              const isInitialCell =
                !!store.puzzleInitial && isPositionEqual(store.puzzleInitial, cellPosition)
              const isPossibleCell = store.possibleMovements.some((movement) =>
                isPositionEqual(movement, cellPosition),
              )

              return (
                <button
                  className={`board-cell ${isEndCell ? "cell-end" : ""} ${
                    (rowIndex + cellIndex) % 2 === 0 ? "cell-light" : "cell-dark"
                  }`}
                  key={`${rowIndex}-${cellIndex}`}
                  onClick={() => handleCellClick(cellPosition)}
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
    </div>
  )
}