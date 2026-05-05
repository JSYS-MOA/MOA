import {Route, Routes} from "react-router-dom";
import MyInfo from "../pages/mypage/MyInfo.tsx";
import MyCalendar from "../pages/mypage/MyCalendar.tsx";
import MyApproval from "../pages/mypage/MyApproval.tsx";

const MyRoutes = () => {
  return(
      <Routes>
          <Route path="profile" element={<MyInfo />} />
          <Route path="calendars" element={<MyCalendar />} />
          <Route path="approvals" element={<MyApproval/>}/>
      </Routes>
  )
}
export default MyRoutes;