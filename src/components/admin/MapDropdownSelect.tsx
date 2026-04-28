import {SlArrowDown} from "react-icons/sl";
import {useState} from "react";
import "../../assets/styles/component/dropdownSelect.css";

interface MapDropdownSelectProps {
    id : any;
    value: any;
    options: any[];
    onChange: (id: number, value: any) => void;
    allowInput?: boolean;     // 직접입력 허용 여부
}
const MapDropdownSelect = ({id , value, options, onChange,allowInput = false}:MapDropdownSelectProps ) => {

     const selectedOption = options.find(opt => opt.id === value);
    const [isOpen, setIsOpen] = useState(false);

    return(
        <div className="dropdown-Wrapper">
            <div className="dropdown-Value">
                <button onClick={() => setIsOpen(!isOpen)}>
                    <span>{selectedOption ? selectedOption.name : value}</span>
                    <span className="dropdown-Check">
                        <SlArrowDown size={11}/>
                    </span>
                </button>
            </div>
            {isOpen && (
                <div className="dropdown-right-List">
                    {options.map(opt => (
                        <button
                            key={opt.id}
                            className={`dropdown-Item ${opt.id === value ? "active" : ""}`}
                            onClick={(e) => {
                                onChange(id , opt.id);
                                setIsOpen(false);
                            }}
                        >
                            <span>{opt.name}</span>
                            <span className="dropdown-Check">{opt.id === value ? "✓" : ""}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}
export default MapDropdownSelect;