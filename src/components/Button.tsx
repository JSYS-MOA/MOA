import  { type ButtonProps } from "../types/buttonProps"

const Button = ( { label , onClick } : ButtonProps ) => {
  return (
    <button onClick={onClick}>
      버튼 {label}
    </button>
  )
}

export default Button
