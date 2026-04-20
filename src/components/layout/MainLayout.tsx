import { Outlet } from "react-router"
import Footer from "../Footer"
import Header from "../Header"



const MainLayout = ( ) => {
  return (
    <div className="layout-wrapper">
      <Header />
      
      
      <main>
        <Outlet /> 
      </main>
      
      <Footer />
    </div>
  )
}

export default MainLayout
