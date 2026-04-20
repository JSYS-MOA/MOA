import type { ButtonProps } from "../types/buttonProps";

const Button = ({ label, children, type = "button", ...rest }: ButtonProps) => {
    return (
        <button type={type} {...rest}>
            {children ?? label}
        </button>
    );
};

export default Button;
