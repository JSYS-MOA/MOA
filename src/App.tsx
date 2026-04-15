import { Route, Routes } from 'react-router'
import MainLayout from './components/layout/MainLayout'
import Login from './pages/Login'
import Home from './pages/Home'
import Admin from './pages/Admin'
import Inventory from './pages/inventory/Inventory'

const App = () => {
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

      </Routes>

    
    </>
  )
}

export default App
