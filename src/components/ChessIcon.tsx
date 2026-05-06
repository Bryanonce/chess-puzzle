import type { CSSProperties } from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import type { PieceType } from "../types/chess"
import { getPieceIcon } from "../utils/pieces"

interface IChessIcon extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> {
    piece: PieceType
    style?: CSSProperties
}

export const ChessIcon: React.FC<IChessIcon> = (params) => {
    const { piece, ...rest } = params
    return <div {...rest} style={{
        margin: "4px",
        padding: "15px",
        borderRadius: "8px",
        cursor: "pointer",
        backgroundColor: "lightgray",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        ...rest.style
    }}>
        <FontAwesomeIcon icon={getPieceIcon(piece)} />
    </div>
}