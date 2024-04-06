import React from "react";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Footer from "../../components/Footer";
import Sidebar from "../../components/Sidebar";
import SwitchInput from "../../components/SwitchInput";
import Alert from "../../components/Alert";
import { addResident, isManagerOrCounselor, isAddressValid, doLogout, getResident, setCouselor } from "../../services/EthersService";
import { getApiResident } from "../../services/APIService";

import { Resident, ApiResident } from "../../utils/Utils";

/* export type Resident = {
    wallet: string,
    isCounselor: boolean,
    isManager: boolean,
    residence: number,
    nextPayment: number
}

export type ApiResident = {
    wallet: string;
    name: string;
    profile: Profile;
    phone?: string;
    email?: string;
}
 */

function ResidentPage() {

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [message, setMessage] = useState<string>("");
    const [isManager, setIsManager] = useState<boolean>(false);
    const [resident, setResident] = useState<Resident>({} as Resident);

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
                            setResident(resident);
                            setIsLoading(false);                         
                        })
                        .catch(err => {
                            setMessage(err.message);
                            setIsLoading(false);
                        })
                }
            }
        }
    }, [wallet]);

    function handleResidentChange(evt: React.ChangeEvent<HTMLInputElement>) {        
        setResident(prevState => ({ ...prevState, [evt.target.id]: evt.target.value }));
    }

    function btnSaveClick(): void {
        if (!wallet) {
            if (resident.wallet !== "" && resident.residence > 0) {
                if (isAddressValid(resident.wallet)) {
                    setIsLoading(true);
                    setMessage("Saving resident...wait...");
                    addResident(resident.wallet, resident.residence)
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
            if (isAddressValid(resident.wallet)) {
                setCouselor(resident.wallet, resident.isCounselor)
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
                                                        {/* <input type="text" className="form-control" id="wallet" value={wallet_state || ""} placeholder="0x00..."
                                                            onChange={handleWalletChange} disabled={!!wallet} /> */}
                                                        <input type="text" className="form-control" id="wallet" value={resident.wallet} placeholder="0x00..."
                                                            onChange={handleResidentChange} /* disabled={!!wallet} */ />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="row ms-3">
                                            <div className="col-md-6 mb-3">
                                                <div className="form-group">
                                                    <label htmlFor="residence">Residence ID:</label>
                                                    <div className="input-group input-group-outline">
                                                        {/* <input type="number" className="form-control" id="residence" value={Number(residence_state) || 1000} placeholder="ex.: 1101"
                                                            onChange={handleResidenceChange} disabled={!!wallet} /> */}
                                                        <input type="number" className="form-control" id="residence" value={resident.residence} placeholder="ex.: 1101"
                                                            onChange={handleResidentChange} /* disabled={!!wallet} */ />
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
                                                        {/* <SwitchInput id="isCounselor" isChecked={counselor_state} onChange={handleIsCounselorChange} text="Is Counselor?"></SwitchInput> */}
                                                        <SwitchInput id="isCounselor" isChecked={resident.isCounselor} onChange={handleResidentChange} text="Is Counselor?"></SwitchInput>
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