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
    <div>
      <InputComponents
        type="number"
        min={1}
        placeholder="vertical"
        value={dimensions.vertical}
        onChange={(event) =>
          onChange({ ...dimensions, vertical: Number(event.target.value) })
        }
      />
      <InputComponents
        type="number"
        min={1}
        placeholder="horizontal"
        value={dimensions.horizontal}
        onChange={(event) =>
          onChange({ ...dimensions, horizontal: Number(event.target.value) })
        }
      />
    </div>
  )
}

