import React from "react"

interface InputProps extends React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> {}

export const InputComponents: React.FC<InputProps> = (props: InputProps) => {
  return <input style={{
    appearance: "none",
    padding: "16px",
    borderRadius: "8px",
    borderColor: "black",
    borderStyle: "solid",
    borderWidth: "2px",
    margin: "16px",
  }} {...props} />
}