import type { IconDefinition } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"

interface IChessIcon extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>{
    icon: IconDefinition
}

export const ChessIcon: React.FC<IChessIcon> = (params) => {
    const { icon, ...rest } = params
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
        <FontAwesomeIcon icon={icon} />
    </div>
}