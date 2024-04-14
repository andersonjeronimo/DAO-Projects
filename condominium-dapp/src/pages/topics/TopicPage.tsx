import React from "react";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Footer from "../../components/Footer";
import Sidebar from "../../components/Sidebar";
import Alert from "../../components/Alert";
import { ethers } from "ethers";
import TopicCategory from "../../components/TopicCategory";

import { addTopic, getTopic, doLogout } from "../../services/EthersService";

import { Category, Status, Topic } from "../../utils/Utils";

function TopicPage() {

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [message, setMessage] = useState<string>("");
    const [topic, setTopic] = useState<Topic>({} as Topic);

    const navigate = useNavigate();
    let { title } = useParams();

    useEffect(() => {
        if (title) {
            setIsLoading(true);
            const promiseBlockchain = getTopic(title);
            Promise.all([promiseBlockchain])
                .then(results => {
                    setTopic(results[0]);
                    setIsLoading(false);
                })
                .catch(err => {
                    setMessage(err.message);
                    setIsLoading(false);
                })
        }
    }, [title]);

    function handleTopicChange(event: React.ChangeEvent<HTMLInputElement>) {
        setTopic(prevState => ({ ...prevState, [event.target.id]: event.target.value }));
    }

    function showAccountable(): boolean {
        return [Category.SPENT, Category.CHANGE_MANAGER].includes(topic.category);
    }

    function showAmount(): boolean {
        return [Category.SPENT, Category.CHANGE_QUOTA].includes(topic.category);
    }

    function isClosed(): boolean {
        return [Status.APPROVED, Status.DELETED, Status.DENIED, Status.SPENT].includes(topic.status || 0);
    }

    function getDate(dateBN: ethers.BigNumberish): string {
        const dateMs = ethers.toNumber(ethers.toBigInt(dateBN)) * 1000;
        return !dateMs ? "" : new Date(dateMs).toDateString();
    }

    function parseAmount(amount: ethers.BigNumberish): number {
        return ethers.toNumber(ethers.toBigInt(amount));
    }

    function btnSaveClick(): void {
        if (topic) {
            if (!title) {
                setIsLoading(true);
                setMessage("Saving topic...wait...");
                const promiseBlockchain = addTopic();
                Promise.all([promiseBlockchain])
                    .then(results => {
                        navigate("/topics?tx=" + results[0].hash);
                    })
                    .catch(err => {
                        setMessage(err.message);
                        setIsLoading(false);
                    });
            } else {
                if (topic.title !== "") {

                    /* const promiseBlockchain = editTopic(topic);

                    Promise.all([promiseBlockchain])
                        .then(results => {
                            navigate("/topics?tx=" + results[0].hash)
                        })
                        .catch(err => {
                            setMessage(err.message);
                            setIsLoading(false);
                        }) */
                }
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
                                                <i className="material-icons opacity-10 me-2">checklist_rtl</i>
                                                {title ? "Edit " : "New "} Topic
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
                                                    <label htmlFor="title">Title:</label>
                                                    <div className="input-group input-group-outline">
                                                        <input type="text" className="form-control" id="title" value={topic.title || ""} placeholder="The topic title..."
                                                            onChange={handleTopicChange} disabled={!!title} />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="row ms-3">
                                            <div className="col-md-6 mb-3">
                                                <div className="form-group">
                                                    <label htmlFor="description">Description:</label>
                                                    <div className="input-group input-group-outline">
                                                        <input type="text" className="form-control" id="description" value={topic.description || ""}
                                                            placeholder="Description..."
                                                            onChange={handleTopicChange} disabled={!!title && topic.status !== Status.IDLE} />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        {
                                            title ? (
                                                <div className="row ms-3">
                                                    <div className="col-md-6 mb-3">
                                                        <div className="form-group">
                                                            <label htmlFor="status">Status:</label>
                                                            <div className="input-group input-group-outline">
                                                                <input type="text" className="form-control" id="status" value={Status[topic.status || 0]} disabled={true} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>) : (<></>)
                                        }
                                        <div className="row ms-3">
                                            <div className="col-md-6 mb-3">
                                                <div className="form-group">
                                                    <label htmlFor="category">Category:</label>
                                                    <div className="input-group input-group-outline">
                                                        <TopicCategory value={topic.category} onChange={handleTopicChange} disabled={!!title}></TopicCategory>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        {
                                            showAccountable() ? (
                                                <div className="row ms-3">
                                                    <div className="col-md-6 mb-3">
                                                        <div className="form-group">
                                                            <label htmlFor="accountable">Accountable:</label>
                                                            <div className="input-group input-group-outline">
                                                                <input type="text" className="form-control" id="accountable" value={topic.accountable}
                                                                    placeholder="Accountable" onChange={handleTopicChange} disabled={!!title && topic.status !== Status.IDLE} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>) : (<></>)
                                        }

                                        {
                                            showAmount() ? (
                                                <div className="row ms-3">
                                                    <div className="col-md-6 mb-3">
                                                        <div className="form-group">
                                                            <label htmlFor="amount">Amount (Wei):</label>
                                                            <div className="input-group input-group-outline">
                                                                {/* <input type="number" className="form-control" id="amount" value={parseAmount(topic.amount)}
                                                                    placeholder="Accountable" onChange={handleTopicChange} disabled={!!title && topic.status !== Status.IDLE} /> */}
                                                                <input type="text" className="form-control" id="amount" value={(topic.amount).toString()}
                                                                    placeholder="Accountable" onChange={handleTopicChange} disabled={!!title && topic.status !== Status.IDLE} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>) : (<></>)
                                        }

                                        {
                                            title ? (
                                                <div className="row ms-3">
                                                    <div className="col-md-6 mb-3">
                                                        <div className="form-group">
                                                            <label htmlFor="createdDate">Created Date:</label>
                                                            <div className="input-group input-group-outline">
                                                                <input type="text" className="form-control" id="createdDate" value={getDate(topic.createdDate)} disabled={true} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>) : (<></>)
                                        }

                                        {
                                            isClosed() && topic.status === Status.VOTING ? (
                                                <div className="row ms-3">
                                                    <div className="col-md-6 mb-3">
                                                        <div className="form-group">
                                                            <label htmlFor="startDate">Start Date:</label>
                                                            <div className="input-group input-group-outline">
                                                                <input type="text" className="form-control" id="startDate" value={getDate(topic.startDate || 0)} disabled={true} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>) : (<></>)
                                        }

                                        {
                                            isClosed() ? (
                                                <div className="row ms-3">
                                                    <div className="col-md-6 mb-3">
                                                        <div className="form-group">
                                                            <label htmlFor="endDate">End Date:</label>
                                                            <div className="input-group input-group-outline">
                                                                <input type="text" className="form-control" id="endDate" value={getDate(topic.endDate || 0)} disabled={true} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>) : (<></>)
                                        }

                                        <div className="row ms-3">
                                            <div className="col-md-12 mb-3">
                                                <button className="btn bg-gradient-dark me-2" onClick={btnSaveClick}>
                                                    <i className="material-icons opacity-10 me-2">save</i>
                                                    {title ? "Edit " : "Add "} Topic
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
        </>
    );
}

export default TopicPage;