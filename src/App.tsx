import { useState } from "react"
import { InputComponents } from "./components/InputComponents"
import { OptionChess } from "./components/OptionChess";
import type { IconDefinition } from "@fortawesome/free-solid-svg-icons";
import "./App.css"
import { ChessIcon } from "./components/ChessIcon";

interface IDimensions { horizontal: number; vertical: number }

export const App: React.FC = () => {

  const [dimensions, setDimensions] = useState<IDimensions>({ horizontal: 0, vertical: 0 })
  const [matrix, setMatrix] = useState<IconDefinition[][]>([])
  const [isSelectorOpen, setIsSelectorOpen] = useState<number>(0)

  console.log({matrix})

  const handleOnClick = () => {
    const newMatrix: IconDefinition[][] = []
    for (let i = 0; i < dimensions.vertical; i++) {
      const row: IconDefinition[] = []
      for (let j = 0; j < dimensions.horizontal; j++) {
        row.push({} as IconDefinition)
      }
      newMatrix.push(row)
    }
    setMatrix(newMatrix)
  }

  const handleOnSelect = (param: IconDefinition) => {
    setMatrix((prev) => {
      const newMatrix = [...prev]
      const rowIndex = Math.floor(isSelectorOpen / dimensions.horizontal)
      const cellIndex = isSelectorOpen % dimensions.horizontal
      newMatrix[rowIndex][cellIndex] = param
      return newMatrix
    })
    setIsSelectorOpen(0)
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

    <button onClick={handleOnClick}>
      Generate
    </button>

    {!!isSelectorOpen && <OptionChess handleOnSelect={handleOnSelect} />}

    <div style={{
      width: "100%",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      padding: "16px"
    }}>
      {
        matrix.map((row, rowIndex) => {
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
                    flexDirection: "row",
                    backgroundColor: (rowIndex + cellIndex) % 2 === 0 ? "white" : "black"
                  }} key={`${rowIndex}-${cellIndex}`}
                  onClick={() => setIsSelectorOpen(rowIndex * dimensions.horizontal + cellIndex)}
                >
                  {cell.iconName && <ChessIcon icon={cell} onClick={() => setIsSelectorOpen(rowIndex * dimensions.horizontal + cellIndex)} />}
                </div>
              })
            }
          </div>
        })
      }
    </div>
  </div>
}