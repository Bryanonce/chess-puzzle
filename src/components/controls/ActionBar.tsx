interface ActionBarProps {
  primary?: {
    label: string
    onClick: () => void
    disabled?: boolean
  }
  secondary?: {
    label: string
    onClick: () => void
    disabled?: boolean
  }
}

export const ActionBar: React.FC<ActionBarProps> = ({ primary, secondary }) => {
  if (!primary && !secondary) return null

  return (
    <div className="actions">
      {primary && (
        <button
          className="primary-button"
          disabled={primary.disabled}
          onClick={primary.onClick}
        >
          {primary.label}
        </button>
      )}
      {secondary && (
        <button
          className="primary-button"
          disabled={secondary.disabled}
          onClick={secondary.onClick}
        >
          {secondary.label}
        </button>
      )}
    </div>
  )
}

