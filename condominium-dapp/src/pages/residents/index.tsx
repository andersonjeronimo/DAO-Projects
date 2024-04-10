import React from "react";
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import Footer from "../../components/Footer";
import Alert from "../../components/Alert";
import ResidentRow from "./ResidentRow";
import { getResidents, removeResident, isAddressValid } from "../../services/EthersService";
import { deleteApiResident } from "../../services/APIService";
import { Profile, Resident, StorageKeys } from "../../utils/Utils";
import { ethers } from "ethers";
import Pagination from "../../components/Pagination";

function Residents() {    

    const index = Number(localStorage.getItem(StorageKeys.PROFILE));
    console.log(`Profile--> ${Profile[index]}`);

    const [message, setMessage] = useState<string>("");
    const [error, setError] = useState<string>("");
    const [residents, setResidents] = useState<Resident[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [count, setCount] = useState<ethers.BigNumberish>(0);

    const navigate = useNavigate();

    function useQuery() {
        return new URLSearchParams(useLocation().search);
    }

    const query = useQuery();

    useEffect(() => {
        setIsLoading(true);
        getResidents(parseInt(query.get("page") || "1"))
            .then(result => {
                setResidents(result.residents);
                setCount(result.total);
                setIsLoading(false);
            })
            .catch(err => {
                setIsLoading(false);
                setError(err.message);
            });
        const tx = query.get("tx");
        if (tx) {
            setMessage("Your transaction is being processed. It may take some minutes to have effect.")
        }
    }, []);

    function onDeleteResident(wallet: string) {
        if (isAddressValid(wallet)) {
            setIsLoading(true);
            setMessage("");
            setError("");
            setMessage("Removing resident...wait...");
            const promiseBlockchain = removeResident(wallet);
            const promiseBackend = deleteApiResident(wallet);
            Promise.all([promiseBlockchain, promiseBackend])
                .then(tx => navigate("/residents?tx=" + tx[0].hash))
                .catch(err => {
                    setIsLoading(false);
                    setMessage(err.message);
                })
        } else {
            setMessage("Invalid wallet address");
        }
    }    

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
                                            <i className="material-icons opacity-10 me-2">group</i>
                                            Residents table
                                        </h6>
                                    </div>
                                </div>
                                <div className="card-body px-0 pb-2">
                                    {
                                        message ? (
                                            <Alert type="success" text={`Success! ${message}`} icon="thumb_up"></Alert>
                                        ) : (
                                            <></>
                                        )
                                    }
                                    {
                                        error ? (
                                            <Alert type="danger" text={`Error: ${error}`} icon="error"></Alert>
                                        ) : (
                                            <></>
                                        )
                                    }
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
                                    <div className="table-responsive p-0">
                                        <table className="table align-items-center mb-0">
                                            <thead>
                                                <tr>
                                                    <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Wallet</th>
                                                    <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Residence</th>
                                                    <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Is Counselor?</th>
                                                    <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Next Payment</th>
                                                    <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {residents && residents.length ? (
                                                    residents.map((resident) => <ResidentRow data={resident} key={resident.wallet} onDelete={() => onDeleteResident(resident.wallet)} />)
                                                ) : (
                                                    <></>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                    <Pagination count={count} pageSize={10}></Pagination>
                                    <div className="row ms-2">
                                        <div className="col-md-12 mb-3">
                                            <a className="btn bg-gradient-dark me-2" href="/residents/add">
                                                <i className="material-icons opacity-10 me-2">add</i>
                                                Add New Resident
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <Footer></Footer>
            </main>
        </>
    );
}

export default Residents;