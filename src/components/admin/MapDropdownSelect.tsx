import {SlArrowDown} from "react-icons/sl";
import {useState, useRef, useEffect } from "react";
import "../../assets/styles/component/dropdownSelect.css";

interface MapDropdownSelectProps {
    id : any;
    value: any;
    options: any[];
    onChange: (id: number, value: any) => void;
    allowInput?: boolean;     // 직접입력 허용 여부
}
const MapDropdownSelect = ({id , value, options, onChange }:MapDropdownSelectProps ) => {

    
    const [isOpen, setIsOpen] = useState(false);
    const selectedOption = options.find(opt => opt.id === value);
    const dropdownRef = useRef<HTMLDivElement>(null);
    
   useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen]);

    return(
        <div className="dropdown-Wrapper" ref={dropdownRef}>
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
                            onClick={() => {
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