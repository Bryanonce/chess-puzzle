import { useEffect, useMemo, useRef, useState } from "react"
import type { CSSProperties } from "react"
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
  const MOVE_MS = 500
  const DEFAULT_DIMENSIONS: Dimensions = { horizontal: 6, vertical: 3 }
  const [dimensions, setDimensions] = useState<Dimensions>(DEFAULT_DIMENSIONS)
  const [status, setStatus] = useState<GameStatus>("chooseDimensions")
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
  const {
    store,
    reset,
    start,
    placePiece,
    setPuzzleInitial,
    setPuzzleEnd,
    clearPuzzleInitial,
    clearPuzzleEnd,
    calculateMoves,
    movePieceDirect,
  } =
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
    clearPuzzleInitial()
    clearPuzzleEnd()
    setStatus("placePieces")
    setSolution(null)
  }

  const handleResetToStart = () => {
    autoPlayTokenRef.current++
    setIsAutoPlaying(false)
    setSelectedCell(null)
    setPieceToMove(null)
    setMoveAnimation(null)
    setSolution(null)
    setValidationMessage("")
    setDimensions(DEFAULT_DIMENSIONS)
    reset()
    setStatus("chooseDimensions")
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
    setStatus("placePieces")
    setSolution(null)
    clearPuzzleInitial()
    clearPuzzleEnd()
  }

  const canSuggestSolution = useMemo(() => {
    return (
      !!store.puzzleInitial &&
      !!store.puzzleEnd &&
      !!store.board[store.puzzleInitial.row]?.[store.puzzleInitial.cell] &&
      store.board[store.puzzleInitial.row]?.[store.puzzleInitial.cell] !== "obstacle" &&
      !store.board[store.puzzleEnd.row]?.[store.puzzleEnd.cell]
    )
  }, [store.puzzleInitial, store.puzzleEnd, store.board])

  const hasSelectablePieceOnBoard = useMemo(() => {
    return store.board.some((row) =>
      row.some((cell) => !!cell && cell !== "obstacle"),
    )
  }, [store.board])

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
      maxMs: 2000,
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

      // Esperar a que termine la animación antes de mutar el tablero (evita “saltos”)
      await new Promise<void>((resolve) => window.setTimeout(resolve, MOVE_MS))
      if (autoPlayTokenRef.current !== token) return

      movePieceDirect(m.from, m.to)
      setMoveAnimation(null)
    }

    if (autoPlayTokenRef.current === token) {
      setIsAutoPlaying(false)
    }
  }

  const handleCellClick = (position: Position) => {
    if (isAutoPlaying) return
    switch (status) {
      case "placePieces":
        setSelectedCell(position)
        break
      case "selectPiece": {
        const piece = store.board[position.row]?.[position.cell]
        if (!piece || piece === "obstacle") {
          setValidationMessage("Debes seleccionar una pieza válida (no obstacle).")
          return
        }
        setValidationMessage("")
        setPuzzleInitial(position)
        break
      }
      case "selectTarget": {
        const cell = store.board[position.row]?.[position.cell]
        if (cell) {
          setValidationMessage("La casilla objetivo debe estar vacía (y no puede ser obstacle).")
          return
        }
        setValidationMessage("")
        setPuzzleEnd(position)
        break
      }
      case "play":
        if (!store.board[position.row][position.cell]) return
        if (store.board[position.row][position.cell] === "obstacle") return
        calculateMoves(position)
        setPieceToMove(position)
        setStatus("move-piece")
        break
      case "move-piece":
        if (!pieceToMove) return
        const movingPiece = store.board[pieceToMove.row]?.[pieceToMove.cell]
        // Para mantener consistencia con la animación suave, movemos “al final”
        const isLegal = !!movingPiece
        if (isLegal && movingPiece) {
          setMoveAnimation({
            from: pieceToMove,
            to: position,
            piece: movingPiece,
            id: Date.now(),
          })

          window.setTimeout(() => {
            movePieceDirect(pieceToMove, position)
            setMoveAnimation(null)
          }, MOVE_MS)
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
      case "placePieces":
        return {
          label: "Siguiente: elegir pieza",
          disabled: !hasSelectablePieceOnBoard,
          onClick: () => {
            if (!hasSelectablePieceOnBoard) {
              setValidationMessage("Primero coloca al menos una pieza movible en el tablero.")
              return
            }
            setValidationMessage("")
            setSelectedCell(null)
            setStatus("selectPiece")
          },
        }
      case "selectPiece":
        return {
          label: "Siguiente: elegir casilla",
          onClick: () => {
            if (!store.puzzleInitial || !store.board[store.puzzleInitial.row]?.[store.puzzleInitial.cell]) {
              setValidationMessage("Primero selecciona una pieza objetivo.")
              return
            }
            setValidationMessage("")
            setStatus("selectTarget")
          },
        }
      case "selectTarget":
        return {
          label: "Siguiente: jugar",
          onClick: () => {
            if (!store.puzzleEnd) {
              setValidationMessage("Primero selecciona una casilla objetivo.")
              return
            }
            const endCell = store.board[store.puzzleEnd.row]?.[store.puzzleEnd.cell]
            if (endCell) {
              setValidationMessage("La casilla objetivo debe estar vacía.")
              return
            }
            setValidationMessage("")
            setStatus("play")
          },
        }
      case "won":
        return { label: "Reiniciar", onClick: handleRestart }
      default:
        return null
    }
  }, [status, handleRestart, store.puzzleInitial, store.puzzleEnd, store.board, hasSelectablePieceOnBoard])

  return (
    <div
      className="app"
      style={{
        ["--move-ms" as string]: `${MOVE_MS}ms`,
        ["--board-cols" as string]: `${Math.max(1, dimensions.horizontal)}`,
      } as CSSProperties}
    >
      <StatusHeader status={status} validationMessage={validationMessage} />
      {status !== "chooseDimensions" && (
        <button className="floating-reset-btn" onClick={handleResetToStart}>
          Reset
        </button>
      )}
      {status === "chooseDimensions" ? (
        <DimensionForm dimensions={dimensions} onChange={setDimensions} />
      ) : (
        <p className="status-label">
          Tamaño de matriz: <strong>{dimensions.vertical} x {dimensions.horizontal}</strong>
        </p>
      )}

      <ActionBar
        primary={
          status === "chooseDimensions"
            ? { label: "Generar", disabled: !canGenerate, onClick: handleGenerate }
            : undefined
        }
        secondary={nextButton ?? undefined}
      />

      {selectedCell && status === "placePieces" && <OptionChess handleOnSelect={handlePieceSelect} />}

      <ActionBar
        primary={
          status === "play"
            ? {
              label: isAutoPlaying ? "Detener" : "Sugerir solución",
              disabled: !isAutoPlaying && !canSuggestSolution,
              onClick: isAutoPlaying ? stopAutoPlay : handleSuggestSolution,
            }
            : undefined
        }
      />

      <div className="content-layout">
        <ChessBoard
          board={store.board}
          puzzleInitial={store.puzzleInitial}
          puzzleEnd={store.puzzleEnd}
          possibleMovements={store.possibleMovements}
          onCellClick={handleCellClick}
          moveAnimation={moveAnimation}
        />
        <div className="solution-panel-wrap">
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