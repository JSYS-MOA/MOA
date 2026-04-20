import {Route, Routes} from 'react-router'
import MainLayout from './components/layout/MainLayout'
import Login from './pages/Login'
import {useAuthStore} from "./stores/useAuthStore.tsx";
import {useEffect, useState} from "react";
import {authCheck} from "./apis/LoginService.tsx";
import PrivateRoute from "./components/PrivateRoute.tsx";
import MainPage from "./pages/main/MainPage.tsx";
import axios from "axios";
import Home from './pages/Home.tsx';
import Admin from './pages/Admin.tsx';
import Inventory from './pages/inventory/Inventory.tsx';
import InventoryDisposals from './pages/inventory/InventoryDisposals.tsx';


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

        <Route element={<MainLayout />}>
          <Route path="/home" element={<Home />} />
          <Route path="/admin/levels" element={<Admin/>} />

          <Route path="/inventory">
            <Route index element={<Inventory/>} />
            <Route path="status" element={<Inventory/>} />
            <Route path="disposals" element={<InventoryDisposals/>} />
          </Route>
                      
        </Route>
          <Route element={<PrivateRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/home" element={<MainPage />} />
            </Route>
          </Route>

      </Routes>

    
    </>
  )
}

export default App
