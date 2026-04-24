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
import HrCardListPage from "./pages/HR/HrCardListPage.tsx";
import LeaverCardListPage from "./pages/HR/LeaverCardListPage.tsx";


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
                    <Route element={<MainLayout />}>
                        <Route path="/home" element={<MainPage />} />
                        <Route path="/hr/cards" element={<HrCardListPage />} />
                        <Route path="/hr/leaver" element={<LeaverCardListPage />} />
                        <Route path="/hr/leavers" element={<LeaverCardListPage />} />
                        <Route path="/base/:type" element={<Base />} />
                    </Route>
                </Route>

            </Routes>

        </>
    )
}

export default App
