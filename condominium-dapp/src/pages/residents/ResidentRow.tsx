import React from "react";
import { useEffect, useState } from "react";
import { isManagerOrCounselor } from "../../services/EthersService";
import { Resident } from "../../utils/Utils";
import { ethers } from "ethers";

type Props = {
    data: Resident;
    onDelete: Function;
}

/**
 * 
 * @param props : data(type Resident), onDelete(Function)
 * @returns void
 */
function ResidentRow(props: Props) {
    const [isManager, setIsManager] = useState<boolean>(false);
    useEffect(() => {
        setIsManager(isManagerOrCounselor());
    }, []);

    function getNextPayment(): string {
        const dateMs = ethers.toNumber(ethers.toBigInt(props.data.nextPayment)) * 1000;
        const text = !dateMs ? "Never Payed" : new Date(dateMs).toDateString();
        return text;
    }

    function btnDeleteClick() {
        if (window.confirm("Are you sure to delete this resident?")) {
            props.onDelete(props.data.wallet);
        }
    }

    return (
        <tr>
            <td className="align-middle text-center">
                <div className="d-flex px-2 py-1">
                    <div className="d-flex flex-column justify-content-center">
                        <h6 className="mb-0 text-sm">{props.data.wallet}</h6>
                    </div>
                </div>
            </td>
            <td className="align-middle text-center">
                {/* <p className="text-xs font-weight-bold mb-0 px-3">{ethers.toNumber(ethers.toBigInt(props.data.residence))}</p> */}
                <p className="text-xs font-weight-bold mb-0 px-3">{Number(props.data.residence)}</p>
            </td>
            <td className="align-middle text-center">
                <p className="text-xs font-weight-bold mb-0 px-3">{JSON.stringify(props.data.isCounselor)}</p>
            </td>
            <td className="align-middle text-center">
                <p className="text-xs font-weight-bold mb-0 px-3">{getNextPayment()}</p>
            </td>
            <td className="align-middle text-center">
                {
                    isManager ? (
                        <><a href={`/residents/edit/${props.data.wallet}`} className="btn btn-info btn-sm me-1">
                            <i className="material-icons text-sm">edit</i>
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

export default ResidentRow;