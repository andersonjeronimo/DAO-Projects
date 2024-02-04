// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

// Uncomment this line to use console.log
// import "hardhat/console.sol";
//import {CondominiumLib as Lib} from "./CondominiumLib.sol";
import "./ICondominium.sol";

contract CondominiumAdapter {
    ICondominium private implementation;
    address public immutable owner;

    //EVENTS
    event QuotaChanged(uint amount);
    event ManagerChanged(address manager);
    event TopicChanged(
        bytes32 indexed topicId,
        string title,
        Lib.Status indexed status
    );
    event TransferEvent(address to, uint indexed amount, string topic);

    constructor() {
        owner = msg.sender;
    }

    modifier upgraded() {
        require(address(implementation) != address(0), "Must upgrade first");
        _;
    }

    //TODO: transferir saldo da implementação anterior para a nova
    function upgrade(address newImpl) external {
        require(msg.sender == owner, "You do not have permission");
        implementation = ICondominium(newImpl);
    }

    function getImplementationAddress() public view returns (address) {
        return address(implementation);
    }

    function addResident(
        address resident,
        uint16 residenceId
    ) external upgraded {
        return implementation.addResident(resident, residenceId);
    }

    function removeResident(address resident) external upgraded {
        return implementation.removeResident(resident);
    }

    function setCouncelor(address resident, bool isEntering) external upgraded {
        return implementation.setCouncelor(resident, isEntering);
    }

    function addTopic(
        string memory title,
        string memory description,
        Lib.Category category,
        uint amount,
        address accountable
    ) external upgraded {
        return
            implementation.addTopic(
                title,
                description,
                category,
                amount,
                accountable
            );
    }

    function editTopic(
        string memory topicToEdit,
        string memory description,
        uint amount,
        address accountable
    ) external upgraded {
        Lib.TopicUpdate memory topic = implementation.editTopic(
            topicToEdit,
            description,
            amount,
            accountable
        );
        emit TopicChanged(topic.id, topic.title, topic.status);
    }

    function removeTopic(string memory title) external upgraded {
        Lib.TopicUpdate memory topic = implementation.removeTopic(title);
        emit TopicChanged(topic.id, topic.title, topic.status);
    }

    function openVoting(string memory title) external upgraded {
        Lib.TopicUpdate memory topic = implementation.openVoting(title);
        emit TopicChanged(topic.id, topic.title, topic.status);
    }

    function vote(string memory title, Lib.Options option) external upgraded {
        return implementation.vote(title, option);
    }

    function closeVoting(string memory title) external upgraded {
        Lib.TopicUpdate memory topic = implementation.closeVoting(title);
        emit TopicChanged(topic.id, topic.title, topic.status);

        if (topic.status == Lib.Status.APPROVED) {
            if (topic.category == Lib.Category.CHANGE_MANAGER) {
                emit ManagerChanged(implementation.getManager());
            } else if (topic.category == Lib.Category.CHANGE_QUOTA) {
                emit QuotaChanged(implementation.getQuota());
            }
        }
    }

    function payQuota(uint16 residenceId) external payable upgraded {
        return implementation.payQuota{value: msg.value}(residenceId);
    }

    function transfer(string memory topicTitle, uint amount) external upgraded {
        Lib.TransferReceipt memory receipt = implementation.transfer(topicTitle, amount);
        emit TransferEvent(receipt.to, receipt.amount, receipt.topic);
    }
}
