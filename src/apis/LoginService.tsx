import axios from "axios";

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

export async function authCheck(){
    const { data } = await axios.get(
        `${ API }/auth/check`,
        { withCredentials:true }
    );
    return data;
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
