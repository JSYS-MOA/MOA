import {BiLinkExternal} from "react-icons/bi";
import {MdRefresh} from "react-icons/md";
import React from "react";

interface TeamLayoutProps{
    children?:React.ReactNode;
    title:string;
}
const TeamLayout = ({children, title}:TeamLayoutProps) => {

    return(
        <div className="team_Wrapper">
            <div className="team-Header">
                <p>{title}</p>
                <div className="Header-Icon">
                    <BiLinkExternal size={16} color="#d0d0d0" />
                    <MdRefresh size={19} color="#d0d0d0"/>
                </div>
            </div>
            {children}
        </div>
    )
}
export default TeamLayout;