import { MdRefresh } from "react-icons/md";

const Home = () => {


    return (

        <div className="mainPage-Wrapper">
            <div className="left">
                <div className="top">
                    <div className="mainPage-Work">
                        <div className="card-Header">
                            <p className="card-Title">출근/퇴근카드</p>
                            <span className="icon"><MdRefresh /></span>
                        </div>
                        <div className="card-Body">
                            <div className="work-Date">
                                <p className="work-Day"></p>
                                <p className="work-Time"></p>
                            </div>
                            <div className="BtnContainer">
                                <button className="btn-checkin">출근</button>
                                <button className="btn-checkout">퇴근</button>
                            </div>
                        </div>
                    </div>
                    <div className="mainPage-Attendances">

                    </div>
                </div>
            </div>
            <div className="right">

            </div>
        </div>
    )
}

export default Home