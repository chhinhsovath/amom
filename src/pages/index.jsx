import Layout from "./Layout.jsx";

import Dashboard from "./Dashboard";

import Invoices from "./Invoices";

import Contacts from "./Contacts";

import Reports from "./Reports";

import Banking from "./Banking";

import Accounts from "./Accounts";

import Bills from "./Bills";

import Quotes from "./Quotes";

import Inventory from "./Inventory";

import Expenses from "./Expenses";

import Payroll from "./Payroll";

import Settings from "./Settings";

import PurchaseOrders from "./PurchaseOrders";

import OnlinePayments from "./OnlinePayments";

import Cheques from "./Cheques";

import Projects from "./Projects";

import RepeatingInvoices from "./RepeatingInvoices";

import CreditNotes from "./CreditNotes";

import TaxReports from "./TaxReports";

import FixedAssets from "./FixedAssets";

import Budgets from "./Budgets";

import JournalEntries from "./JournalEntries";

import AuditTrail from "./AuditTrail";

import Profile from "./Profile";

import Billing from "./Billing";

import UserManagement from "./UserManagement";

import AccountTransactions from "./AccountTransactions";

import InvoiceSettings from "./InvoiceSettings";

import TaxRates from "./TaxRates";

import FontTest from "../components/FontTest";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Dashboard: Dashboard,
    
    Invoices: Invoices,
    
    Contacts: Contacts,
    
    Reports: Reports,
    
    Banking: Banking,
    
    Accounts: Accounts,
    
    Bills: Bills,
    
    Quotes: Quotes,
    
    Inventory: Inventory,
    
    Expenses: Expenses,
    
    Payroll: Payroll,
    
    Settings: Settings,
    
    PurchaseOrders: PurchaseOrders,
    
    OnlinePayments: OnlinePayments,
    
    Cheques: Cheques,
    
    Projects: Projects,
    
    RepeatingInvoices: RepeatingInvoices,
    
    CreditNotes: CreditNotes,
    
    TaxReports: TaxReports,
    
    FixedAssets: FixedAssets,
    
    Budgets: Budgets,
    
    JournalEntries: JournalEntries,
    
    AuditTrail: AuditTrail,
    
    Profile: Profile,
    
    Billing: Billing,
    
    UserManagement: UserManagement,
    
    AccountTransactions: AccountTransactions,
    
    InvoiceSettings: InvoiceSettings,
    
    TaxRates: TaxRates,
    
    FontTest: FontTest,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<Dashboard />} />
                
                
                <Route path="/Dashboard" element={<Dashboard />} />
                
                <Route path="/Invoices" element={<Invoices />} />
                
                <Route path="/Contacts" element={<Contacts />} />
                
                <Route path="/Reports" element={<Reports />} />
                
                <Route path="/Banking" element={<Banking />} />
                
                <Route path="/Accounts" element={<Accounts />} />
                
                <Route path="/Bills" element={<Bills />} />
                
                <Route path="/Quotes" element={<Quotes />} />
                
                <Route path="/Inventory" element={<Inventory />} />
                
                <Route path="/Expenses" element={<Expenses />} />
                
                <Route path="/Payroll" element={<Payroll />} />
                
                <Route path="/Settings" element={<Settings />} />
                
                <Route path="/PurchaseOrders" element={<PurchaseOrders />} />
                
                <Route path="/OnlinePayments" element={<OnlinePayments />} />
                
                <Route path="/Cheques" element={<Cheques />} />
                
                <Route path="/Projects" element={<Projects />} />
                
                <Route path="/RepeatingInvoices" element={<RepeatingInvoices />} />
                
                <Route path="/CreditNotes" element={<CreditNotes />} />
                
                <Route path="/TaxReports" element={<TaxReports />} />
                
                <Route path="/FixedAssets" element={<FixedAssets />} />
                
                <Route path="/Budgets" element={<Budgets />} />
                
                <Route path="/JournalEntries" element={<JournalEntries />} />
                
                <Route path="/AuditTrail" element={<AuditTrail />} />
                
                <Route path="/Profile" element={<Profile />} />
                
                <Route path="/Billing" element={<Billing />} />
                
                <Route path="/UserManagement" element={<UserManagement />} />
                
                <Route path="/AccountTransactions" element={<AccountTransactions />} />
                
                <Route path="/InvoiceSettings" element={<InvoiceSettings />} />
                
                <Route path="/TaxRates" element={<TaxRates />} />
                
                <Route path="/FontTest" element={<FontTest />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}