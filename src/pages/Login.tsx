import React, { useState } from "react";
import { useNavigate } from "react-router";

import { useislogin, useloginInfo } from "../apis/LoginService";
import { useAuthStore } from "../stores/useAuthStore";

const Login = () => {
    const { mutate } = useloginInfo();
    const loginCheck = useislogin();
    const { login } = useAuthStore();

    const [id, setId] = useState("20200006");
    const [pw, setPw] = useState("1234");

    const navigate = useNavigate();

    const usehandleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (loginCheck.data?.result) {
            mutate(
                { id },
                {
                    onSuccess: (data) => {
                        login(data);
                        navigate("/home");
                    },
                    onError: () => {
                        alert("유저 정보를 가져오는데 실패했습니다.");
                    },
                },
            );
        } else {
            alert("비밀번호 또는 아이디가 일치하지 않습니다.");
        }
    };

    return (
        <div>
            <form onSubmit={usehandleSubmit}>
                <input type="number" value={id} onChange={(e) => setId(e.target.value)} />
                <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} />
                <button type="submit">제출</button>
            </form>
        </div>
    );
};

export default Login;
