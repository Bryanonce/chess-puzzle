import { ChessIcon } from "./ChessIcon"
import type { PieceType } from "../types/chess"
import { PIECE_OPTIONS } from "../utils/pieces"


interface IOptionChess {
    handleOnSelect: (piece: PieceType) => void
}

export const OptionChess: React.FC<IOptionChess> = ({ handleOnSelect }) => {

    return <div style={{
        width: "100%",
        height: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        position: "absolute"
    }}>
        <div
            style={{
                border: "2px solid black",
                maxWidth: "200px",
                borderRadius: "8px",
                padding: "16px",
                display: "flex",
                justifyContent: "space-around",
                alignItems: "stretch",
                flexWrap: "wrap",
                position: "absolute",
                backgroundColor: "white",
                top: window.innerHeight / 2,
                left: window.innerWidth / 2,
                transform: "translate(-50%, -50%)",
                zIndex: 1000
            }}
        >
            {PIECE_OPTIONS.map((piece) => (
                <ChessIcon key={piece} piece={piece} onClick={() => handleOnSelect(piece)} />
            ))}
        </div>
    </div>
}