import { Route, Routes } from "react-router";
import MainLayout from "./components/layout/MainLayout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import HrCardListPage from "./pages/HR/HrCardListPage.tsx";

const App = () => {
    return (
        <Routes>
            <Route path="/" element={<Login />} />

            <Route element={<MainLayout />}>
                <Route path="/home" element={<Home />} />
                <Route path="/hr/cards" element={<HrCardListPage />} />
            </Route>
        </Routes>
    );
};

export default App;
