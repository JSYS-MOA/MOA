import {Route, Routes} from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import Login from './pages/Login';
import {useAuthStore} from "./stores/useAuthStore.tsx";
import {useEffect, useState} from "react";
import {authCheck} from "./apis/LoginService.tsx";
import PrivateRoute from "./components/PrivateRoute.tsx";
import MainPage from "./pages/main/MainPage.tsx";
import axios from "axios";
import Base from "./pages/Base.tsx";
import MyInfo from "./pages/mypage/MyInfo.tsx";


const App = () => {
    const { login } = useAuthStore();
    const [isLoading, setIsLoading] = useState(true)

    useEffect(()=>{
        authCheck()
            .then((data) => {
                login(data);
            })
            .catch((error)=>{
                if(axios.isAxiosError(error) && error.response?.status === 401) {
                    //
                }else{
                    console.error("authCheck error",error);
                }
            })
            .finally(()=>{
                setIsLoading(false)
            });
    },[login]);

    if (isLoading) return null;

    return (
        <>
            <Routes>
                <Route path="/" element={<Login/>} />

                <Route element={<PrivateRoute />}>
                    {/* 메인페이지는 여기 있어야됨 -> 링크이동이 안 돼서 임시로 mainLayout안에 둠*/}
                    <Route element={<MainLayout />}>
                        <Route path="/home" element={<MainPage />} />
                        <Route path="/base/:type" element={<Base />} />
                        <Route path="/my/profile" element={<MyInfo />} />
                    </Route>
                </Route>

            </Routes>

        </>
    )
}

export default App
