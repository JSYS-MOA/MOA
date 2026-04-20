import Calender from "../components/Calender";
import Table from "../components/Table";
import { useAuthStore } from "../stores/useAuthStore";

const Home = () => {
    const { user } = useAuthStore();

    const sampleRows = [
        { employeeId: 1, userName: "a" },
        { employeeId: 2, userName: "b" },
    ];

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

            <Table items={sampleRows} />
        </div>
    );
};

export default Home;
