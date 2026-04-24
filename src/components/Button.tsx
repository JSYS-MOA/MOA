import  { type ButtonProps } from "../types/buttonProps"

const Button = ( { label , onClick } : ButtonProps ) => {
  return (
    <button onClick={onClick}>
      {label}
    </button>
  )
}

export default Button
