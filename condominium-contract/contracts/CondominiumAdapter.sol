// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

// Uncomment this line to use console.log
// import "hardhat/console.sol";
//import {CondominiumLib as Lib} from "./CondominiumLib.sol";
import "./ICondominium.sol";

contract CondominiumAdapter {
    ICondominium private implementation;
    address public immutable owner;

    constructor() {
        owner = msg.sender;
    }

    modifier upgraded() {
        require(address(implementation) != address(0), "Must upgrade first");
        _;
    }

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
        return
            implementation.editTopic(
                topicToEdit,
                description,
                amount,
                accountable
            );
    }

    function removeTopic(string memory title) external upgraded {
        return implementation.removeTopic(title);
    }

    function openVoting(string memory title) external upgraded {
        return implementation.openVoting(title);
    }

    function vote(string memory title, Lib.Options option) external upgraded {
        return implementation.vote(title, option);
    }

    function closeVoting(string memory title) external upgraded {
        return implementation.closeVoting(title);
    }

    //function numberOfVotes(string memory title) external;

    //TODO: function to set quota
    //TODO: function to pay quota
    //TODO: function to transfer
}
