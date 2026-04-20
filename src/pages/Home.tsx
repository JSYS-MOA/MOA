import Calender from "../components/Calender";
import { useAuthStore } from "../stores/useAuthStore";

const Home = () => {
    const { user } = useAuthStore();

    return (
        <div>
            Home
            {user != null ? (
                <>
                    <br /> {user.userName ?? "-"}
                    <br /> {user.employeeId}
                </>
            ) : (
                <>
                    <br /> No logged-in user
                </>
            )}
            <Calender />
        </div>
    );
};

export default Home;
