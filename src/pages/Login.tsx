//자주 조회하는 데이터 -> react-query -> 캘린더 등
//한번만 요청하는 것 -> async/await  -> 로그인

import React,{useState} from "react";
import {useAuthStore} from "../stores/useAuthStore.tsx";
import {Link, useNavigate} from "react-router";
import {loginApi} from "../apis/LoginService.tsx";
import { FiAlertCircle } from "react-icons/fi";
import "../assets/styles/login.css";

const Login = () =>{

  const [employeeId, setEmployeeId] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [employeeIdError, setEmployeeIdError] = useState("")
  const [passwordError, setPasswordError] = useState("");
  const [loginError, setLoginError] = useState("");
  const {login} = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault(); //폼의 기본 동작 = 페이지 새로고침 => handleSubmit 안에 코드 실행 안됨 >이걸 막기위해

    setEmployeeIdError("");
    setPasswordError("");
    setLoginError("");

    if(!employeeId){
      setEmployeeIdError("아이디를 입력해주세요.")
      return;
    }

    if (!password) {
      setPasswordError("비밀번호를 입력해주세요.");
      return;
    }

    if(isLoading) return;

    setIsLoading(true);
    try {
      const data = await loginApi(employeeId,password);

      if(data.result){
        login(data);
        navigate("/home");
      }else{
        setLoginError(data.message);
      }
    } catch{
      setLoginError("서버 오류가 발생했습니다")
    }finally {
      setIsLoading(false)
    }
  }

  return(
    <div className="login-wrap">
      <div className="logo">
        <h2>MOA</h2>
        <p>All-in-One 비즈니스 솔루션</p>
      </div>
      <form onSubmit={handleSubmit}>
        <h4 className="title">사원코드</h4>
        <input
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
            placeholder="사원코드 입력"
        />
        {employeeIdError &&
            <p className="error-icon">
              <span><FiAlertCircle /></span>
              {employeeIdError}
            </p>
        }
        <h4 className="title">비밀번호</h4>
        <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호 입력"
        />
        {passwordError &&
            <p className="error-icon">
              <span><FiAlertCircle /></span>
              {passwordError}
            </p>
        }
        {loginError &&
            <div className="login-error">
              {loginError}
            </div>
        }
        <button type="submit" className="submit-btn" disabled={isLoading}>
          {isLoading ? (
              <div className="spinner-wrap">
                <span className="spinner"></span>
                로그인 중...
              </div>
          ) : ("LOGIN")}
        </button>
        <p className="privacy-agree">
          서비스 이용 시 <span>이용약관</span>과
          <span>개인정보처리방침</span>에 동의한 것으로 간주합니다
        </p>
        <Link to="/find-password">비밀번호찾기</Link>
      </form>
    </div>
  )
};
export default Login;
