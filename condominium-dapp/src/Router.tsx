import { Route, BrowserRouter, Routes, Outlet, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Home from "./pages/Home";
import Transfer from "./pages/Transfer";
import Settings from "./pages/Settings";
import Quota from "./pages/Quota";
import Topics from "./pages/topics";
import TopicPage from "./pages/topics/TopicPage";
import Residents from "./pages/residents";
import ResidentPage from "./pages/residents/ResidentPage";

import { doLogout } from "./services/EthersService";
import { Profile as ProfileEnum } from "./utils/Utils"
import { StorageKeys } from "./utils/Utils";

function Router() {

    const PrivateRoutes = () => {
        let isAuth = localStorage.getItem(StorageKeys.ACCOUNT) !== null;
        return (
            isAuth ? <Outlet /> : <Navigate to="/" />
        )
    }

    const ManagerRoutes = () => {
        let isAuth = localStorage.getItem(StorageKeys.ACCOUNT) !== null;
        let isManager = parseInt(localStorage.getItem(StorageKeys.PROFILE) || "0") === ProfileEnum.MANAGER;
        if (isAuth && isManager) {
            return (<Outlet />)
        } else {
            doLogout();
            return (<Navigate to="/" />)
        }
    }

    const CounselorRoutes = () => {
        let isAuth = localStorage.getItem(StorageKeys.ACCOUNT) !== null;
        let isCouselor = parseInt(localStorage.getItem(StorageKeys.PROFILE) || "0") === ProfileEnum.COUNSELOR;
        if (isAuth && isCouselor) {
            return (<Outlet />)
        } else {
            doLogout();
            return (<Navigate to="/" />)
        }
    }

    const ResidentRoutes = () => {
        let isAuth = localStorage.getItem(StorageKeys.ACCOUNT) !== null;
        let isResident = parseInt(localStorage.getItem(StorageKeys.PROFILE) || "0") === ProfileEnum.RESIDENT;
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
                    <Route path="/residents" element={<Residents />} />
                    <Route path="/residents/edit/:wallet" element={<ResidentPage />} />
                    <Route path="/residents/add" element={<ResidentPage />} />
                    
                    <Route path="/topics" element={<Topics />} />
                    <Route path="/topics/edit/:title" element={<TopicPage />} />
                    <Route path="/topics/add" element={<TopicPage />} />
                    
                    <Route path="/transfer" element={<Transfer />} />
                    <Route path="/quota" element={<Quota />} />
                    <Route path="/settings" element={<Settings />} />
                </Route>

                <Route element={<CounselorRoutes />}>
                </Route>

                <Route element={<ResidentRoutes />}>
                </Route>

            </Routes>
        </BrowserRouter>
    );
}

export default Router;