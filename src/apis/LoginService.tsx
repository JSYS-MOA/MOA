import { useQuery , useMutation } from "@tanstack/react-query";
import axios from "axios";

const Api_BASE = "http://localhost/api/";

// 겟 예시
// export function useGetUsers(searchParam: string) {
//   return useQuery({
//     // 1. queryKey에 검색어를 넣어야 검색어가 바뀔 때마다 다시 실행됩니다.
//     queryKey: ["users", searchParam],
//     queryFn: async () => {
//       // 2. API 호출 시 쿼리 스트링으로 검색어 전달
//       const { data } = await axios.get(`${Api_BASE}users`, {
//         params: { search: seaarchParam }
//       });
//       return data;
//     },



export function useislogin() {

    const { data , isLoading , isError} = useQuery({
        queryKey: ['login'],
        queryFn: () => axios.post(Api_BASE+"login" ,
            { employeeId: '20200001',
                password: '1234' }).then(r => r.data)

    });
    return { data, isLoading, isError };

}


// post
export function useloginInfo () {

    return useMutation({
        mutationFn: async ({ id  }: { id: string}) => {
            const response = await axios.post(
                Api_BASE + `user/${id}`,
                { employeeId: parseInt(id) },
                { withCredentials: true } // credentials: 'include'와 동일한 설정
            );
            return response.data;
        },
        onSuccess: (data) => {
            window.localStorage.setItem("user", JSON.stringify(data));
            console.log("로그인 성공!");
        },
        onError: (error: any) => {

            console.error("로그인 실패:", error.response?.data || error.message);
        }
    });

}



export async function islogin ( id : string , password : string) {

    try {
        const res = await fetch(Api_BASE+"login", {
            method: "POST",
            headers:{ 'Content-Type': 'application/json' },
            credentials: 'include',
            // 섹션, 쿠기에 저장된 거 보내주기
            body: JSON.stringify({ employeeId: id  , password: password }),
        })

        let deta;

        if (!res.ok) {
            deta = JSON.stringify(await res.json());
            //로컬섹션에 저장한다
            window.localStorage.setItem("user", deta);

        } else{
            deta = await res.text();
        }
        return deta

    } catch (error) {
        console.log( "네트워크오류 : " + error);
    }

}

export async function loginInfo ( id : string ) {

    try {
        const res = await fetch(Api_BASE + `user/${id}`, {
            method: "POST",
            headers:{ 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ employeeId: id }),
        })

        let deta;

        if (!res.ok) {
            deta = JSON.stringify(await res.json());
            //로컬섹션에 저장한다
            window.localStorage.setItem("user", deta);

        } else{
            deta = await res.text();
        }

        return deta

    } catch (error) {
        console.log( "네트워크오류 : " + error);
    }

}
