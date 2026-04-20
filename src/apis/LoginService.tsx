import axios from "axios";

<<<<<<< HEAD
=======
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
>>>>>>> 84ab0b4866bb8d7849e4546a2836915527d6941b
const API = "http://localhost/api";

export async function loginApi(employeeId: string, password: string){
    const { data } = await axios.post(
        `${ API }/auth/login`,
        { employeeId,password },
        { withCredentials: true } //서버와 주소가 달라서 브라우저가 JSESSIONID 쿠키를 같이 보내야 유저 인식(필수)
    );
    return data;
}

export async function logoutApi(){
    const { data } = await axios.post(
        `${ API }/auth/logout`,
        {},
        { withCredentials:true }
    );
    return data;
}

<<<<<<< HEAD
export async function authCheck(){
    const { data } = await axios.get(
        `${ API }/auth/check`,
        { withCredentials:true }
    );
    return data;
}
=======


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
export async function logoutApi(){
    const { data } = await axios.post(
        '${ API }/auth/logout',
        {},
        { withCredentials:true }
    );
    return data;
}

export async function authCheck(){
    const { data } = await axios.get(
        '${ API }/auth/check',
        { withCredentials:true }
    );
    return data;
}
>>>>>>> 84ab0b4866bb8d7849e4546a2836915527d6941b
