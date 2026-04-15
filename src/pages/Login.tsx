import React, { useState } from "react";
import { useislogin , useloginInfo, islogin , loginInfo } from "../apis/LoginService";
import { useNavigate } from "react-router";
import { useAuthStore } from "../stores/useAuthStore";


const Login = () => {

  const { mutate, isPending } = useloginInfo();
  const loginCheck = useislogin();

  const { login } = useAuthStore();


  const [isuser, setIsUser] = useState({});
  const [user, setUser] = useState({});
  const [id, setId] = useState("20200006");
  const [pw, setPw] = useState("1234");


  const navigate = useNavigate();


  // 리엑트 쿼리 사용  + 쥬스텐드
  const usehandleSubmit = ( e : React.SubmitEvent ) => {
    e.preventDefault();

    if( loginCheck.data?.result ){
      mutate({ id }, {
        onSuccess: (data) => {
          login(data);
          console.log("성공 데이터:", data);
          navigate('/home');
        },
        onError: (error: any) => {
          alert("유저 정보를 가져오는데 실패했습니다.");
        }
      });

    } else{
      alert("비밀번호 또는 아이디가 틀렸습니다.");
    }


  }

  //리엑트 쿼리 미사용 방법
  const handleSubmit = async ( e : React.SubmitEvent ) => {
    e.preventDefault();

    let isLoginSuccess  = await islogin( id , pw);

    console.log(isLoginSuccess);

    if( isLoginSuccess ){
      let deta = loginInfo(id);

      if(deta != null ) {
        setUser(deta);
        navigate('/home');
      } else{
        alert(deta);
      }

    } else{
      alert("비밀번호 또는 아이디가 틀렸습니다.");
    }


  }

  return (
      <div>
        <form onSubmit={usehandleSubmit}>
          <input type="number"  value={id} onChange={(e)=>setId(e.target.value)}  />
          <input type="password" value={pw} onChange={(e)=>setPw(e.target.value)} />
          <button type="submit"> 제출 </button>
        </form>
      </div>
  )
}

export default Login