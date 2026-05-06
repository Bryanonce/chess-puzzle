import type { Position } from "../../types/chess"
import type { SolveMove } from "../../utils/solver"

interface SolutionPanelProps {
  title?: string
  reason?: string
  path?: Position[]
  moves?: SolveMove[]
  nodesExpanded?: number
}

const formatPos = (p: Position) => `(${p.row}, ${p.cell})`
const formatMove = (m: SolveMove) =>
  `P${m.pieceId} (${m.pieceType}): ${formatPos(m.from)} -> ${formatPos(m.to)}`

export const SolutionPanel: React.FC<SolutionPanelProps> = ({
  title = "Mejor ruta encontrada",
  reason,
  path = [],
  moves = [],
  nodesExpanded,
}) => {
  if (path.length === 0 && moves.length === 0 && !reason) return null

  return (
    <div style={{ width: "100%", maxWidth: 720, marginTop: 12 }}>
      <strong>{title}</strong>
      {reason && <p className="status-label">{reason}</p>}

      {typeof nodesExpanded === "number" && (
        <p className="status-label">Nodos explorados: <strong>{nodesExpanded}</strong></p>
      )}

      {moves.length > 0 && (
        <>
          <p className="status-label">
            Movimientos: <strong>{moves.length}</strong>
          </p>
          <ol style={{ marginTop: 8 }}>
            {moves.map((m, idx) => (
              <li key={`${m.pieceId}-${m.from.row}-${m.from.cell}-${m.to.row}-${m.to.cell}-${idx}`}>
                {formatMove(m)}
              </li>
            ))}
          </ol>
        </>
      )}

      {moves.length === 0 && path.length > 0 && (
        <>
          <p className="status-label">
            Movimientos: <strong>{Math.max(0, path.length - 1)}</strong>
          </p>
          <ol style={{ marginTop: 8 }}>
            {path.map((pos, idx) => (
              <li key={`${pos.row}-${pos.cell}-${idx}`}>{formatPos(pos)}</li>
            ))}
          </ol>
        </>
      )}
    </div>
  )
}

