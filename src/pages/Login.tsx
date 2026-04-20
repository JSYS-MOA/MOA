import type { FormEvent } from "react";
import { useState } from "react";
import { useNavigate } from "react-router";
import { useislogin, useloginInfo } from "../apis/LoginService";
import { useAuthStore } from "../stores/useAuthStore";

const Login = () => {
    const { mutate } = useloginInfo();
    const loginCheck = useislogin();
    const { login } = useAuthStore();

    const [id, setId] = useState("20200001");
    const [pw, setPw] = useState("1234");

    const navigate = useNavigate();

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (loginCheck.data?.result) {
            mutate(
                { id },
                {
                    onSuccess: (data) => {
                        login(data);
                        navigate("/home");
                    },
                    onError: () => {
                        alert("Failed to load user information.");
                    },
                }
            );

            return;
        }

        alert("Invalid employee ID or password.");
    };

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <input type="number" value={id} onChange={(event) => setId(event.target.value)} />
                <input
                    type="password"
                    value={pw}
                    onChange={(event) => setPw(event.target.value)}
                />
                <button type="submit">Submit</button>
            </form>
        </div>
    );
};

export default Login;
