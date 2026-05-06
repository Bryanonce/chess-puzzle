import { useEffect, useMemo, useState } from "react"
import { OptionChess } from "./components/OptionChess"
import { ChessBoard } from "./components/board/ChessBoard"
import { ActionBar } from "./components/controls/ActionBar"
import { DimensionForm } from "./components/controls/DimensionForm"
import { StatusHeader } from "./components/controls/StatusHeader"
import { useChessPuzzle } from "./hooks/useChessPuzzle"
import type { Dimensions, GameStatus, PieceType, Position } from "./types/chess"
import { isPositionEqual, isValidDimensions } from "./utils/board"
import "./App.css"

export const App: React.FC = () => {
  const [dimensions, setDimensions] = useState<Dimensions>({ horizontal: 8, vertical: 8 })
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

  const handleRestart = () => {
    const started = start(dimensions)
    if (!started) {
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
        return { label: "Reiniciar", onClick: handleRestart }
      default:
        return null
    }
  }, [status, handleRestart])

  return (
    <div className="app">
      <StatusHeader status={status} validationMessage={validationMessage} />
      <DimensionForm dimensions={dimensions} onChange={setDimensions} />

      <ActionBar
        primary={
          status === "generate"
            ? { label: "Generar", disabled: !canGenerate, onClick: handleGenerate }
            : undefined
        }
        secondary={nextButton ?? undefined}
      />

      {selectedCell && status === "setChessPieces" && <OptionChess handleOnSelect={handlePieceSelect} />}

      <ChessBoard
        board={store.board}
        puzzleInitial={store.puzzleInitial}
        puzzleEnd={store.puzzleEnd}
        possibleMovements={store.possibleMovements}
        onCellClick={handleCellClick}
      />
    </div>
  )
}