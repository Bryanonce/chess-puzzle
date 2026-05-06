import type { GameStatus } from "../../types/chess"

const getStatusLabel = (status: GameStatus): string => {
  switch (status) {
    case "chooseDimensions":
      return "Paso 1: Escoge el tamaño del tablero (por defecto 3×6)."
    case "placePieces":
      return "Paso 2: Coloca las piezas en el tablero. 'obstacle' es casilla muerta (no se mueve y nadie puede caer ahí)."
    case "selectPiece":
      return "Paso 3: Selecciona la pieza objetivo (la que debe llegar a la meta)."
    case "selectTarget":
      return "Paso 4: Selecciona la casilla objetivo (debe estar vacía y no ser casilla muerta)."
    case "play":
      return "Paso 5: Juega moviendo piezas o pide una solución."
    case "move-piece":
      return "Elige el destino de la pieza"
    case "won":
      return "Ganaste, llegaste a la posicion final"
    default:
      return ""
  }
}

interface StatusHeaderProps {
  status: GameStatus
  validationMessage: string
}

export const StatusHeader: React.FC<StatusHeaderProps> = ({
  status,
  validationMessage,
}) => {
  return (
    <>
      <h1>Chess Puzzle</h1>
      <p className="status-label">{getStatusLabel(status)}</p>

      {validationMessage && <p className="error-text">{validationMessage}</p>}
      {status === "won" && <p className="success-text">Felicidades, eres el ganador.</p>}
    </>
  )
}

