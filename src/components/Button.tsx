import type { ButtonProps } from "../types/buttonProps";

const Button = ({ label, type = "button", ...props }: ButtonProps) => {
    return (
        <button type={type} {...props}>
            {label}
        </button>
    );
};

export default Button;
