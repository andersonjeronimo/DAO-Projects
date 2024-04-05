import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { doLogout } from "../services/EthersService";
import { Profile } from "../utils/Utils";

function Sidebar() {

    const navigate = useNavigate();

    const [profile, setProfile] = useState<Profile>(Profile.RESIDENT);

    useEffect(() => {
        const profile = parseInt(localStorage.getItem("dao_profile") || "0");
        setProfile(profile);
    }, [])

    function getActiveClass(item: string): string {
        if (window.location.pathname.indexOf(item) !== -1) {
            return "nav-link text-white active bg-gradient-primary";
        } else {
            return "nav-link text-white";
        }
    }

    function linkLogoutClick() {
        doLogout();
        navigate("/");
    }

    return (
        <aside className="sidenav navbar navbar-vertical navbar-expand-xs border-0 border-radius-xl my-3 fixed-start ms-3   bg-gradient-dark" id="sidenav-main">
            <div className="sidenav-header">
                <p className="navbar-brand m-0">
                    {/* <img src="/dao.webp" width={48} className="navbar-brand-img h-100" alt="main_logo" /> */}
                    <span className="ms-1 font-weight-bold text-white">DAO CONDOMINIUM</span>
                </p>
            </div>
            <hr className="horizontal light mt-0 mb-2"></hr>
            <div className="collapse navbar-collapse  w-auto " id="sidenav-collapse-main">
                <ul className="navbar-nav">
                    <li className="nav-item">
                        <a className={getActiveClass("home")} href="/home">
                            <div className="text-white text-center me-2 d-flex align-items-center justify-content-center">
                                <i className="material-icons md-36 opacity-10">home</i>
                            </div>
                            <span className="nav-link-text ms-1">Home</span>
                        </a>
                    </li>
                    <li className="nav-item">
                        <a className={getActiveClass("topics")} href="/topics">
                            <div className="text-white text-center me-2 d-flex align-items-center justify-content-center">
                                <i className="material-icons md-36 opacity-10">checklist_rtl</i>
                            </div>
                            <span className="nav-link-text ms-1">Topics</span>
                        </a>
                    </li>
                    <li className="nav-item">
                        <a className={getActiveClass("residents")} href="/residents">
                            <div className="text-white text-center me-2 d-flex align-items-center justify-content-center">
                                <i className="material-icons md-36 opacity-10">group</i>
                            </div>
                            <span className="nav-link-text ms-1">Residents</span>
                        </a>
                    </li>
                    <li className="nav-item">
                        <a className={getActiveClass("quota")} href="/quota">
                            <div className="text-white text-center me-2 d-flex align-items-center justify-content-center">
                                <i className="material-icons md-36 opacity-10">currency_bitcoin</i>
                                <i className="material-icons md-36 opacity-10">real_estate_agent</i>
                            </div>
                            <span className="nav-link-text ms-1">Quota</span>
                        </a>
                    </li>
                    {
                        profile === Profile.MANAGER ?
                            (<>
                                <li className="nav-item">
                                    <a className={getActiveClass("transfer")} href="/transfer">
                                        <div className="text-white text-center me-2 d-flex align-items-center justify-content-center">
                                            <i className="material-icons md-36 opacity-10">currency_bitcoin</i>
                                            <i className="material-icons md-36 opacity-10">sync_alt</i>
                                        </div>
                                        <span className="nav-link-text ms-1">Transfer</span>
                                    </a>
                                </li>
                                <li className="nav-item">
                                    <a className={getActiveClass("settings")} href="/settings">
                                        <div className="text-white text-center me-2 d-flex align-items-center justify-content-center">
                                            <i className="material-icons md-36 opacity-10">settings</i>
                                        </div>
                                        <span className="nav-link-text ms-1">Settings</span>
                                    </a>
                                </li>
                            </>)

                            :
                            <></>
                    }


                    <li className="nav-item mt-3">
                        <h6 className="ps-4 ms-2 text-uppercase text-xs text-white font-weight-bolder opacity-8">Account pages</h6>
                    </li>                    
                    <li className="nav-item">
                        <a className={getActiveClass("signout")} href="#" onClick={linkLogoutClick}>
                            <div className="text-white text-center me-2 d-flex align-items-center justify-content-center">
                                <i className="material-icons md-36 opacity-10">logout</i>
                            </div>
                            <span className="nav-link-text ms-1">Sign Out</span>
                        </a>
                    </li>
                </ul>
            </div>
        </aside>
    )
}
export default Sidebar;