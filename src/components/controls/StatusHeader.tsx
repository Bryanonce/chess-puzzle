import type { GameStatus } from "../../types/chess"

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

