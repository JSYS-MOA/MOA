import {Route, Routes} from 'react-router'
import MainLayout from './components/layout/MainLayout'
import Login from './pages/Login'
import Home from './pages/Home'
import Admin from './pages/Admin'
import Inventory from './pages/inventory/Inventory'
import {useAuthStore} from "./stores/useAuthStore.tsx";
import {useEffect, useState} from "react";
import {authCheck} from "./apis/LoginService.tsx";
import PrivateRoute from "./components/PrivateRoute.tsx";


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

        <Route element={<MainLayout />}>
          <Route path="/home" element={<Home />} />
          <Route path="/admin/levels" element={<Admin/>} />

          <Route path="/inventory">
            <Route index element={<Inventory/>} />
            <Route path="status" element={<Inventory/>} />
          </Route>
                      
        </Route>
          <Route element={<PrivateRoute />}>
            <Route element={<MainLayout />}>
              <Route path="/home" element={<Home />} />
            </Route>
          </Route>

      </Routes>

    
    </>
  )
}

export default App
