//자주 조회하는 데이터 -> react-query -> 캘린더 등
//한번만 요청하는 것 -> async/await  -> 로그인

import {useEffect, useState} from "react";
import {useAuthStore} from "../stores/useAuthStore.tsx";
import {useNavigate} from "react-router";
import {loginApi} from "../apis/LoginService.tsx";
import { FiAlertCircle } from "react-icons/fi";
import "../assets/styles/login.css";
import type { SyntheticEvent } from "react";
import axios from "axios";

const Login = () =>{

  const [employeeId, setEmployeeId] = useState("20200001")
  const [password, setPassword] = useState("1234")
  const [isLoading, setIsLoading] = useState(false)
  const [employeeIdError, setEmployeeIdError] = useState("")
  const [passwordError, setPasswordError] = useState("");
  const [loginError, setLoginError] = useState("");
  const [showTestAccount, setShowTestAccount] = useState(false);
  const {login, user} = useAuthStore();
  const navigate = useNavigate();
  useEffect(() => {
    if (user) {
      navigate("/home");
    }
  }, [user,navigate]);

  const handleSubmit = async (e: SyntheticEvent) => {
    e.preventDefault(); //폼의 기본 동작 = 페이지 새로고침 => handleSubmit 안에 코드 실행 안됨 >이걸 막기위해

    setEmployeeIdError("");
    setPasswordError("");
    setLoginError("");

    if (!employeeId) {
      setEmployeeIdError("아이디를 입력해주세요.")
      return;
    }

    if (!password) {
      setPasswordError("비밀번호를 입력해주세요.");
      return;
    }

    if (isLoading) return;

    setIsLoading(true);
    try {
      const data = await loginApi(employeeId, password);
      login(data);
      navigate("/home")
      console.log(data)
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setLoginError(
            error.response?.data?.message ?? "서버 오류가 발생했습니다"
        );
      } else {
        setLoginError("서버 오류가 발생했습니다")
      }
    }finally {
      setIsLoading(false);
    }
  }
  return(
      <div style={{display:"flex", alignItems:"center",justifyContent:"center", height:"100%"}}>
        <div className="login-Wrapper">
          <div className="logo">
            <h1>MOA</h1>
            <p>All-in-One 비즈니스 솔루션</p>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="login-Id">
              <p className="title">사원코드</p>
              <input
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  placeholder="사원코드 입력"
              />
            </div>
            <p className={`error-Icon ${employeeIdError ? "show" : ""}`}>
              <span><FiAlertCircle /></span>
              {employeeIdError}
            </p>
            <div className="login-Password">
              <p className="title">비밀번호</p>
              <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="비밀번호 입력"
              />
            </div>
            <p className={`error-Icon ${passwordError ? "show" : ""}`}>
              <span><FiAlertCircle /></span>
              {passwordError}
            </p>
            <div className={`login-Error ${loginError ? "show" : ""}`}>
              <span><FiAlertCircle /></span>
              {loginError}
            </div>
            <button type="submit" className="submit-Btn" disabled={isLoading}>
              {isLoading ? (
                  <div className="spinner-Wrap">
                    <span className="spinner"></span>
                    로그인 중...
                  </div>
              ) : ("LOGIN")}
            </button>
            <p className="privacy-Agree">
              처음 방문하셨나요?{" "}
                <span
                    onClick={() => setShowTestAccount(prev => !prev)}
                >
                   테스트 계정
                </span>
                으로 먼저 둘러보세요
            </p>

            {showTestAccount && (
                <div className="test-Account-Box">
                  인사팀 팀장 - 20200001 /
                  인사팀 - 20200002<br />
                  물류팀 - 20210002 /
                  영업팀 - 20210003<br />
                  비밀번호: 1234
                </div>
            )}
          </form>
        </div>
      </div>

  )
};
export default Login;
