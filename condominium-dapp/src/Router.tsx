import { Route, BrowserRouter, Routes, Outlet, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Transfer from "./pages/Transfer";
import Settings from "./pages/Settings";
import Quota from "./pages/Quota";
import Topics from "./pages/topics";
import Residents from "./pages/residents";
import ResidentPage from "./pages/residents/ResidentPage";

import { Profile as ProfileEnum, doLogout } from "./services/EthersService";

function Router() {

    const PrivateRoutes = () => {
        let isAuth = localStorage.getItem("metamask_account") !== null;
        return (
            isAuth ? <Outlet /> : <Navigate to="/" />
        )
    }

    const ManagerRoutes = () => {
        let isAuth = localStorage.getItem("metamask_account") !== null;
        let isManager = parseInt(localStorage.getItem("dao_profile") || "0") === ProfileEnum.MANAGER;
        if (isAuth && isManager) {
            return (<Outlet />)
        } else {
            doLogout();
            return (<Navigate to="/" />)
        }
    }

    const CounselorRoutes = () => {
        let isAuth = localStorage.getItem("metamask_account") !== null;
        let isCouselor = parseInt(localStorage.getItem("dao_profile") || "0") === ProfileEnum.COUNSELOR;
        if (isAuth && isCouselor) {
            return (<Outlet />)
        } else {
            doLogout();
            return (<Navigate to="/" />)
        }
    }

    const ResidentRoutes = () => {
        let isAuth = localStorage.getItem("metamask_account") !== null;
        let isResident = parseInt(localStorage.getItem("dao_profile") || "0") === ProfileEnum.RESIDENT;
        if (isAuth && isResident) {
            return (<Outlet />)
        } else {
            doLogout();
            return (<Navigate to="/" />)
        }
    }

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route element={<PrivateRoutes />}>
                    <Route path="/home" element={<Home />} />
                </Route>
                <Route element={<ManagerRoutes />}>
                    <Route path="/topics" element={<Topics />} />
                    <Route path="/transfer" element={<Transfer />} />                    
                    <Route path="/quota" element={<Quota />} />
                    <Route path="/residents" element={<Residents />} />
                    <Route path="/residents/new" element={<ResidentPage />} />
                    <Route path="/settings" element={<Settings />} />
                </Route>
                <Route element={<CounselorRoutes />}>
                    <Route path="/topics" element={<Topics />} />
                </Route>
                <Route element={<ResidentRoutes />}>
                    <Route path="/topics" element={<Topics />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default Router;