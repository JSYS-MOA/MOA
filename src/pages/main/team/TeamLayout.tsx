import {BiLinkExternal} from "react-icons/bi";
import {MdRefresh} from "react-icons/md";
import React from "react";
import {useNavigate} from "react-router";

interface TeamLayoutProps{
    children?:React.ReactNode;
    title:string;
    linkTo?:string;
    onRefresh?: () => void;
}
const TeamLayout = ({children, title, linkTo, onRefresh}:TeamLayoutProps) => {

    const navigate = useNavigate();
    return(
        <div className="team_Wrapper">
            <div className="team-Header">
                <p>{title}</p>
                <div className="Header-Icon">
                    {linkTo && (
                        <BiLinkExternal
                            size={16}
                            color="#d0d0d0"
                            onClick={() => navigate(linkTo)}
                        />
                    )}
                    {onRefresh && (
                        <MdRefresh
                            size={19}
                            color="#d0d0d0"
                            onClick={onRefresh}
                        />
                    )}
                </div>
            </div>
            {children}
        </div>
    )
}
export default TeamLayout;