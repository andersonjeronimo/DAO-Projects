// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

// Uncomment this line to use console.log
// import "hardhat/console.sol";
import {CondominiumLib as Lib} from "./CondominiumLib.sol";
import "./ICondominium.sol";

contract Condominium is ICondominium {
    //address payable public owner;
    address public manager;
    mapping(address => bool) public counselors; //wallet -> isCounselor "
    mapping(address => uint16) public residents; //wallet -> ex.:"1101"
    mapping(uint16 => bool) public residences; //cadastro de todas as unidades

    mapping(bytes32 => Lib.Topic) public topics;
    mapping(bytes32 => Lib.Vote[]) public votings;

    constructor() {
        //owner = payable(msg.sender);
        manager = msg.sender;
        for (uint8 i = 1; i <= 2; i++) {
            //blocos
            for (uint8 j = 1; j <= 5; j++) {
                //andares
                for (uint8 k = 1; k <= 4; k++) {
                    //unidades
                    unchecked {
                        residences[(i * 1000) + (j * 100) + k] = true;
                    }
                }
            }
        }
    }

    modifier onlyManager() {
        require(msg.sender == manager, "Only manager is authorized");
        _;
    }

    modifier onlyCouncil() {
        require(
            msg.sender == manager || counselors[msg.sender],
            "Only manager or council is authorized"
        );
        _;
    }

    modifier onlyResidents() {
        require(
            msg.sender == manager || isResident(msg.sender),
            "Only manager or resident is authorized"
        );
        _;
    }

    function isResident(address resident) public view returns (bool) {
        return residents[resident] > 0;
    }

    function residenceExists(uint16 residenceId) public view returns (bool) {
        return residences[residenceId];
    }

    function addResident(
        address resident,
        uint16 residenceId
    ) external onlyCouncil {
        require(residenceExists(residenceId), "This residence does not exists");
        residents[resident] = residenceId;
    }

    function removeResident(address resident) external onlyManager {
        require(!counselors[resident], "A councelor cannot be removed");
        delete residents[resident];
        if (counselors[resident]) {
            delete counselors[resident];
        }
    }

    function setCouncelor(
        address resident,
        bool isEntering
    ) external onlyManager {
        if (isEntering) {
            require(isResident(resident), "The councelor must be a resident");
            counselors[resident] = true;
        } else {
            delete counselors[resident];
        }
    }

    function setManager(address newManager) external onlyManager {
        require(newManager != address(0), "The address must be valid");
        manager = newManager;
    }

    function getTopic(
        string memory title
    ) public view returns (Lib.Topic memory) {
        bytes32 topicId = keccak256(bytes(title));
        return topics[topicId];
    }

    function topicExists(string memory title) public view returns (bool) {
        return getTopic(title).createdDate > 0;
    }

    function addTopic(
        string memory title,
        string memory description
    ) external onlyResidents {
        require(!topicExists(title), "Lib.Topic already exists");
        Lib.Topic memory newTopic = Lib.Topic({
            title: title,
            description: description,
            createdDate: block.timestamp,
            startDate: 0,
            endDate: 0,
            status: Lib.Status.IDLE
        });
        topics[keccak256(bytes(title))] = newTopic;
    }

    function removeTopic(string memory title) external onlyManager {
        bytes32 topicId = keccak256(bytes(title));
        require(topics[topicId].createdDate > 0, "Lib.Topic does not exists");
        require(
            topics[topicId].status == Lib.Status.IDLE,
            "Only IDLE topics can be removed"
        );
        delete topics[topicId];
    }

    function openVoting(string memory title) external onlyManager {
        bytes32 topicId = keccak256(bytes(title));
        require(topics[topicId].createdDate > 0, "The topic does not exists");
        require(
            topics[topicId].status == Lib.Status.IDLE,
            "Only IDLE topics can be opened for voting"
        );

        topics[topicId].status = Lib.Status.VOTING;
        topics[topicId].startDate = block.timestamp;
    }

    function alreadyVoted(
        uint16 residence,
        Lib.Vote[] memory votes
    ) internal pure returns (bool) {
        for (uint8 i = 0; i < votes.length; i++) {
            if (votes[i].residence == residence) {
                return true;
            }
        }
        return false;
    }

    function vote(
        string memory title,
        Lib.Options option
    ) external onlyResidents {
        require(option != Lib.Options.EMPTY, "The option can not be EMPTY");
        bytes32 topicId = keccak256(bytes(title));
        require(topics[topicId].createdDate > 0, "The topic does not exists");
        require(
            topics[topicId].status == Lib.Status.VOTING,
            "Only VOTING topics can be voted"
        );

        uint16 residence = residents[msg.sender];
        Lib.Vote[] memory votes = votings[topicId];
        require(
            !alreadyVoted(residence, votes),
            "A residence should vote only once"
        );

        Lib.Vote memory newVote = Lib.Vote({
            residence: residence,
            resident: msg.sender,
            option: option,
            timestamp: block.timestamp
        });

        votings[topicId].push(newVote);
    }

    function closeVoting(string memory title) external onlyManager {
        bytes32 topicId = keccak256(bytes(title));
        require(topics[topicId].createdDate > 0, "The topic does not exists");
        require(
            topics[topicId].status == Lib.Status.VOTING,
            "Only VOTING topics can be closed"
        );

        uint8 approved = 0;
        uint8 denied = 0;
        uint8 abstentions = 0;
        Lib.Vote[] memory votes = votings[topicId];

        for (uint8 i = 0; i < votes.length; i++) {
            if (votes[i].option == Lib.Options.YES) {
                approved++;
            } else if (votes[i].option == Lib.Options.NO) {
                denied++;
            } else {
                abstentions++;
            }
        }

        if (approved > denied) {
            topics[topicId].status = Lib.Status.APPROVED;
        } else {
            topics[topicId].status = Lib.Status.DENIED;
        }

        topics[topicId].endDate = block.timestamp;
    }

    function numberOfVotes(
        string memory title
    ) external view returns (uint256) {
        bytes32 topicId = keccak256(bytes(title));
        return votings[topicId].length;
    }
}
