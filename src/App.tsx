import { useEffect, useState } from "react"
import { InputComponents } from "./components/InputComponents"
import { OptionChess } from "./components/OptionChess";
import type { IconDefinition } from "@fortawesome/free-solid-svg-icons";
import "./App.css"
import { ChessIcon } from "./components/ChessIcon";
import { useChessMovements, type IDimensions, type IPosition } from "./hooks/useChessMovements";

export const App: React.FC = () => {
  const [dimensions, setDimensions] = useState<IDimensions>({ horizontal: 0, vertical: 0 })
  const { store, start, set, setPuzzleInitial, setPuzzleEnd, verifyMovements, move } = useChessMovements()
  const [status, setStatus] = useState<"generate" | "setChessPieces" | "setInitial" | "setEnd" | "play" | "move-piece">("generate")
  const [positionSelected, setPositionSelected] = useState<IPosition | null>(null)
  const [pieceSelected, setPieceSelected] = useState<IPosition | null>(null)
  const [openOptionChess, setOpenOptionChess] = useState<boolean>(false)


  useEffect(() => {
    switch (status) {
      case "setChessPieces":
        if (positionSelected) {
          setOpenOptionChess(true)
        } else {
          setOpenOptionChess(false)
        }
        break
      case "setInitial":
        if (positionSelected) {
          setPuzzleInitial(positionSelected.row, positionSelected.cell)
          setPositionSelected(null)
        }
        break;
      case "setEnd":
        if (positionSelected) {
          setPuzzleEnd(positionSelected.row, positionSelected.cell)
          setPositionSelected(null)
        }
        break;
      case "play":
        if (positionSelected) {
          verifyMovements(positionSelected.row, positionSelected.cell)
          setPieceSelected(positionSelected)
          setPositionSelected(null)
          setStatus("move-piece")
        }
        break;
      case "move-piece":
        if (positionSelected) {
          move({ row: pieceSelected!.row, cell: pieceSelected!.cell }, { row: positionSelected.row, cell: positionSelected.cell })
          if(pieceSelected?.row === store.puzzleInitial.row && pieceSelected?.cell === store.puzzleInitial.cell) {
            setPuzzleInitial(positionSelected.row, positionSelected.cell)
          }
          setStatus("play")
        }
        break;
      default:
        break
    }
  }, [positionSelected])

  const handleOnSelect = (param: IconDefinition) => {
    if (positionSelected) {
      set(positionSelected, param)
      setPositionSelected(null)
    }
  }

  return <div style={{
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center"
  }}>
    <h1>Chess Puzzle</h1>
    <div>
      <InputComponents
        placeholder="vertical"
        value={dimensions.vertical}
        onChange={(e) => setDimensions({ ...dimensions, vertical: Number(e.target.value) })}
      />

      <InputComponents
        placeholder="horizontal"
        value={dimensions.horizontal}
        onChange={(e) => setDimensions({ ...dimensions, horizontal: Number(e.target.value) })}
      />
    </div>

    <div>
      {status === "generate" && <button
        onClick={() => { start(dimensions); setStatus("setChessPieces") }}
        style={{
          appearance: "none",
          padding: "16px",
          backgroundColor: "lightblue",
          borderRadius: "8px",
          border: "none",
          width: "100px",
          margin: "8px"
        }}
      >
        Generate
      </button>}

      {status === "setChessPieces" && <button
        onClick={() => setStatus("setInitial")}
        style={{
          appearance: "none",
          padding: "16px",
          backgroundColor: "lightblue",
          borderRadius: "8px",
          border: "none",
          width: "100px",
          margin: "8px"
        }}
      >
        Continue
      </button>}

      {status === "setInitial" && <button
        onClick={() => setStatus("setEnd")}
        style={{
          appearance: "none",
          padding: "16px",
          backgroundColor: "lightblue",
          borderRadius: "8px",
          border: "none",
          width: "100px",
          margin: "8px"
        }}
      >
        Seleccionar pieza
      </button>}

      {status === "setEnd" && <button
        onClick={() => setStatus("play")}
        style={{
          appearance: "none",
          padding: "16px",
          backgroundColor: "lightblue",
          borderRadius: "8px",
          border: "none",
          width: "100px",
          margin: "8px"
        }}
      >
        Seleccionar posicion final
      </button>}
    </div>

    {openOptionChess && status === "setChessPieces" && <OptionChess handleOnSelect={handleOnSelect} />}

    {status}
    <div style={{
      width: "100%",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      padding: "16px"
    }}>
      {
        store.matrix.map((row, rowIndex) => {
          return <div style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
          }}
            key={rowIndex}>
            {
              row.map((cell, cellIndex) => {
                return <div
                  style={{
                    width: "100px",
                    height: "100px",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: store.puzzleEnd.row === rowIndex && store.puzzleEnd.cell === cellIndex ? "lightgreen" : (rowIndex + cellIndex) % 2 === 0 ? "white" : "rgb(0,0,0,0.8)",
                  }} key={`${rowIndex}-${cellIndex}`}
                  onClick={() => setPositionSelected({ row: rowIndex, cell: cellIndex })}
                >
                  <div
                    style={{
                      position: "absolute",
                      padding: "16px",
                      backgroundColor: store.posibleMovements.some(movement => movement.row === rowIndex && movement.cell === cellIndex) ? "rgba(0,255,0,0.5)" : "transparent",
                      borderRadius: "50%",
                      zIndex: 100
                    }}
                  ></div>
                  {cell.iconName && <ChessIcon style={{
                    border: store.puzzleInitial.row === rowIndex && store.puzzleInitial.cell === cellIndex ? "2px solid green" : "none",
                  }} icon={cell} />}
                </div>
              })
            }
          </div>
        })
      }
    </div>
  </div>
}