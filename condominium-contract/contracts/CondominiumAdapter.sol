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

    function upgrade(address newImpl) external {
        require(msg.sender == owner, "You do not have permission");
        implementation = ICondominium(newImpl);
    }

    function getImplementationAddress() public view returns (address) {
        return address(implementation);
    }

    function addResident(address resident, uint16 residenceId) external {
        return implementation.addResident(resident, residenceId);
    }

    function removeResident(address resident) external {
        return implementation.removeResident(resident);
    }

    function setCouncelor(address resident, bool isEntering) external {
        return implementation.setCouncelor(resident, isEntering);
    }

    //TODO: edit -> must be voted
    function setManager(address newManager) external {
        return implementation.setManager(newManager);
    }

    //TODO: edit -> must be voted (must decide how much to spend)
    function addTopic(string memory title, string memory description) external {
        return implementation.addTopic(title, description);
    }

    function removeTopic(string memory title) external {
        return implementation.removeTopic(title);
    }

    function openVoting(string memory title) external {
        return implementation.openVoting(title);
    }

    function vote(string memory title, Lib.Options option) external {
        return implementation.vote(title, option);
    }

    function closeVoting(string memory title) external {
        return implementation.closeVoting(title);
    }

    //function numberOfVotes(string memory title) external;

    //TODO: function to set quota
    //TODO: function to pay quota
    //TODO: function to transfer


}