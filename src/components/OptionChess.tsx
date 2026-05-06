import { type IconDefinition } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import {
    faChessBishop,
    faChessKing,
    faChessKnight,
    faChessPawn,
    faChessQueen,
    faChessRook
} from "@fortawesome/free-solid-svg-icons"
import { ChessIcon } from "./ChessIcon"

const icons = [
    faChessBishop,
    faChessKing,
    faChessKnight,
    faChessPawn,
    faChessQueen,
    faChessRook
]

interface IOptionChess {
    handleOnSelect: (param: IconDefinition) => void
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
            }}
        >
            {icons.map((icon) => (
                <ChessIcon key={icon.iconName} icon={icon} onClick={() => handleOnSelect(icon)} />
            ))}
        </div>
    </div>
}