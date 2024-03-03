import React from "react";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Footer from "../../components/Footer";
import Sidebar from "../../components/Sidebar";
import SwitchInput from "../../components/SwitchInput";
import Alert from "../../components/Alert";
import { addResident, isManagerOrCounselor, isAddressValid, doLogout, getResident, setCouselor } from "../../services/EthersService";

function ResidentPage() {

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [message, setMessage] = useState<string>("");    
    const [wallet_state, setWallet] = useState<string>("");
    const [residence_state, setResidence] = useState<number>(1000);
    const [counselor_state, setCounselor] = useState<boolean>(false);
    const [isManager, setIsManager] = useState<boolean>(false);

    const navigate = useNavigate();
    let { wallet } = useParams();

    useEffect(() => {
        if (!isManagerOrCounselor()) {
            doLogout();
            navigate("/");
        } else {
            setIsManager(true);
            if (wallet) {
                if (!isAddressValid(wallet)) {
                    setMessage("Invalid Wallet Address.")
                } else {                    
                    setIsLoading(true);                    
                    getResident(wallet)
                        .then(resident => {
                            setIsLoading(false);                            
                            setWallet(resident.wallet);
                            setResidence(resident.residence);
                            setCounselor(resident.isCounselor);
                        })
                        .catch(err => {
                            setIsLoading(false);
                            setMessage(err.message);
                        })
                }
            }
        }
    }, [wallet]);

    function handleWalletChange(e: React.ChangeEvent<HTMLInputElement>) {        
        setWallet(e.target.value);
    }

    function handleResidenceChange(e: React.ChangeEvent<HTMLInputElement>) {        
        setResidence(Number(e.target.value));
    }

    function handleIsCounselorChange(e: React.ChangeEvent<HTMLInputElement>) {        
        setCounselor(e.target.value === "true");
    }

    function btnSaveClick(): void {
        if (!wallet) {
            if (wallet_state !== "" && residence_state > 0) {
                if (isAddressValid(wallet_state)) {
                    setIsLoading(true);
                    setMessage("Saving resident...wait...");
                    addResident(wallet_state, residence_state)
                        .then(tx => navigate("/residents?tx=" + tx.hash))
                        .catch(err => {
                            setMessage(err.message);
                            setIsLoading(false);
                        })
                } else {
                    setMessage("Invalid wallet address");
                }
            } else {
                setMessage("Must fill wallet address and residence number");
            }
        } else {
            if (isAddressValid(wallet_state)) {
                setCouselor(wallet_state, counselor_state)
                    .then(tx => navigate("/residents?tx=" + tx.hash))
                    .catch(err => {
                        setMessage(err.message);
                        setIsLoading(false);
                    })
            } else {
                setMessage("Invalid Wallet Address");
            }
        }
    }

    return (
        <>
            <>
                <Sidebar></Sidebar>
                <main className="main-content position-relative max-height-vh-100 h-100 border-radius-lg ">
                    <div className="container-fluid py-4">
                        <div className="row">
                            <div className="col-12">
                                <div className="card my-4">
                                    <div className="card-header p-0 position-relative mt-n4 mx-3 z-index-2">
                                        <div className="bg-gradient-primary shadow-primary border-radius-lg pt-4 pb-3">
                                            <h6 className="text-white text-capitalize ps-3">
                                                <i className="material-icons opacity-10 me-2">person_add</i>
                                                New Resident
                                            </h6>
                                        </div>
                                    </div>
                                    <div className="card-body px-0 pb-2">
                                        {
                                            isLoading ? (
                                                <div className="row ms-3">
                                                    <div className="col-md-6 mb-3">
                                                        <p>
                                                            <i className="material-icons opacity-10 me-2">hourglass_empty</i>
                                                            Loading...
                                                        </p>
                                                    </div>
                                                </div>
                                            ) : <div></div>
                                        }
                                        <div className="row ms-3">
                                            <div className="col-md-6 mb-3">
                                                <div className="form-group">
                                                    <label htmlFor="wallet">Wallet Address:</label>
                                                    <div className="input-group input-group-outline">
                                                        <input type="text" className="form-control" id="wallet" value={wallet_state || ""} placeholder="0x00..."
                                                            onChange={handleWalletChange} disabled={!!wallet} />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="row ms-3">
                                            <div className="col-md-6 mb-3">
                                                <div className="form-group">
                                                    <label htmlFor="residence">Residence ID:</label>
                                                    <div className="input-group input-group-outline">
                                                        <input type="number" className="form-control" id="residence" value={Number(residence_state) || 1000} placeholder="ex.: 1101"
                                                            onChange={handleResidenceChange} disabled={!!wallet} />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="row ms-3">
                                            {
                                                isManager ? (
                                                    <div className="col-md-12 mb-3">
                                                        <button className="btn bg-gradient-dark me-2" onClick={btnSaveClick}>
                                                            <i className="material-icons opacity-10 me-2">save</i>
                                                            Save New Resident
                                                        </button>
                                                        <span className="text-danger">{message}</span>
                                                    </div>
                                                ) : (
                                                    <div className="col-md-6 mb-3">
                                                        <Alert text="Only a MANAGER or a COUNSELOR can ADD or EDIT residents." type="danger" icon="warning"></Alert>
                                                    </div>
                                                )
                                            }

                                        </div>
                                        {
                                            isManager && wallet ? (
                                                <div className="row ms-3">
                                                    <div className="col-md-12 mb-3">
                                                        <SwitchInput id="isCounselor" isChecked={counselor_state} onChange={handleIsCounselorChange} text="Is Counselor?"></SwitchInput>
                                                    </div>
                                                </div>
                                            ) : (
                                                <></>
                                            )
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <Footer></Footer>
                </main >
            </>

        </>
    );
}

export default ResidentPage;