import { Routes, Route } from 'react-router-dom';
import Inventory from '../pages/inventory/Inventory';
import InventoryDisposals from '../pages/inventory/InventoryDisposals';
import InventoryOrder from '../pages/inventory/InventoryOrder';
import InventoryInbounds from '../pages/inventory/InventoryInbounds';
import InventoryOutbound from '../pages/inventory/InventoryOutbound';

 const InventoryRouter = () => {
  return (
    <Routes>
      <Route index element={<Inventory />} />
      <Route path="status" element={<Inventory />} />
      <Route path="disposals" element={<InventoryDisposals />} />
      <Route path="orders" element={<InventoryOrder />} />
      <Route path="inbounds" element={<InventoryInbounds />} />
      <Route path="outbounds" element={<InventoryOutbound />} />
    </Routes>
  );
}
export default InventoryRouter;