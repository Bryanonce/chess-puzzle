import { useEffect, useMemo, useRef, useState } from "react"
import { OptionChess } from "./components/OptionChess"
import { ChessBoard } from "./components/board/ChessBoard"
import { ActionBar } from "./components/controls/ActionBar"
import { DimensionForm } from "./components/controls/DimensionForm"
import { SolutionPanel } from "./components/controls/SolutionPanel"
import { StatusHeader } from "./components/controls/StatusHeader"
import { useChessPuzzle } from "./hooks/useChessPuzzle"
import type { Dimensions, GameStatus, PieceType, Position } from "./types/chess"
import { isPositionEqual, isValidDimensions } from "./utils/board"
import { solvePuzzleAnyPieceOptimal, type SolveMove } from "./utils/solver"
import "./App.css"

export const App: React.FC = () => {
  const [dimensions, setDimensions] = useState<Dimensions>({ horizontal: 8, vertical: 8 })
  const [status, setStatus] = useState<GameStatus>("generate")
  const [selectedCell, setSelectedCell] = useState<Position | null>(null)
  const [pieceToMove, setPieceToMove] = useState<Position | null>(null)
  const [moveAnimation, setMoveAnimation] = useState<{
    from: Position
    to: Position
    piece: PieceType
    id: number
  } | null>(null)
  const [solution, setSolution] = useState<{
    moves: SolveMove[]
    reason?: string
    nodesExpanded?: number
  } | null>(null)
  const [isAutoPlaying, setIsAutoPlaying] = useState(false)
  const autoPlayTokenRef = useRef(0)
  const [validationMessage, setValidationMessage] = useState("")
  const { store, start, placePiece, setPuzzleInitial, setPuzzleEnd, calculateMoves, movePiece, movePieceDirect } =
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
    autoPlayTokenRef.current++
    setIsAutoPlaying(false)
    if (!start(dimensions)) {
      setValidationMessage("Ingresa dimensiones validas y mayores a cero.")
      return
    }
    setValidationMessage("")
    setSelectedCell(null)
    setPieceToMove(null)
    setStatus("setChessPieces")
    setSolution(null)
  }

  const handleRestart = () => {
    autoPlayTokenRef.current++
    setIsAutoPlaying(false)
    const started = start(dimensions)
    if (!started) {
      setValidationMessage("Ingresa dimensiones validas y mayores a cero.")
      return
    }
    setValidationMessage("")
    setSelectedCell(null)
    setPieceToMove(null)
    setMoveAnimation(null)
    setStatus("setChessPieces")
    setSolution(null)
  }

  const canSuggestSolution = useMemo(() => {
    return (
      !!store.puzzleInitial &&
      !!store.puzzleEnd &&
      !!store.board[store.puzzleInitial.row]?.[store.puzzleInitial.cell]
    )
  }, [store.puzzleInitial, store.puzzleEnd, store.board])

  const stopAutoPlay = () => {
    autoPlayTokenRef.current++
    setIsAutoPlaying(false)
  }

  const handleSuggestSolution = async () => {
    if (!store.puzzleInitial || !store.puzzleEnd) {
      setSolution({ moves: [], reason: "Primero define inicio y final." })
      return
    }
    const result = solvePuzzleAnyPieceOptimal({
      board: store.board,
      start: store.puzzleInitial,
      end: store.puzzleEnd,
      maxNodes: 500_000,
      maxMs: 1500,
    })

    setSolution({
      moves: result.moves,
      reason: result.reason,
      nodesExpanded: result.nodesExpanded,
    })

    if (!result.found || result.moves.length === 0) return

    const token = ++autoPlayTokenRef.current
    setIsAutoPlaying(true)
    setStatus("play")

    for (const m of result.moves) {
      if (autoPlayTokenRef.current !== token) return

      // Animación (usa el tipo de pieza del movimiento)
      setMoveAnimation({
        from: m.from,
        to: m.to,
        piece: m.pieceType,
        id: Date.now(),
      })
      window.setTimeout(() => {
        // solo limpia si seguimos en el mismo autoplay
        if (autoPlayTokenRef.current === token) setMoveAnimation(null)
      }, 220)

      // Aplicar movimiento real al tablero
      movePieceDirect(m.from, m.to)

      // Pausa de 1s para observar
      await new Promise<void>((resolve) => window.setTimeout(resolve, 1000))
    }

    if (autoPlayTokenRef.current === token) {
      setIsAutoPlaying(false)
    }
  }

  const handleCellClick = (position: Position) => {
    if (isAutoPlaying) return
    switch (status) {
      case "setChessPieces":
        setSelectedCell(position)
        break
      case "setInitial":
        setPuzzleInitial(position)
        setSelectedCell(null)
        setSolution(null)
        break
      case "setEnd":
        setPuzzleEnd(position)
        setSelectedCell(null)
        setSolution(null)
        break
      case "play":
        if (!store.board[position.row][position.cell]) return
        calculateMoves(position)
        setPieceToMove(position)
        setStatus("move-piece")
        break
      case "move-piece":
        if (!pieceToMove) return
        const movingPiece = store.board[pieceToMove.row]?.[pieceToMove.cell]
        const moved = movePiece(pieceToMove, position)
        if (moved && movingPiece) {
          setMoveAnimation({
            from: pieceToMove,
            to: position,
            piece: movingPiece,
            id: Date.now(),
          })
          window.setTimeout(() => {
            setMoveAnimation(null)
          }, 220)
        }
        setSolution(null)
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
    if (isAutoPlaying) return
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

      <ActionBar
        primary={
          status !== "generate"
            ? {
              label: isAutoPlaying ? "Detener" : "Sugerir solución",
              disabled: !isAutoPlaying && !canSuggestSolution,
              onClick: isAutoPlaying ? stopAutoPlay : handleSuggestSolution,
            }
            : undefined
        }
      />

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
          marginTop: 16,
        }}
      >
        <ChessBoard
          board={store.board}
          puzzleInitial={store.puzzleInitial}
          puzzleEnd={store.puzzleEnd}
          possibleMovements={store.possibleMovements}
          onCellClick={handleCellClick}
          moveAnimation={moveAnimation}
        />
        <div
          style={{
            width: "50%",
            height: "100%",
          }}
        >
          {solution && (
            <SolutionPanel
              moves={solution.moves}
              reason={solution.reason}
              nodesExpanded={solution.nodesExpanded}
            />
          )}
        </div>
      </div>

    </div>
  )
}