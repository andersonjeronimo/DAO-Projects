// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

// Uncomment this line to use console.log
// import "hardhat/console.sol";
import {CondominiumLib as Lib} from "./CondominiumLib.sol";

interface ICondominium {
    function addResident(address resident, uint16 residenceId) external;

    function removeResident(address resident) external;

    function setCouncelor(address resident, bool isEntering) external;

    //TODO: edit -> must be voted
    function setManager(address newManager) external;

    //TODO: edit -> must be voted (must decide how much to spend)
    function addTopic(string memory title, string memory description) external;

    function removeTopic(string memory title) external;

    function openVoting(string memory title) external;

    function vote(string memory title, Lib.Options option) external;

    function closeVoting(string memory title) external;

    //function numberOfVotes(string memory title) external;

    //TODO: function to set quota
    //TODO: function to pay quota
    //TODO: function to transfer
}
