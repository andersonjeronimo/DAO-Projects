import React from "react";
import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { getAddress, upgrade } from "../services/EthersService";
import Footer from "../components/Footer";

function Settings() {
    const [contrat, setContract] = useState<string>("");
    const [message, setMessage] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);

    function btnSaveClick() {
        //setIsLoading(true);
        setMessage("Saving data...wait...");
        upgrade(contrat)
            .then(tx => setMessage("Settings saved. It may take some minutes to have effect"))
            .catch(err => setMessage(err.message))
        setIsLoading(false);
    }

    useEffect(() => {
        setIsLoading(true);
        getAddress()
            .then(address => {
                setContract(address);
                setIsLoading(false);
            })
            .catch(err => setMessage(err.message));
    }, []);

    return (
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
                                            <i className="material-icons opacity-10 me-2">settings</i>
                                            Settings
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
                                                <label htmlFor="adapter">Adapter Address:</label>
                                                <input type="text" className="form-control" id="adapter" value={process.env.REACT_APP_ADAPTER_ADDRESS} disabled={true} />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row ms-3">
                                        <div className="col-md-6 mb-3">
                                            <div className="form-group">
                                                <label htmlFor="contract">Contract Address:</label>
                                                <div className="input-group input-group-outline">
                                                    <input type="text" className="form-control" id="contract" value={contrat} disabled={true} onChange={evt => setContract(evt.target.value)} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row ms-3">
                                        <div className="col-md-12 mb-3">
                                            <button className="btn bg-gradient-dark me-2" onClick={btnSaveClick} disabled={true}>
                                                <i className="material-icons opacity-10 me-2">save</i>
                                                Save Settings
                                            </button>
                                            <span className="text-danger">{message}</span>
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
    );
}

export default Settings;