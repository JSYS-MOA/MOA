import {Route, Routes} from "react-router-dom";
import SalesJournals from "../pages/sales/SalesJournals.tsx";
import TaxInvoicePage from "../pages/sales/TaxInvoicePage.tsx";
import MonthlyExpensePage from "../pages/sales/MonthlyExpensePage.tsx";
import MonthlyRevenuePage from "../pages/sales/MonthlyRevenuePage.tsx";

const SalesRoutes = () => {
  return(
      <Routes>
          <Route path="journals" element={<SalesJournals/>} />
          <Route path="taxInv" element={<TaxInvoicePage/>} />
          <Route path="expense" element={<MonthlyExpensePage/>} />
          <Route path="revenue" element={<MonthlyRevenuePage/>} />
      </Routes>
  )
}
export default SalesRoutes;