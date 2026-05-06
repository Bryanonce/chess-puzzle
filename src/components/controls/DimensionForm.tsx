import { InputComponents } from "../InputComponents"
import type { Dimensions } from "../../types/chess"

interface DimensionFormProps {
  dimensions: Dimensions
  onChange: (dimensions: Dimensions) => void
}

export const DimensionForm: React.FC<DimensionFormProps> = ({
  dimensions,
  onChange,
}) => {
  return (
    <div className="matrix-inputs">
      <p className="status-label" style={{ marginBottom: 6 }}>
        Tamaño de matriz:{" "}
        <strong>{dimensions.vertical} x {dimensions.horizontal}</strong>
      </p>
      <div className="matrix-inputs-row">
      <InputComponents
        type="number"
        min={1}
        placeholder="input_1 (filas)"
        aria-label="input_1 filas"
        value={dimensions.vertical}
        onChange={(event) =>
          onChange({ ...dimensions, vertical: Number(event.target.value) })
        }
      />
      <span className="matrix-multiplier">×</span>
      <InputComponents
        type="number"
        min={1}
        placeholder="input_2 (columnas)"
        aria-label="input_2 columnas"
        value={dimensions.horizontal}
        onChange={(event) =>
          onChange({ ...dimensions, horizontal: Number(event.target.value) })
        }
      />
      </div>
    </div>
  )
}

