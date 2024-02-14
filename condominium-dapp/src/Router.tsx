import { Route, BrowserRouter, Routes, Outlet, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Topics from "./pages/Topics";
import Transfer from "./pages/Transfer";
import { Profile, doLogout } from "./services/EthersService";

function Router() {

    const PrivateRoutes = () => {
        let isAuth = localStorage.getItem("metamask_account") !== null;
        return (
            isAuth ? <Outlet /> : <Navigate to="/" />
        )
    }

    const ManagerRoutes = () => {
        let isAuth = localStorage.getItem("metamask_account") !== null;
        let isManager = parseInt(localStorage.getItem("dao_profile") || "0") === Profile.MANAGER;
        if (isAuth && isManager) {
            return <Outlet />
        } else {
            doLogout();
            return <Navigate to="/" />
        }
    }

    /* 
    type Props = { children: JSX.Element }
    function PrivateRoute({ children }: Props) {
        const isAuth = localStorage.getItem("metamaskAccount") !== null;
        return isAuth ? children : <Navigate to="/" />;
    } */

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route element={<PrivateRoutes />}>
                    <Route path="/topics" element={<Topics />} />
                </Route>
                <Route element={<ManagerRoutes />}>
                    <Route path="/transfer" element={<Transfer />} />
                </Route>

                {/* <Route path="/topics" element={
                    <PrivateRoute>
                        <Topics></Topics>
                    </PrivateRoute>
                }>
                </Route>
                <Route path="/transfer" element={
                    <PrivateRoute>
                        <Transfer></Transfer>
                    </PrivateRoute>
                }>
                </Route> */}
            </Routes>
        </BrowserRouter>
    );
}

export default Router;