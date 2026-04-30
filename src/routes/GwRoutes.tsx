import { Routes, Route } from 'react-router-dom';
import Approvals from '../pages/approvals/Approvals';
import TeamMembers from '../pages/approvals/TeamMembers';
import ApprovalsWait from '../pages/approvals/ApprovalsWait';

 const GwRouter = () => {
  return (
    <Routes>
      <Route index element={<Approvals/>} />
      <Route path="approvals" element={<Approvals/>} />
      <Route path='teamMembers' element={<TeamMembers/>} />
      <Route path='approvalWait' element={<ApprovalsWait/>}/>
    </Routes>
  );
}
export default GwRouter;