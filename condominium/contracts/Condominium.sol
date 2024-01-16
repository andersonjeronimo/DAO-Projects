// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

contract Condominium {
    //address payable public owner;
    address public manager;
    mapping(address => bool) public counselors; //wallet -> isCounselor "
    mapping(address => uint16) public residents; //wallet -> ex.:"1101"
    mapping(uint16 => bool) public residences; //cadastro de todas as unidades

    enum Status {
        IDLE,
        VOTING,
        APPROVED,
        DENIED
    }

    struct Topic {
        string title;
        string description;
        Status status;
        uint256 createdDate;
        uint256 startDate;
        uint256 endDate;
    }

    mapping(bytes32 => Topic) public topics;

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

    function getTopic(string memory title) public view returns (Topic memory) {
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
        require(!topicExists(title), "Topic already exists");
        Topic memory newTopic = Topic({
            title: title,
            description: description,
            createdDate: block.timestamp,
            startDate: 0,
            endDate: 0,
            status: Status.IDLE
        });
        topics[keccak256(bytes(title))] = newTopic;
    }

    function removeTopic(string memory title) external onlyManager {
        Topic memory topic = getTopic(title);
        require(topic.createdDate > 0, "Topic does not exists");
        require(topic.status == Status.IDLE, "Only IDLE topics can be removed");
        delete topics[keccak256(bytes(title))];
    }


}
