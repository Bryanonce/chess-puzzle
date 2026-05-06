import type { IconDefinition } from "@fortawesome/free-solid-svg-icons"
import { useState } from "react"

export interface IDimensions { horizontal: number; vertical: number }
export interface IPosition { row: number; cell: number }
export interface IChessMovementsStore {
    dimensions: IDimensions
    matrix: IconDefinition[][]
    puzzleInitial: IPosition
    puzzleEnd: IPosition
    posibleMovements: IPosition[]
}

export const useChessMovements = () => {
    const [store, setStore] = useState<IChessMovementsStore>({
        dimensions: { horizontal: 0, vertical: 0 },
        matrix: [],
        puzzleInitial: { row: -1, cell: -1 },
        puzzleEnd: { row: -1, cell: -1 },
        posibleMovements: []
    })

    const start = (dimensions: IDimensions) => {
        const newMatrix: IconDefinition[][] = []
        for (let i = 0; i < dimensions.vertical; i++) {
            const row: IconDefinition[] = []
            for (let j = 0; j < dimensions.horizontal; j++) {
                row.push({} as IconDefinition)
            }
            newMatrix.push(row)
        }
        setStore((prev) => ({ ...prev, dimensions, matrix: newMatrix }))
    }

    const setPuzzleInitial = (row: number, cell: number) => {
        setStore((prev) => ({ ...prev, puzzleInitial: { row, cell } }))
    }

    const setPuzzleEnd = (row: number, cell: number) => {
        setStore((prev) => ({ ...prev, puzzleEnd: { row, cell } }))
    }

    const set = (position: IPosition, icon: IconDefinition) => {
        setStore((prev) => {
            const newMatrix = [...prev.matrix]
            const rowIndex = position.row
            const cellIndex = position.cell
            newMatrix[rowIndex][cellIndex] = icon
            return { ...prev, matrix: newMatrix }
        })
    }

    const verifyMovements = (rowIndex: number, cellIndex: number) => {
        const cell = store.matrix[rowIndex][cellIndex]
        let movements: IPosition[] = []
        switch (cell.iconName) {
            case "chess-pawn":
                movements.push({ row: rowIndex - 1, cell: cellIndex })
                break
            case "chess-rook":
                for (let i = 0; i < store.matrix.length; i++) {
                    if (i !== rowIndex) movements.push({ row: i, cell: cellIndex })
                }
                for (let j = 0; j < store.matrix[0].length; j++) {
                    if (j !== cellIndex) movements.push({ row: rowIndex, cell: j })
                }

                // Evitar movimientos que tengan una pieza que trunque el movimiento
                movements = movements.filter(movement => {
                    if (movement.row === rowIndex) {
                        const min = Math.min(movement.cell, cellIndex)
                        const max = Math.max(movement.cell, cellIndex)
                        for (let j = min + 1; j < max; j++) {
                            if (store.matrix[rowIndex][j].iconName) {
                                return false
                            }
                        }
                    } else if (movement.cell === cellIndex) {
                        const min = Math.min(movement.row, rowIndex)
                        const max = Math.max(movement.row, rowIndex)
                        for (let i = min + 1; i < max; i++) {
                            if (store.matrix[i][cellIndex].iconName) {
                                return false
                            }
                        }
                    }
                    return true
                })
                break
            case "chess-knight":
                const knightMoves = [
                    { row: -2, cell: -1 },
                    { row: -2, cell: 1 },
                    { row: -1, cell: -2 },
                    { row: -1, cell: 2 },
                    { row: 1, cell: -2 },
                    { row: 1, cell: 2 },
                    { row: 2, cell: -1 },
                    { row: 2, cell: 1 },
                ]
                knightMoves.forEach(move => {
                    const newRow = rowIndex + move.row
                    const newCell = cellIndex + move.cell
                    if (newRow >= 0 && newRow < store.matrix.length && newCell >= 0 && newCell < store.matrix[0].length) {
                        movements.push({ row: newRow, cell: newCell })
                    }
                })
                break
            case "chess-bishop":
                for (let i = 1; i < store.matrix.length; i++) {
                    if (rowIndex - i >= 0 && cellIndex - i >= 0) movements.push({ row: rowIndex - i, cell: cellIndex - i })
                    if (rowIndex - i >= 0 && cellIndex + i < store.matrix[0].length) movements.push({ row: rowIndex - i, cell: cellIndex + i })
                    if (rowIndex + i < store.matrix.length && cellIndex - i >= 0) movements.push({ row: rowIndex + i, cell: cellIndex - i })
                    if (rowIndex + i < store.matrix.length && cellIndex + i < store.matrix[0].length) movements.push({ row: rowIndex + i, cell: cellIndex + i })
                }

                // Evitar movimientos que tengan una pieza que trunque el movimiento
                movements = movements.filter(movement => {
                    const rowDiff = movement.row - rowIndex
                    const cellDiff = movement.cell - cellIndex
                    const stepRow = rowDiff === 0 ? 0 : rowDiff / Math.abs(rowDiff)
                    const stepCell = cellDiff === 0 ? 0 : cellDiff / Math.abs(cellDiff)
                    let currentRow = rowIndex + stepRow
                    let currentCell = cellIndex + stepCell
                    while (currentRow !== movement.row || currentCell !== movement.cell) {
                        if (store.matrix[currentRow][currentCell].iconName) {
                            return false
                        }
                        currentRow += stepRow
                        currentCell += stepCell
                    }
                    return true
                })
            
                break
            case "chess-queen":
                for (let i = 0; i < store.matrix.length; i++) {
                    if (i !== rowIndex) movements.push({ row: i, cell: cellIndex })
                }
                for (let j = 0; j < store.matrix[0].length; j++) {
                    if (j !== cellIndex) movements.push({ row: rowIndex, cell: j })
                }
                for (let i = 1; i < store.matrix.length; i++) {
                    if (rowIndex - i >= 0 && cellIndex - i >= 0) movements.push({ row: rowIndex - i, cell: cellIndex - i })
                    if (rowIndex - i >= 0 && cellIndex + i < store.matrix[0].length) movements.push({ row: rowIndex - i, cell: cellIndex + i })
                    if (rowIndex + i < store.matrix.length && cellIndex - i >= 0) movements.push({ row: rowIndex + i, cell: cellIndex - i })
                    if (rowIndex + i < store.matrix.length && cellIndex + i < store.matrix[0].length) movements.push({ row: rowIndex + i, cell: cellIndex + i })
                }
                // Evitar movimientos que tengan una pieza que trunque el movimiento
                movements = movements.filter(movement => {
                    if (movement.row === rowIndex || movement.cell === cellIndex) {
                        if (movement.row === rowIndex) {
                            const min = Math.min(movement.cell, cellIndex)
                            const max = Math.max(movement.cell, cellIndex)
                            for (let j = min + 1; j < max; j++) {
                                if (store.matrix[rowIndex][j].iconName) {
                                    return false
                                }
                            }
                        } else if (movement.cell === cellIndex) {
                            const min = Math.min(movement.row, rowIndex)
                            const max = Math.max(movement.row, rowIndex)
                            for (let i = min + 1; i < max; i++) {
                                if (store.matrix[i][cellIndex].iconName) {
                                    return false
                                }
                            }
                        }
                    } else {
                        const rowDiff = movement.row - rowIndex
                        const cellDiff = movement.cell - cellIndex
                        const stepRow = rowDiff === 0 ? 0 : rowDiff / Math.abs(rowDiff)
                        const stepCell = cellDiff === 0 ? 0 : cellDiff / Math.abs(cellDiff)
                        let currentRow = rowIndex + stepRow
                        let currentCell = cellIndex + stepCell
                        while (currentRow !== movement.row || currentCell !== movement.cell) {
                            if (store.matrix[currentRow][currentCell].iconName) {
                                return false
                            }
                            currentRow += stepRow
                            currentCell += stepCell
                        }
                    }
                    return true
                })
                
                break
            case "chess-king":
                const kingMoves = [
                    { row: -1, cell: -1 },
                    { row: -1, cell: 0 },
                    { row: -1, cell: 1 },
                    { row: 0, cell: -1 },
                    { row: 0, cell: 1 },
                    { row: 1, cell: -1 },
                    { row: 1, cell: 0 },
                    { row: 1, cell: 1 },
                ]
                kingMoves.forEach(move => {
                    const newRow = rowIndex + move.row
                    const newCell = cellIndex + move.cell
                    if (newRow >= 0 && newRow < store.matrix.length && newCell >= 0 && newCell < store.matrix[0].length) {
                        movements.push({ row: newRow, cell: newCell })
                    }
                })
                break
            default:
                break
        }

        // Filtrar movimientos que tengan una pieza encima
        movements = movements.filter(movement => {
            return !(store.matrix[movement.row][movement.cell].iconName)
        })

        // Guardar movimientos posibles en el estado
        setStore((prev) => ({ ...prev, posibleMovements: movements }))
    }

    const move = (piece: IPosition, cell: IPosition): void => {
        const newMatrix = [...store.matrix]
        if(store.posibleMovements.some(movement => movement.row === cell.row && movement.cell === cell.cell)) {
            newMatrix[cell.row][cell.cell] = newMatrix[piece.row][piece.cell]
            newMatrix[piece.row][piece.cell] = {} as IconDefinition
        }
        setStore((prev) => ({ ...prev, matrix: newMatrix, posibleMovements: [] }))
    }

    return { store, start, set, setPuzzleInitial, setPuzzleEnd, verifyMovements, move }
}