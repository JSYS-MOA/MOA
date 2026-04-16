import {useAuthStore} from "../stores/useAuthStore.tsx";
import {Navigate, Outlet} from "react-router";

const PrivateRoute = () => {
    const { user } = useAuthStore();
    return user ? <Outlet /> : <Navigate to="/" replace/>
}
export default PrivateRoute;