import React from "react";

import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import Footer from "../../components/Footer";
import Alert from "../../components/Alert";
import Pagination from "../../components/Pagination";
import { ethers } from "ethers";

import { Topic } from "../../utils/Lib";
import { getTopics, removeTopic } from "../../services/EthersService";
import TopicRow from "./TopicRow";

function Topics() {
    const [message, setMessage] = useState<string>("");
    const [error, setError] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [count, setCount] = useState<ethers.BigNumberish>(0);
    
    const [topics, setTopics] = useState<Topic[]>([]);
    
    const navigate = useNavigate();

    function useQuery() {
        return new URLSearchParams(useLocation().search);
    }

    const query = useQuery();

    useEffect(() => {
        setIsLoading(true);
        getTopics(parseInt(query.get("page") || "1"))
            .then(result => {
                setTopics(result.topics);
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

    function onDeleteTopic(title: string) {
        if (title !== "") {
            setIsLoading(true);
            setMessage("");
            setError("");
            setMessage("Removing topic...wait...");
            const promiseBlockchain = removeTopic(title);
            Promise.all([promiseBlockchain])
                .then(tx => navigate("/topics?tx=" + tx[0].hash))
                .catch(err => {
                    setIsLoading(false);
                    setMessage(err.message);
                })
        } else {
            setMessage("Empty topic title...");
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
                                            <i className="material-icons opacity-10 me-2">checklist_rtl</i>
                                            Topics
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
                                                    <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Title</th>
                                                    <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Category</th>
                                                    <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Status</th>
                                                    <th className="text-uppercase text-secondary text-xxs font-weight-bolder opacity-7">Date</th>                                                    
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {topics && topics.length ? (
                                                    topics.map((topic) => <TopicRow data={topic} key={topic.title} onDelete={() => onDeleteTopic(topic.title)} />)
                                                ) : (
                                                    <></>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                    <Pagination count={count} pageSize={10}></Pagination>
                                    <div className="row ms-2">
                                        <div className="col-md-12 mb-3">
                                            <a className="btn bg-gradient-dark me-2" href="/topics/add">
                                                <i className="material-icons opacity-10 me-2">add</i>
                                                Add New Topic
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

export default Topics;