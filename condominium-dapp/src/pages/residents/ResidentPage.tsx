import React from "react";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Footer from "../../components/Footer";
import Sidebar from "../../components/Sidebar";
import SwitchInput from "../../components/SwitchInput";
import Alert from "../../components/Alert";
import { addResident, isManagerOrCounselor, isAddressValid, doLogout, getResident, setCouselor } from "../../services/EthersService";
import { getApiResident, addApiResident, updateApiResident } from "../../services/APIService";

import { Resident, ApiResident, Profile } from "../../utils/Utils";

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

    const [isLoading, setIsLoading] = useState<number>(0);
    const [message, setMessage] = useState<string>("");
    const [isManager, setIsManager] = useState<boolean>(false);
    const [resident, setResident] = useState<Resident>({} as Resident);
    const [apiResident, setApiResident] = useState<ApiResident>({} as ApiResident);

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
                    setIsLoading(1);
                    getResident(wallet)
                        .then(resident => {
                            setResident(resident);
                            setIsLoading(0);
                        })
                        .catch(err => {
                            setMessage(err.message);
                            setIsLoading(0);
                        })

                    getApiResident(wallet)
                        .then(apiResident => {
                            setApiResident(apiResident);
                            setIsLoading(1);
                        })
                        .catch(err => {
                            setMessage(err.message);
                            setIsLoading(0);
                        })
                }
            }
        }
    }, [wallet]);

    function handleResidentChange(evt: React.ChangeEvent<HTMLInputElement>) {
        setResident(prevState => ({ ...prevState, [evt.target.id]: evt.target.value }));
    }

    function handleApiResidentChange(evt: React.ChangeEvent<HTMLInputElement>) {
        setApiResident(prevState => ({ ...prevState, [evt.target.id]: evt.target.value }));
    }

    function btnSaveClick(): void {
        /* console.log(resident);
        console.log(apiResident);
        return; */
        if (!wallet) {
            if (resident.wallet !== "" && resident.residence > 0) {
                //Entra nesse bloco se for adição de moradores
                if (isAddressValid(resident.wallet)) {
                    setIsLoading(1);
                    setMessage("Saving resident...wait...");
                    const promiseBlockchain = addResident(resident.wallet, resident.residence);
                    const promiseBackend = addApiResident({...apiResident, profile:Profile.RESIDENT, wallet:resident.wallet});
                    Promise.all([promiseBlockchain, promiseBackend])
                        .then(results => {
                            navigate("/residents?tx=" + results[0].hash);
                        })
                        .catch(err => {
                            setMessage(err.message);
                            setIsLoading(0);
                        });
                } else {
                    setMessage("Invalid wallet address");
                }
            } else {
                setMessage("Must fill wallet address and residence number");
            }
        } else {
            //Entra nesse bloco se for edição apenas
            if (isAddressValid(resident.wallet)) {
                const profile = resident.isCounselor ? Profile.COUNSELOR : Profile.RESIDENT;
                const promises = [];
                if (apiResident.profile !== profile) {
                    promises.push(setCouselor(resident.wallet, resident.isCounselor));
                }
                promises.push(updateApiResident(wallet, {...apiResident, profile, wallet}));
                Promise.all(promises)
                    .then(results => {                        
                        navigate("/residents?tx=" + wallet)
                    })
                    .catch(err => {
                        setMessage(err.message);
                        setIsLoading(0);
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
                                                {wallet ? "Edit " : "New "} Resident
                                            </h6>
                                        </div>
                                    </div>
                                    <div className="card-body px-0 pb-2">
                                        {
                                            isLoading > 0 ? (
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
                                                        <input type="text" className="form-control" id="wallet" value={resident.wallet || ""} placeholder="0x00..."
                                                            onChange={handleResidentChange} disabled={!!wallet} />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="row ms-3">
                                            <div className="col-md-6 mb-3">
                                                <div className="form-group">
                                                    <label htmlFor="residence">Residence Id:</label>
                                                    <div className="input-group input-group-outline">
                                                        <input type="number" className="form-control" id="residence" value={resident.residence || 1000}
                                                            placeholder="(block + apartment). Ex.: 1101"
                                                            onChange={handleResidentChange} /* disabled={!!wallet} */ />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="row ms-3">
                                            <div className="col-md-6 mb-3">
                                                <div className="form-group">
                                                    <label htmlFor="name">Name:</label>
                                                    <div className="input-group input-group-outline">
                                                        <input type="text" className="form-control" id="name" value={apiResident.name || ""}
                                                            placeholder="Your name..."
                                                            onChange={handleApiResidentChange} />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="row ms-3">
                                            <div className="col-md-6 mb-3">
                                                <div className="form-group">
                                                    <label htmlFor="name">Phone:</label>
                                                    <div className="input-group input-group-outline">
                                                        <input type="tel" className="form-control" id="phone" value={apiResident.phone || ""}
                                                            placeholder="+5551123456789"
                                                            onChange={handleApiResidentChange} />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="row ms-3">
                                            <div className="col-md-6 mb-3">
                                                <div className="form-group">
                                                    <label htmlFor="email">Email:</label>
                                                    <div className="input-group input-group-outline">
                                                        <input type="email" className="form-control" id="email" value={apiResident.email || ""}
                                                            placeholder="name@company.com"
                                                            onChange={handleApiResidentChange} />
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