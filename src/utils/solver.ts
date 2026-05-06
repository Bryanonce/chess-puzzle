import type { Board, PieceType, Position } from "../types/chess"
import { isPositionEqual, setPiece } from "./board"
import { getPossibleMoves } from "./movements"

export interface SolveResult {
  found: boolean
  path: Position[]
  reason?: string
}

export interface SolveMove {
  pieceId: number
  pieceType: PieceType
  from: Position
  to: Position
}

export interface SolveMovesResult {
  found: boolean
  moves: SolveMove[]
  reason?: string
  nodesExpanded: number
}

const keyOf = (p: Position) => `${p.row},${p.cell}`

export const solvePuzzleShortestPath = (params: {
  board: Board
  pieceType: PieceType
  start: Position
  end: Position
  maxNodes?: number
}): SolveResult => {
  const { board, pieceType, start, end, maxNodes = 50_000 } = params

  if (board.length === 0 || board[0].length === 0) {
    return { found: false, path: [], reason: "Tablero vacío." }
  }

  if (board[end.row]?.[end.cell]) {
    return { found: false, path: [], reason: "La casilla final está ocupada." }
  }

  if (isPositionEqual(start, end)) {
    return { found: true, path: [start] }
  }

  // Base board without the moving piece (so we can place it on each explored node).
  const baseBoard = setPiece(board, start, null)

  const queue: Position[] = [start]
  const visited = new Set<string>([keyOf(start)])
  const parent = new Map<string, string | null>()
  parent.set(keyOf(start), null)

  let nodes = 0

  while (queue.length > 0) {
    const current = queue.shift()!
    nodes++
    if (nodes > maxNodes) {
      return {
        found: false,
        path: [],
        reason: "Búsqueda demasiado grande (límite alcanzado).",
      }
    }

    const virtualBoard = setPiece(baseBoard, current, pieceType)
    const nextMoves = getPossibleMoves(virtualBoard, current, pieceType)

    for (const next of nextMoves) {
      const nextKey = keyOf(next)
      if (visited.has(nextKey)) continue
      visited.add(nextKey)
      parent.set(nextKey, keyOf(current))

      if (isPositionEqual(next, end)) {
        // Reconstruct path [start..end]
        const path: Position[] = [end]
        let k: string | null = keyOf(current)
        while (k) {
          const [row, cell] = k.split(",").map(Number)
          path.push({ row, cell })
          k = parent.get(k) ?? null
        }
        path.reverse()
        return { found: true, path }
      }

      queue.push(next)
    }
  }

  return { found: false, path: [], reason: "No hay solución con el tablero actual." }
}

// -----------------------------
// Solver por estados (mover cualquier pieza)
// -----------------------------

type PieceInstance = {
  id: number
  type: PieceType
  pos: Position
  isGoal: boolean
}

type State = {
  pieces: PieceInstance[] // orden estable por id
}

const cloneState = (state: State): State => ({
  pieces: state.pieces.map((p) => ({ ...p, pos: { ...p.pos } })),
})

const stateKey = (state: State): string => {
  // id:row,cell (los tipos son fijos por id)
  return state.pieces.map((p) => `${p.id}:${p.pos.row},${p.pos.cell}`).join("|")
}

const buildBoardForState = (
  baseBoardWithObstacles: Board,
  state: State,
): Board => {
  let b = baseBoardWithObstacles
  for (const p of state.pieces) {
    b = setPiece(b, p.pos, p.type)
  }
  return b
}

class MinHeap<T> {
  private data: Array<{ key: number; value: T }> = []

  push(key: number, value: T) {
    this.data.push({ key, value })
    this.bubbleUp(this.data.length - 1)
  }

  pop(): T | null {
    if (this.data.length === 0) return null
    const top = this.data[0]!.value
    const last = this.data.pop()!
    if (this.data.length > 0) {
      this.data[0] = last
      this.bubbleDown(0)
    }
    return top
  }

  get size() {
    return this.data.length
  }

  private bubbleUp(index: number) {
    while (index > 0) {
      const parent = Math.floor((index - 1) / 2)
      if (this.data[parent]!.key <= this.data[index]!.key) break
      ;[this.data[parent], this.data[index]] = [this.data[index]!, this.data[parent]!]
      index = parent
    }
  }

  private bubbleDown(index: number) {
    const length = this.data.length
    while (true) {
      const left = index * 2 + 1
      const right = index * 2 + 2
      let smallest = index

      if (left < length && this.data[left]!.key < this.data[smallest]!.key) {
        smallest = left
      }
      if (right < length && this.data[right]!.key < this.data[smallest]!.key) {
        smallest = right
      }
      if (smallest === index) break
      ;[this.data[smallest], this.data[index]] = [this.data[index]!, this.data[smallest]!]
      index = smallest
    }
  }
}

const computeGoalHeuristic = (params: {
  obstacleBoard: Board
  goalPieceType: PieceType
  from: Position
  to: Position
  maxNodes?: number
}): number => {
  const { obstacleBoard, goalPieceType, from, to, maxNodes = 20_000 } = params
  if (isPositionEqual(from, to)) return 0

  // BFS solo del goal en tablero con obstáculos (sin otras piezas)
  const queue: Array<{ pos: Position; dist: number }> = [{ pos: from, dist: 0 }]
  const visited = new Set<string>([keyOf(from)])
  let nodes = 0

  while (queue.length > 0) {
    const { pos, dist } = queue.shift()!
    nodes++
    if (nodes > maxNodes) break

    const next = getPossibleMoves(obstacleBoard, pos, goalPieceType)
    for (const n of next) {
      const k = keyOf(n)
      if (visited.has(k)) continue
      if (isPositionEqual(n, to)) return dist + 1
      visited.add(k)
      queue.push({ pos: n, dist: dist + 1 })
    }
  }

  // Si no encuentra camino optimista, usa Manhattan como lower-bound muy débil.
  return Math.abs(from.row - to.row) + Math.abs(from.cell - to.cell) > 0 ? 1 : 0
}

export const solvePuzzleAnyPieceOptimal = (params: {
  board: Board
  start: Position
  end: Position
  maxNodes?: number
  maxMs?: number
}): SolveMovesResult => {
  const { board, start, end, maxNodes = 500_000, maxMs = 1500 } = params

  if (board.length === 0 || board[0].length === 0) {
    return { found: false, moves: [], reason: "Tablero vacío.", nodesExpanded: 0 }
  }

  const goalPieceType = board[start.row]?.[start.cell]
  if (!goalPieceType) {
    return {
      found: false,
      moves: [],
      reason: "No hay pieza en la posición inicial.",
      nodesExpanded: 0,
    }
  }

  if (board[end.row]?.[end.cell]) {
    return {
      found: false,
      moves: [],
      reason: "La casilla final está ocupada.",
      nodesExpanded: 0,
    }
  }

  // Obstáculos fijos (solo "obstacle") se quedan como ocupados; lo demás es movible.
  let obstacleBoard: Board = board
  const pieces: PieceInstance[] = []
  let id = 1

  for (let r = 0; r < board.length; r++) {
    for (let c = 0; c < board[0].length; c++) {
      const cell = board[r][c]
      if (!cell) continue
      if (cell === "obstacle") continue
      pieces.push({
        id,
        type: cell,
        pos: { row: r, cell: c },
        isGoal: r === start.row && c === start.cell,
      })
      id++
      obstacleBoard = setPiece(obstacleBoard, { row: r, cell: c }, null)
    }
  }

  // Asegurar que el goal exista como pieza movible.
  const goal = pieces.find((p) => p.isGoal)
  if (!goal) {
    return {
      found: false,
      moves: [],
      reason: "La pieza inicial no es movible (o no existe).",
      nodesExpanded: 0,
    }
  }

  if (isPositionEqual(goal.pos, end)) {
    return { found: true, moves: [], nodesExpanded: 0 }
  }

  const initial: State = { pieces: pieces.sort((a, b) => a.id - b.id) }
  const initialKey = stateKey(initial)

  const heap = new MinHeap<{ key: string; state: State }>()
  const gScore = new Map<string, number>()
  const cameFrom = new Map<string, { prev: string; move: SolveMove }>()

  const h0 = computeGoalHeuristic({
    obstacleBoard: setPiece(obstacleBoard, goal.pos, goal.type),
    goalPieceType: goal.type,
    from: goal.pos,
    to: end,
  })

  gScore.set(initialKey, 0)
  heap.push(h0, { key: initialKey, state: initial })

  const startTime = typeof performance !== "undefined" ? performance.now() : Date.now()
  let nodesExpanded = 0

  while (heap.size > 0) {
    const currentNode = heap.pop()!
    const currentKey = currentNode.key
    const currentState = currentNode.state
    const currentG = gScore.get(currentKey) ?? Number.POSITIVE_INFINITY

    nodesExpanded++
    if (nodesExpanded > maxNodes) {
      return {
        found: false,
        moves: [],
        reason: "Búsqueda demasiado grande (límite alcanzado).",
        nodesExpanded,
      }
    }

    const now = typeof performance !== "undefined" ? performance.now() : Date.now()
    if (now - startTime > maxMs) {
      return {
        found: false,
        moves: [],
        reason: "Tiempo máximo de búsqueda alcanzado.",
        nodesExpanded,
      }
    }

    const goalNow = currentState.pieces.find((p) => p.isGoal)!
    if (isPositionEqual(goalNow.pos, end)) {
      // reconstruir movimientos
      const moves: SolveMove[] = []
      let k = currentKey
      while (cameFrom.has(k)) {
        const { prev, move } = cameFrom.get(k)!
        moves.push(move)
        k = prev
      }
      moves.reverse()
      return { found: true, moves, nodesExpanded }
    }

    const boardNow = buildBoardForState(obstacleBoard, currentState)

    // Expandir: mover cualquier pieza a cualquier destino legal (a casilla vacía)
    for (const piece of currentState.pieces) {
      const moves = getPossibleMoves(boardNow, piece.pos, piece.type)
      for (const to of moves) {
        // Aplicar movimiento inmutable por estado (no por board)
        const nextState = cloneState(currentState)
        const p = nextState.pieces.find((x) => x.id === piece.id)!
        const from = p.pos
        p.pos = { ...to }

        const nextKey = stateKey(nextState)
        const tentativeG = currentG + 1
        const bestKnown = gScore.get(nextKey)
        if (bestKnown !== undefined && tentativeG >= bestKnown) continue

        gScore.set(nextKey, tentativeG)
        cameFrom.set(nextKey, {
          prev: currentKey,
          move: { pieceId: piece.id, pieceType: piece.type, from, to },
        })

        const goalNext = nextState.pieces.find((pp) => pp.isGoal)!
        const h = computeGoalHeuristic({
          obstacleBoard: setPiece(obstacleBoard, goalNext.pos, goalNext.type),
          goalPieceType: goalNext.type,
          from: goalNext.pos,
          to: end,
        })
        heap.push(tentativeG + h, { key: nextKey, state: nextState })
      }
    }
  }

  return {
    found: false,
    moves: [],
    reason: "No hay solución con el tablero actual.",
    nodesExpanded,
  }
}

