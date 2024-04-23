import React from "react";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

import Footer from "../../components/Footer";
import Sidebar from "../../components/Sidebar";
import TopicCategory from "../../components/TopicCategory";

import { addTopic, getTopic, editTopic, isManager } from "../../services/EthersService";
import { Category, Status, Topic } from "../../utils/Lib";

function TopicPage() {

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [message, setMessage] = useState<string>("");
    const [manager, setIsManager] = useState<boolean>(false);

    const [_title, setTitle] = useState<string>("");
    const [_description, setDescription] = useState<string>("");
    const [_category, setCategory] = useState<Category>(Category.DECISION);
    const [_amount, setAmount] = useState<number>(0);
    const [_accountable, setAccountable] = useState<string>("");
    const [_status, setStatus] = useState<Status>(Status.IDLE);
    const [_createdDate, setCreatedDate] = useState<number>(0);
    const [_startDate, setStartDate] = useState<number>(0);
    const [_endDate, setEndDate] = useState<number>(0);

    function handleCategoryChange(evt: React.ChangeEvent<HTMLInputElement>) {
        setCategory(Number(evt.target.value));
    }

    function setTopicState(topic: Topic) {
        setTitle(topic.title);
        setDescription(topic.description);
        setCategory(topic.category);
        setAmount(Number(topic.amount));
        setAccountable(topic.accountable);
        setStatus(topic.status);
        setCreatedDate(Number(topic.createdDate));
        setStartDate(Number(topic.startDate || 0));
        setEndDate(Number(topic.endDate || 0));
    }

    const navigate = useNavigate();
    let { title } = useParams();

    useEffect(() => {
        setIsManager(isManager());
        if (title) {
            setIsLoading(true);
            const promiseBlockchain = getTopic(title);
            Promise.all([promiseBlockchain])
                .then(results => {
                    setTopicState(results[0]);
                    setIsLoading(false);
                })
                .catch(err => {
                    setMessage(err.message);
                    setIsLoading(false);
                })
        } else {
            setAccountable(localStorage.getItem("account") || "");
        }
    }, [title]);


    function showAccountable(): boolean {
        const category = Number(_category);
        return [Category.SPENT, Category.CHANGE_MANAGER].includes(category);
    }

    function showAmount(): boolean {
        const category = Number(_category);
        return [Category.SPENT, Category.CHANGE_QUOTA].includes(category);
    }

    function isDisabled(): boolean {
        return !!title && (Number(_status) !== Status.IDLE || !isManager());
    }

    function isClosed(): boolean {
        const status = Number(_status);
        return [Status.APPROVED, Status.DELETED, Status.DENIED, Status.SPENT].includes(status);
    }

    function getCreatedDate(): string {
        const dateMs = Number(_createdDate || 0) * 1000;
        return !dateMs ? "" : new Date(dateMs).toDateString();
    }

    function getStartDate(): string {
        if (_startDate !== 0) {
            const dateMs = _startDate * 1000;
            return new Date(dateMs).toDateString();
        }
        return "Not started yet";
    }

    function getEndDate(): string {
        if (_endDate > 0) {
            const dateMs = _endDate * 1000;
            return new Date(dateMs).toDateString();
        }
        return "Not started yet";
    }

    function btnSaveClick(): void {
        if (!title) {
            setIsLoading(true);
            setMessage("Saving topic...wait...");

            const newTopic = {
                title: _title,
                description: _description,
                category: _category,
                amount: _amount,
                accountable: _accountable
                /* status: _status,
                createdDate: _createdDate,
                startDate: _startDate, 
                endDate: _endDate */
            } as Topic;

            console.log(newTopic);

            const promiseBlockchain = addTopic(newTopic);
            Promise.all([promiseBlockchain])
                .then(results => {
                    navigate("/topics?tx=" + results[0].hash);
                })
                .catch(err => {
                    setMessage(err.message);
                    setIsLoading(false);
                });
        } else {
            const promiseBlockchain = editTopic(title, _description, _amount, _accountable);
            Promise.all([promiseBlockchain])
                .then(results => {
                    navigate("/topics?tx=" + results[0].hash)
                })
                .catch(err => {
                    setMessage(err.message);
                    setIsLoading(false);
                })
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
                                                        <input type="text" className="form-control" id="title" value={_title} 
                                                        onChange={e => setTitle(e.target.value)}
                                                        disabled={!!title} />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="row ms-3">
                                            <div className="col-md-6 mb-3">
                                                <div className="form-group">
                                                    <label htmlFor="description">Description:</label>
                                                    <div className="input-group input-group-outline">
                                                        <input type="text" className="form-control" id="description" value={_description}
                                                            onChange={e => setDescription(e.target.value)} disabled={false} />
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
                                                                <input type="text" className="form-control" id="status" value={Status[Number(_status)]} disabled={true} />
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
                                                        <TopicCategory value={Number(_category)} onChange={handleCategoryChange} disabled={!!title}></TopicCategory>
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
                                                                <input type="text" className="form-control" id="accountable" value={_accountable}
                                                                    onChange={e => setAccountable(e.target.value)} disabled={isDisabled()} />
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
                                                                <input type="text" className="form-control" id="amount" value={(_amount).toString()}
                                                                    onChange={e => setAmount(Number(e.target.value))} disabled={isDisabled()} />
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
                                                                <input type="text" className="form-control" id="createdDate" value={getCreatedDate()} disabled={true} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>) : (<></>)
                                        }

                                        {
                                            isClosed() && Number(_status) === Status.VOTING ? (
                                                <div className="row ms-3">
                                                    <div className="col-md-6 mb-3">
                                                        <div className="form-group">
                                                            <label htmlFor="startDate">Start Date:</label>
                                                            <div className="input-group input-group-outline">
                                                                <input type="text" className="form-control" id="startDate" value={getStartDate()} disabled={true} />
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
                                                                <input type="text" className="form-control" id="endDate" value={getEndDate()} disabled={true} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>) : (<></>)
                                        }

                                        {
                                            title ? (
                                                manager && Number(_status) === Status.IDLE ? (
                                                    <div className="row ms-3">
                                                        <div className="col-md-12 mb-3">
                                                            <button className="btn bg-gradient-dark me-2" onClick={btnSaveClick}>
                                                                <i className="material-icons opacity-10 me-2">save</i>
                                                                Edit Topic
                                                            </button>
                                                            <span className="text-danger">{message}</span>
                                                        </div>
                                                    </div>
                                                ) : (<></>)
                                            ) : (
                                                <div className="row ms-3">
                                                    <div className="col-md-12 mb-3">
                                                        <button className="btn bg-gradient-dark me-2" onClick={btnSaveClick}>
                                                            <i className="material-icons opacity-10 me-2">save</i>
                                                            Add Topic
                                                        </button>
                                                        <span className="text-danger">{message}</span>
                                                    </div>
                                                </div>
                                            )}
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