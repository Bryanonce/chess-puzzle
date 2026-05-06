import React from "react"

interface InputProps extends React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> {}

export const InputComponents: React.FC<InputProps> = (props: InputProps) => {
  return <input style={{
    appearance: "none",
    width: "min(100%, 220px)",
    boxSizing: "border-box",
    padding: "12px 14px",
    borderRadius: "8px",
    borderColor: "black",
    borderStyle: "solid",
    borderWidth: "2px",
    margin: "8px",
    ...props.style,
  }} {...props} />
}