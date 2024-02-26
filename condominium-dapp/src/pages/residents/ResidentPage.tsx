import React from "react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../../components/Footer";
import Sidebar from "../../components/Sidebar";
import SwitchInput from "../../components/SwitchInput";
import Alert from "../../components/Alert";
import { Resident, addResident, isManagerOrCounselor, isAddressValid } from "../../services/EthersService";

function ResidentPage() {

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [message, setMessage] = useState<string>("");
    const [resident, setResident] = useState<Resident>({} as Resident);
    const [isManager, setIsManager] = useState<boolean>(false);

    const navigate = useNavigate();

    useEffect(() => {
        setIsManager(isManagerOrCounselor());
    }, []);

    function onResidentChange(event: React.ChangeEvent<HTMLInputElement>) {
        setResident(prevState => ({ ...prevState, [event.target.id]: event.target.value }));
    }

    function btnSaveClick() {        
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
                                                        <input type="text" className="form-control" id="wallet" value={resident.wallet || ""} placeholder="0x00..." onChange={onResidentChange} />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="row ms-3">
                                            <div className="col-md-6 mb-3">
                                                <div className="form-group">
                                                    <label htmlFor="residence">Residence ID:</label>
                                                    <div className="input-group input-group-outline">
                                                        <input type="number" className="form-control" id="residence" value={resident.residence || 1101} placeholder="ex.: 1101" onChange={onResidentChange} />
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
                                                        <Alert text="Only a MANAGER or a COUNSELOR can add residents." type="danger" icon="warning"></Alert>
                                                    </div>
                                                )
                                            }

                                        </div>
                                        <div className="row ms-3">
                                            <div className="col-md-12 mb-3">
                                                <SwitchInput id="isCounselor" isChecked={resident.isCounselor} onChange={onResidentChange} text="Is Counselor?"></SwitchInput>
                                            </div>
                                        </div>
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