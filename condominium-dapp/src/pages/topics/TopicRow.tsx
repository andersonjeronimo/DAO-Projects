import React from "react";
import { useEffect, useState } from "react";
import { StorageKeys, Profile, Topic, Category, Status } from "../../utils/Lib";
import { ethers } from "ethers";

type Props = {
    data: Topic;
    onDelete: Function;
}

/**
 * 
 * @param props : data(type Topic), onDelete(Function)
 * @returns void
 */
function TopicRow(props: Props) {
    const [isManager, setIsManager] = useState<boolean>(false);
    const profile = parseInt(localStorage.getItem(StorageKeys.PROFILE) || "0");
    useEffect(() => {        
        setIsManager(profile === Profile.MANAGER);
    }, []);

    function getDate(): string {
        const dateMs = ethers.toNumber(ethers.toBigInt(props.data.createdDate)) * 1000;
        //const text = !dateMs ? "Null" : new Date(dateMs).toDateString();
        const text = new Date(dateMs).toDateString();
        return text;
    }

    function getCategory(): string {
        return Category[props.data.category];
    }

    function btnDeleteClick() {
        if (window.confirm("Are you sure to delete this topic?")) {
            props.onDelete(props.data.title);
        }
    }

    return (
        <tr>
            <td className="align-middle text-center">
                <div className="d-flex px-2 py-1">
                    <div className="d-flex flex-column justify-content-center">
                        <h6 className="mb-0 text-sm">{props.data.title}</h6>
                    </div>
                </div>
            </td>
            <td className="align-middle text-center">                
                <p className="text-xs font-weight-bold mb-0 px-3">{Category[props.data.category]}</p>
            </td>
            <td className="align-middle text-center">
                <p className="text-xs font-weight-bold badge bg-success mb-0 px-3">{Status[props.data.status || 0]}</p>
            </td>
            <td className="align-middle text-center">
                <p className="text-xs font-weight-bold mb-0 px-3">{getDate()}</p>
            </td>
            <td className="align-middle text-center">
                {
                    isManager ? (
                        <><a href={`/topics/edit/${props.data.title}`} className="btn btn-info btn-sm me-1">
                            <i className="material-icons text-sm">visibility</i>
                        </a>
                            <a href="#" className="btn btn-danger btn-sm me-1" onClick={btnDeleteClick}>
                                <i className="material-icons text-sm">delete</i>
                            </a></>
                    ) : (
                        <></>
                    )}
            </td>

        </tr>
    );
}

export default TopicRow;