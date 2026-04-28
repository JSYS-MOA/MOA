import {Route, Routes} from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import Login from './pages/Login';
import {useAuthStore} from "./stores/useAuthStore.tsx";
import {useEffect, useState} from "react";
import {authCheck} from "./apis/LoginService.tsx";
import PrivateRoute from "./components/PrivateRoute.tsx";
import MainPage from "./pages/main/MainPage.tsx";
import axios from "axios";
import MyInfo from "./pages/mypage/MyInfo.tsx";
import MyCalendar from "./pages/mypage/MyCalendar.tsx";
import Base from "./pages/base/Base.tsx";
import Admin from './pages/admin/Admin.tsx';
import Inventory from './pages/inventory/Inventory.tsx';
import InventoryDisposals from './pages/inventory/InventoryDisposals.tsx';
import InventoryOrder from './pages/inventory/InventoryOrder.tsx';
import InventoryInbounds from './pages/inventory/InventoryInbounds.tsx';
import InventoryOutbound from './pages/inventory/InventoryOutbound.tsx';
import Approvals from './pages/approvals/Approvals.tsx';
import HRLists from "./pages/hr2/HRLists.tsx";



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
                        <Route path="/my/calendars" element={<MyCalendar />} />
                        <Route path="/hr/annualLeaves" element={<Base apiType="annualLeaves" />} />
                        <Route path="/admin/levels" element={<Admin />} />
                        <Route path="/hr/:type" element={<HRLists />} />
                    </Route>
                </Route>

                <Route element={<PrivateRoute />}>
                    <Route element={<MainLayout />}>
                    <Route path="/home" element={<MainPage />} />

                        <Route path="/inventory">
                            <Route index element={<Inventory/>} />
                            <Route path="status" element={<Inventory/>} />
                            <Route path="disposals" element={<InventoryDisposals/>} />
                            <Route path="orders" element={<InventoryOrder/>} />
                            <Route path="inbounds" element={<InventoryInbounds/>} />
                            <Route path="outbounds" element={<InventoryOutbound/>} />
                        </Route>
                        
                        <Route path="/gw">
                            <Route index element={<Approvals/>} />
                            <Route path="approvals" element={<Approvals/>} />
                        </Route>



                    </Route>
                </Route>

                

      </Routes>

    
    </>
  )
}

export default App
