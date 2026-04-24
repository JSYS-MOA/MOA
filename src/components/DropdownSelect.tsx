import {SlArrowDown} from "react-icons/sl";
import {useState} from "react";
import "../assets/styles/component/dropdownSelect.css";

interface DropdownSelectProps {
    value: number;
    options: number[];
    onChange: (value: number) => void;
    allowInput?: boolean;     // 직접입력 허용 여부
}
const DropdownSelect = ({value, options, onChange,allowInput = false}:DropdownSelectProps) => {

    const [isOpen, setIsOpen] = useState(false);

    return(
        <div className="dropdown-Wrapper">
            <div className="dropdown-Value">
                <button onClick={() => setIsOpen(!isOpen)}>
                    <span>{value}</span>
                    <span className="dropdown-Check">
                        <SlArrowDown size={11}/>
                    </span>
                </button>
            </div>
            {isOpen && (
                <div className="dropdown-List">
                    {options.map(opt => (
                        <button
                            key={opt}
                            className={`dropdown-Item ${opt === value ? "active" : ""}`}
                            onClick={() => {
                                onChange(opt);
                                setIsOpen(false);
                            }}
                        >
                            <span>{opt}</span>
                            <span className="dropdown-Check">{opt === value ? "✓" : ""}</span>
                        </button>
                    ))}
                    {allowInput && (
                        <input
                            type="number"
                            placeholder="직접입력"
                            className="dropdown-Input"
                            onKeyDown={(e)=>{
                            if (e.key === "Enter"){
                                const v = parseInt((e.target as HTMLInputElement).value);
                                if(!isNaN(v)){
                                    onChange(v);
                                    setIsOpen(false);
                                }
                            }
                            }}
                        />
                    )}
                </div>
            )}
        </div>
    )
}
export default DropdownSelect;