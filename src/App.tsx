import {Route, Routes} from 'react-router'
import MainLayout from './components/layout/MainLayout'
import Login from './pages/Login'
import {useAuthStore} from "./stores/useAuthStore.tsx";
import {useEffect, useState} from "react";
import {authCheck} from "./apis/LoginService.tsx";
import PrivateRoute from "./components/PrivateRoute.tsx";
import MainPage from "./pages/main/MainPage.tsx";
import HrCardListPage from "./pages/HR/HrCardListPage.tsx";

const App = () => {
    const { login } = useAuthStore();
    const [isLoading, setIsLoading] = useState(true)

    useEffect(()=>{
        authCheck()
            .then((data) => {
                if (data.result) {
                    login(data);
                }
            })
            .catch((err)=>console.error(err))
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
                    </Route>
                </Route>

            </Routes>

        </>
    )
}

export default App