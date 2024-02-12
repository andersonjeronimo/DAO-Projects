import { Route, BrowserRouter, Routes, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Topics from "./pages/Topics";

function Router() {

    type Props = { children: JSX.Element }
    function PrivateRoute({ children }: Props) {
        const isAuth = localStorage.getItem("metamaskAccount") !== null;
        return isAuth ? children : <Navigate to="/" />;
    }

    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Login></Login>}>
                </Route>
                <Route path="/topics" element={
                    <PrivateRoute>
                        <Topics></Topics>
                    </PrivateRoute>
                }>
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default Router;