import Layout from "./Layout.jsx";

import Dashboard from "./Dashboard";

import Reports from "./Reports";

import CreateReport from "./CreateReport";

import CreateBER from "./CreateBER";

import ReviewQueue from "./ReviewQueue";

import Students from "./Students";

import Staff from "./Staff";

import Tasks from "./Tasks";

import BerReport from "./BerReport";

import BerDetail from "./BerDetail";

import Sites from "./Sites";

import EditBER from "./EditBER";

import BerPrint from "./BerPrint";

import IncidentDetail from "./IncidentDetail";

import EditIncidentReport from "./EditIncidentReport";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Dashboard: Dashboard,
    
    Reports: Reports,
    
    CreateReport: CreateReport,
    
    CreateBER: CreateBER,
    
    ReviewQueue: ReviewQueue,
    
    Students: Students,
    
    Staff: Staff,
    
    Tasks: Tasks,
    
    BerReport: BerReport,
    
    BerDetail: BerDetail,
    
    Sites: Sites,
    
    EditBER: EditBER,
    
    BerPrint: BerPrint,
    
    IncidentDetail: IncidentDetail,
    
    EditIncidentReport: EditIncidentReport,
    
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
                
                <Route path="/Reports" element={<Reports />} />
                
                <Route path="/CreateReport" element={<CreateReport />} />
                
                <Route path="/CreateBER" element={<CreateBER />} />
                
                <Route path="/ReviewQueue" element={<ReviewQueue />} />
                
                <Route path="/Students" element={<Students />} />
                
                <Route path="/Staff" element={<Staff />} />
                
                <Route path="/Tasks" element={<Tasks />} />
                
                <Route path="/BerReport" element={<BerReport />} />
                
                <Route path="/BerDetail" element={<BerDetail />} />
                
                <Route path="/Sites" element={<Sites />} />
                
                <Route path="/EditBER" element={<EditBER />} />
                
                <Route path="/BerPrint" element={<BerPrint />} />
                
                <Route path="/IncidentDetail" element={<IncidentDetail />} />
                
                <Route path="/EditIncidentReport" element={<EditIncidentReport />} />
                
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