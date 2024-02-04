// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

// Uncomment this line to use console.log
// import "hardhat/console.sol";
import {CondominiumLib as Lib} from "./CondominiumLib.sol";
import "./ICondominium.sol";

contract Condominium is ICondominium {
    //address payable public owner;
    address public manager;
    uint public monthlyQuota = 0.01 ether;

    mapping(address => bool) public counselors; //wallet -> isCounselor "
    mapping(address => uint16) public residents; //wallet -> ex.:"1101"
    mapping(uint16 => bool) public residences; // "1101" -> true: cadastro de todas as unidades

    mapping(uint16 => uint) public payments; // unidade -> último pagamento (timestamp em segundos)

    mapping(bytes32 => Lib.Topic) public topics;
    mapping(bytes32 => Lib.Vote[]) public votings;

    constructor() {
        //owner = payable(msg.sender);
        manager = msg.sender;
        for (uint16 i = 1; i <= 2; i++) {
            //blocos
            for (uint16 j = 1; j <= 5; j++) {
                //andares
                for (uint16 k = 1; k <= 4; k++) {
                    //unidades
                    residences[(i * 1000) + (j * 100) + k] = true;
                }
            }
        }
    }

    modifier onlyManager() {
        require(tx.origin == manager, "Only manager is authorized");
        _;
    }

    modifier onlyCouncil() {
        require(
            tx.origin == manager || counselors[tx.origin],
            "Only manager or council is authorized"
        );
        _;
    }

    modifier onlyResidents() {
        require(
            tx.origin == manager || isResident(tx.origin),
            "Only manager or resident is authorized"
        );
        require(
            tx.origin == manager ||
                block.timestamp <=
                payments[residents[tx.origin]] + (30 * 24 * 60 * 60),
            "The resident must be defaulter"
        );
        _;
    }

    modifier validAddress(address addr) {
        require(addr != address(0), "Invalid address");
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
    ) external onlyCouncil validAddress(resident) {
        require(residenceExists(residenceId), "This residence does not exists");
        residents[resident] = residenceId;
    }

    function removeResident(
        address resident
    ) external onlyManager validAddress(resident) {
        require(!counselors[resident], "A councelor cannot be removed");
        delete residents[resident];
        if (counselors[resident]) {
            delete counselors[resident];
        }
    }

    function setCouncelor(
        address resident,
        bool isEntering
    ) external onlyManager validAddress(resident) {
        if (isEntering) {
            require(isResident(resident), "The councelor must be a resident");
            counselors[resident] = true;
        } else {
            delete counselors[resident];
        }
    }

    /* function setManager(address newManager) external onlyManager {
        require(newManager != address(0), "The address must be valid");
        manager = newManager;
    } */

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
        string memory description,
        Lib.Category category,
        uint amount,
        address accountable
    ) external onlyResidents validAddress(accountable) {
        require(!topicExists(title), "Topic already exists");
        if (amount > 0) {
            require(
                category == Lib.Category.CHANGE_QUOTA ||
                    category == Lib.Category.SPENT,
                "Wrong category"
            );
        }

        Lib.Topic memory newTopic = Lib.Topic({
            title: title,
            description: description,
            createdDate: block.timestamp,
            startDate: 0,
            endDate: 0,
            status: Lib.Status.IDLE,
            category: category,
            amount: amount,
            accountable: accountable != address(0) ? accountable : tx.origin
        });
        topics[keccak256(bytes(title))] = newTopic;
    }

    function editTopic(
        string memory topicToEdit,
        string memory description,
        uint amount,
        address accountable
    ) external onlyManager validAddress(accountable) returns(Lib.TopicUpdate memory) {
        bytes32 topicId = keccak256(bytes(topicToEdit));
        require(topics[topicId].createdDate > 0, "Topic does not exists");
        require(
            topics[topicId].status == Lib.Status.IDLE,
            "Only IDLE topics can be edited"
        );

        if (bytes(description).length > 0) {
            topics[topicId].description = description;
        }
        if (amount >= 0) {
            topics[topicId].amount = amount;
        }
        if (accountable != address(0)) {
            topics[topicId].accountable = accountable;
        }

        return Lib.TopicUpdate({
            id: topicId,
            title: topicToEdit,
            status: topics[topicId].status, 
            category: topics[topicId].category
        });
    }

    function removeTopic(string memory title) external onlyManager returns(Lib.TopicUpdate memory){
        bytes32 topicId = keccak256(bytes(title));
        require(topics[topicId].createdDate > 0, "Topic does not exists");
        require(
            topics[topicId].status == Lib.Status.IDLE,
            "Only IDLE topics can be removed"
        );
        Lib.Category category = topics[topicId].category;
        
        delete topics[topicId];

        return Lib.TopicUpdate({
            id: topicId,
            title: title,
            status: Lib.Status.DELETED,
            category: category
        });

    }

    function openVoting(string memory title) external onlyManager returns(Lib.TopicUpdate memory){
        bytes32 topicId = keccak256(bytes(title));
        require(topics[topicId].createdDate > 0, "The topic does not exists");
        require(
            topics[topicId].status == Lib.Status.IDLE,
            "Only IDLE topics can be opened for voting"
        );

        topics[topicId].status = Lib.Status.VOTING;
        topics[topicId].startDate = block.timestamp;
        
        return Lib.TopicUpdate({
            id: topicId,
            title: title,
            status: topics[topicId].status, 
            category: topics[topicId].category
        });
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

        //uint16 residence = residents[msg.sender];
        uint16 residence = residents[tx.origin];
        Lib.Vote[] memory votes = votings[topicId];
        require(
            !alreadyVoted(residence, votes),
            "A residence should vote only once"
        );

        Lib.Vote memory newVote = Lib.Vote({
            residence: residence,
            //resident: msg.sender,
            resident: tx.origin,
            option: option,
            timestamp: block.timestamp
        });

        votings[topicId].push(newVote);
    }

    function closeVoting(string memory title) external onlyManager returns(Lib.TopicUpdate memory) {
        bytes32 topicId = keccak256(bytes(title));
        require(topics[topicId].createdDate > 0, "The topic does not exists");
        require(
            topics[topicId].status == Lib.Status.VOTING,
            "Only VOTING topics can be closed"
        );

        uint8 approved = 0;
        uint8 denied = 0;
        uint8 abstentions = 0;
        uint8 minimumVotes = 0;

        if (topics[topicId].category == Lib.Category.SPENT) {
            minimumVotes = 10;
        } else if (topics[topicId].category == Lib.Category.CHANGE_MANAGER) {
            minimumVotes = 15;
        } else if (topics[topicId].category == Lib.Category.CHANGE_QUOTA) {
            minimumVotes = 20;
        } else {
            minimumVotes = 5;
        }

        require(
            numberOfVotes(title) >= minimumVotes,
            "You cannot finish a voting without a minimum of votes"
        );

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

        Lib.Status newStatus = approved > denied
            ? Lib.Status.APPROVED
            : Lib.Status.DENIED;

        topics[topicId].status = newStatus;
        topics[topicId].endDate = block.timestamp;

        if (newStatus == Lib.Status.APPROVED) {
            if (topics[topicId].category == Lib.Category.CHANGE_QUOTA) {
                monthlyQuota = topics[topicId].amount;
            } else if (
                topics[topicId].category == Lib.Category.CHANGE_MANAGER
            ) {
                manager = topics[topicId].accountable;
            }
        }

        return Lib.TopicUpdate({
            id: topicId,
            title: title,
            status: topics[topicId].status, 
            category: topics[topicId].category
        });
    }

    function numberOfVotes(string memory title) public view returns (uint256) {
        bytes32 topicId = keccak256(bytes(title));
        return votings[topicId].length;
    }

    function payQuota(uint16 residenceId) external payable {
        require(residenceExists(residenceId), "The residence does not exists");
        require(msg.value >= monthlyQuota, "Wrong value");
        require(
            block.timestamp >
                payments[residents[tx.origin]] + 30 * 24 * 60 * 60,
            "Cannot pay twice in a month"
        );
        payments[residenceId] = block.timestamp;
    }

    function transfer(
        string memory topicTitle,
        uint amount
    ) external onlyManager returns(Lib.TransferReceipt memory) {
        require(address(this).balance >= amount, "Insufficient funds");
        bytes32 topicId = keccak256(bytes(topicTitle));
        require(topics[topicId].createdDate > 0, "The topic does not exists");
        require(
            topics[topicId].status == Lib.Status.APPROVED &&
                topics[topicId].category == Lib.Category.SPENT,
            "Transfers only for APPROVED and SPENT topics"
        );
        require(topics[topicId].amount >= amount, "The amount must be less or equal the APPROVED");
        payable(topics[topicId].accountable).transfer(amount);
        topics[topicId].status = Lib.Status.SPENT;
        return Lib.TransferReceipt({
            to: topics[topicId].accountable,
            amount: amount,
            topic: topicTitle
        });
    }

    function getManager() external view returns(address){
        return manager;
    }

    function getQuota() external view returns(uint){
        return monthlyQuota;
    }
}
