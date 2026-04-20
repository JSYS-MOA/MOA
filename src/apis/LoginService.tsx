import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";

const Api_BASE = "http://localhost/api/";

export function useislogin() {
    const { data, isLoading, isError } = useQuery({
        queryKey: ["login"],
        queryFn: () =>
            axios
                .post(Api_BASE + "login", {
                    employeeId: "20200001",
                    password: "1234",
                })
                .then((response) => response.data),
    });

    return { data, isLoading, isError };
}

export function useloginInfo() {
    return useMutation({
        mutationFn: async ({ id }: { id: string }) => {
            const response = await axios.post(
                Api_BASE + `user/${id}`,
                { employeeId: parseInt(id, 10) },
                { withCredentials: true }
            );

            return response.data;
        },
        onSuccess: (data) => {
            window.localStorage.setItem("user", JSON.stringify(data));
        },
        onError: (error: any) => {
            console.error("Login failed:", error.response?.data || error.message);
        },
    });
}

export async function islogin(id: string, password: string) {
    try {
        const response = await fetch(Api_BASE + "login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ employeeId: id, password }),
        });

        let data;

        if (!response.ok) {
            data = JSON.stringify(await response.json());
            window.localStorage.setItem("user", data);
        } else {
            data = await response.text();
        }

        return data;
    } catch (error) {
        console.log("Network error:", error);
    }
}

export async function loginInfo(id: string) {
    try {
        const response = await fetch(Api_BASE + `user/${id}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ employeeId: id }),
        });

        let data;

        if (!response.ok) {
            data = JSON.stringify(await response.json());
            window.localStorage.setItem("user", data);
        } else {
            data = await response.text();
        }

        return data;
    } catch (error) {
        console.log("Network error:", error);
    }
}

export async function logoutApi() {
    const response = await axios.post(
        `${Api_BASE}logout`,
        {},
        { withCredentials: true }
    );

    window.localStorage.removeItem("user");
    return response.data;
}
