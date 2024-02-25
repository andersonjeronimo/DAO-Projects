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
    uint private constant _oneMonth = 30 * 24 * 60 * 60;

    /// @notice (uint16 para unidades do condomínio, ex.: 1101)
    mapping(uint16 => bool) public residences;

    Lib.Resident[] public residents;

    /// @dev waller address -> array index
    mapping(address => uint) private _residentIndex;

    address[] public counselors;

    /// @notice unidade do condomínio -> timestamp do próximo pagamento
    mapping(uint16 => uint) private _nextPayment;

    Lib.Topic[] public topics;

    /// @dev bytes32 topic hash (keccak256(bytes(title))) -> array index
    mapping(bytes32 => uint) private _topicIndex;

    /// @notice bytes32 topic hash (keccak256(bytes(title))) -> Votes array
    mapping(bytes32 => Lib.Vote[]) private _votings;

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
            tx.origin == manager || _isCounselor(tx.origin),
            "Only manager or council is authorized"
        );
        _;
    }

    function _isCounselor(address resident) private view returns (bool) {
        for (uint i = 0; i < counselors.length; i++) {
            if (counselors[i] == resident) {
                return true;
            }
        }
        return false;
    }

    modifier onlyResidents() {
        require(
            tx.origin == manager || isResident(tx.origin),
            "Only manager or resident is authorized"
        );
        Lib.Resident memory resident = _getResident(tx.origin);
        require(
            tx.origin == manager ||
                block.timestamp <= resident.nextPayment,//_nextPayment[resident.residence],
            "The resident must be defaulter"
        );
        _;
    }

    modifier validAddress(address addr) {
        require(addr != address(0), "Invalid address");
        _;
    }

    function isResident(address resident) public view returns (bool) {
        return _getResident(resident).residence > 0;
    }

    function residenceExists(uint16 residenceId) public view returns (bool) {
        return residences[residenceId];
    }

    function addResident(
        address resident,
        uint16 residenceId
    ) external onlyCouncil validAddress(resident) {
        require(residenceExists(residenceId), "This residence does not exists");
        residents.push(
            Lib.Resident({
                wallet: resident,
                residence: residenceId,
                isCounselor: false,
                isManager: resident == manager,
                nextPayment: 0
            })
        );
        _residentIndex[resident] = residents.length - 1;
    }

    function removeResident(
        address resident
    ) external onlyManager validAddress(resident) {
        require(!_isCounselor(resident), "A councelor cannot be removed");
        uint index = _residentIndex[resident];
        uint lastIndex = residents.length - 1;
        if (index != lastIndex) {
            Lib.Resident memory lastResident = residents[lastIndex];
            residents[index] = lastResident;
            _residentIndex[lastResident.wallet] = index;
        }
        residents.pop();
        delete _residentIndex[resident];
    }

    function _getResident(
        address resident
    ) private view returns (Lib.Resident memory) {
        uint index = _residentIndex[resident];
        if (index < residents.length) {
            Lib.Resident memory result = residents[index];
            if (result.wallet == resident) {
                result.nextPayment = _nextPayment[result.residence];
                return result;
            }
        }
        return
            Lib.Resident({
                wallet: address(0),
                residence: 0,
                isCounselor: false,
                isManager: false,
                nextPayment: 0
            });
    }

    function getResident(
        address resident
    ) external view returns (Lib.Resident memory) {
        return _getResident(resident);
    }

    function getResidents(
        uint page,
        uint pageSize
    ) external view returns (Lib.ResidentPage memory) {
        Lib.Resident[] memory result = new Lib.Resident[](pageSize);
        uint skip = ((page - 1) * pageSize);
        uint index = 0;
        for (
            uint i = skip;
            i < (skip + pageSize) && i < residents.length;
            i++
        ) {
            //result[index++] = residents[i];
            result[index++] = _getResident(residents[i].wallet);
        }
        return Lib.ResidentPage({residents: result, total: residents.length});
    }

    function _addCounselor(
        address resident
    ) private onlyManager validAddress(resident) {
        require(isResident(resident), "The counselor must be a resident");
        counselors.push(resident);
        uint index = _residentIndex[resident];
        residents[index].isCounselor = true;
    }

    function _removeCounselor(
        address resident
    ) private onlyManager validAddress(resident) {
        bool found = false;
        uint counselorIndex = 0;
        for (uint i = 0; i < counselors.length; i++) {
            if (counselors[i] == resident) {
                found = true;
                counselorIndex = i;
                break;
            }
        }
        require(found, "Counselor not found");
        uint last = counselors.length - 1;
        if (counselorIndex != last) {
            address lastAddress = counselors[last];
            counselors[counselorIndex] = lastAddress;
        }
        uint index = _residentIndex[resident];
        residents[index].isCounselor = false;
        counselors.pop();
    }

    /// @param resident no array 'residents' a propriedade 'isCounselor' deve ser alterada
    /// @param isEntering nomeação(true) ou revogação(false)
    function setCounselor(
        address resident,
        bool isEntering
    ) external onlyManager validAddress(resident) {
        if (isEntering) {
            _addCounselor(resident);
        } else {
            _removeCounselor(resident);
        }
    }

    function getTopic(
        string memory title
    ) external view returns (Lib.Topic memory) {
        return _getTopic(title);
    }

    function _getTopic(
        string memory title
    ) private view returns (Lib.Topic memory) {
        bytes32 topicId = keccak256(bytes(title));
        uint index = _topicIndex[topicId];
        if (index < topics.length) {
            Lib.Topic memory resultTopic = topics[index];
            if (keccak256(bytes(resultTopic.title)) == topicId) {
                return resultTopic;
            }
        }
        return
            Lib.Topic({
                title: "",
                description: "",
                status: Lib.Status.DELETED,
                createdDate: 0,
                startDate: 0,
                endDate: 0,
                category: Lib.Category.DECISION,
                amount: 0,
                accountable: address(0)
            });
    }

    function topicExists(string memory title) public view returns (bool) {
        return _getTopic(title).createdDate > 0;
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
        topics.push(newTopic);
        _topicIndex[keccak256(bytes(title))] = topics.length - 1;
    }

    function removeTopic(
        string memory title
    ) external onlyManager returns (Lib.TopicUpdate memory) {
        bytes32 topicId = keccak256(bytes(title));
        uint index = _topicIndex[topicId];
        require(index < topics.length, "There are no topics registered");
        Lib.Topic memory storageTopic = topics[index];        
        require(keccak256(bytes(storageTopic.title)) == topicId, "Topic does not exists");
        require(
            topics[index].status == Lib.Status.IDLE,
            "Only IDLE topics can be removed"
        );
        Lib.Category category = topics[index].category;
        if (index != topics.length - 1) {
            Lib.Topic memory lastTopic = topics[topics.length - 1];
            topics[index] = lastTopic;
            _topicIndex[keccak256(bytes(lastTopic.title))] = index;
        }
        topics.pop();
        delete _topicIndex[topicId];

        return
            Lib.TopicUpdate({
                id: topicId,
                title: title,
                status: Lib.Status.DELETED,
                category: category
            });
    }

    function getTopics(
        uint page,
        uint pageSize
    ) external view returns (Lib.TopicPage memory) {
        Lib.Topic[] memory result = new Lib.Topic[](pageSize);
        uint skip = ((page - 1) * pageSize);
        uint index = 0;
        for (
            uint i = skip;
            i < (skip + pageSize) && i < residents.length;
            i++
        ) {
            result[index++] = topics[i];
        }
        return Lib.TopicPage({topics: result, total: topics.length});
    }

    function editTopic(
        string memory topicToEdit,
        string memory description,
        uint amount,
        address accountable
    )
        external
        onlyManager
        validAddress(accountable)
        returns (Lib.TopicUpdate memory)
    {        
        bytes32 topicId = keccak256(bytes(topicToEdit));
        uint index = _topicIndex[topicId];
        require(index < topics.length, "There are no topics registered");
        Lib.Topic memory storageTopic = topics[index];        
        require(keccak256(bytes(storageTopic.title)) == topicId, "Topic does not exists");

        require(
            topics[index].status == Lib.Status.IDLE,
            "Only IDLE topics can be edited"
        );

        if (bytes(description).length > 0) {
            topics[index].description = description;
        }
        if (amount >= 0) {
            topics[index].amount = amount;
        }
        if (accountable != address(0)) {
            topics[index].accountable = accountable;
        }

        return
            Lib.TopicUpdate({
                id: topicId,
                title: topicToEdit,
                status: topics[index].status,
                category: topics[index].category
            });
    }

    function openVoting(
        string memory title
    ) external onlyManager returns (Lib.TopicUpdate memory) {
        bytes32 topicId = keccak256(bytes(title));
        uint index = _topicIndex[topicId];
        require(index < topics.length, "There are no topics registered");
        Lib.Topic memory storageTopic = topics[index];        
        require(keccak256(bytes(storageTopic.title)) == topicId, "Topic does not exists");
        require(
            topics[index].status == Lib.Status.IDLE,
            "Only IDLE topics can be opened for voting"
        );
        topics[index].status = Lib.Status.VOTING;
        topics[index].startDate = block.timestamp;
        return
            Lib.TopicUpdate({
                id: topicId,
                title: title,
                status: topics[index].status,
                category: topics[index].category
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
        uint index = _topicIndex[topicId];
        require(index < topics.length, "There are no topics registered");
        Lib.Topic memory storageTopic = topics[index];        
        require(keccak256(bytes(storageTopic.title)) == topicId, "Topic does not exists");
        require(
            topics[index].status == Lib.Status.VOTING,
            "Only VOTING topics can be voted"
        );

        uint residentIndex = _residentIndex[tx.origin];
        uint16 residence = residents[residentIndex].residence;
        Lib.Vote[] memory votes = _votings[topicId];
        require(
            !alreadyVoted(residence, votes),
            "A residence should vote only once"
        );

        Lib.Vote memory newVote = Lib.Vote({
            residence: residence,
            resident: tx.origin,
            option: option,
            timestamp: block.timestamp
        });

        _votings[topicId].push(newVote);
    }

    function closeVoting(
        string memory title
    ) external onlyManager returns (Lib.TopicUpdate memory) {
        bytes32 topicId = keccak256(bytes(title));
        uint index = _topicIndex[topicId];
        require(index < topics.length, "There are no topics registered");
        Lib.Topic memory storageTopic = topics[index];        
        require(keccak256(bytes(storageTopic.title)) == topicId, "Topic does not exists");
        require(
            topics[index].status == Lib.Status.VOTING,
            "Only VOTING topics can be closed"
        );

        uint8 approved = 0;
        uint8 denied = 0;
        uint8 abstentions = 0;
        uint8 minimumVotes = 0;

        if (topics[index].category == Lib.Category.SPENT) {
            minimumVotes = 10;
        } else if (topics[index].category == Lib.Category.CHANGE_MANAGER) {
            minimumVotes = 15;
        } else if (topics[index].category == Lib.Category.CHANGE_QUOTA) {
            minimumVotes = 20;
        } else {
            minimumVotes = 5;
        }

        require(
            numberOfVotes(title) >= minimumVotes,
            "You cannot finish a voting without a minimum of votes"
        );

        Lib.Vote[] memory votes = _votings[topicId];

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

        topics[index].status = newStatus;
        topics[index].endDate = block.timestamp;

        if (newStatus == Lib.Status.APPROVED) {
            if (topics[index].category == Lib.Category.CHANGE_QUOTA) {
                monthlyQuota = topics[index].amount;
            } else if (topics[index].category == Lib.Category.CHANGE_MANAGER) {
                if (isResident(manager)) {
                    residents[_residentIndex[manager]].isManager = false;
                }
                manager = topics[index].accountable;
                if (isResident(topics[index].accountable)) {
                    residents[_residentIndex[topics[index].accountable]]
                        .isManager = true;
                }
            }
        }

        return
            Lib.TopicUpdate({
                id: topicId,
                title: title,
                status: topics[index].status,
                category: topics[index].category
            });
    }

    function numberOfVotes(string memory title) public view returns (uint256) {
        bytes32 topicId = keccak256(bytes(title));
        return _votings[topicId].length;
    }

    function getVotes(string memory topicTitle) external view returns (Lib.Vote[] memory) {
        //bytes32 topic hash (keccak256(bytes(title))) -> Votes array
        bytes32 topicHash = keccak256(bytes(topicTitle));
        return _votings[topicHash];
    }

    function payQuota(uint16 residenceId) external payable {
        require(residenceExists(residenceId), "The residence does not exists");
        require(msg.value >= monthlyQuota, "Wrong value");
        uint residentIndex = _residentIndex[tx.origin];
        uint16 residence = residents[residentIndex].residence;
        require(
            block.timestamp > _nextPayment[residence],
            "Cannot pay twice in a month"
        );
        
        if (_nextPayment[residenceId] == 0) {
            _nextPayment[residenceId] = block.timestamp + _oneMonth;
        } else {
            _nextPayment[residenceId] += _oneMonth;
        }
    }

    function transfer(
        string memory topicTitle,
        uint amount
    ) external onlyManager returns (Lib.TransferReceipt memory) {
        require(address(this).balance >= amount, "Insufficient funds");
        bytes32 topicId = keccak256(bytes(topicTitle));
        uint index = _topicIndex[topicId];
        require(index < topics.length, "There are no topics registered");
        Lib.Topic memory storageTopic = topics[index];        
        require(keccak256(bytes(storageTopic.title)) == topicId, "Topic does not exists");
        require(
            topics[index].status == Lib.Status.APPROVED &&
                topics[index].category == Lib.Category.SPENT,
            "Transfers only for APPROVED and SPENT topics"
        );
        require(
            topics[index].amount >= amount,
            "The amount must be less or equal the APPROVED"
        );
        payable(topics[index].accountable).transfer(amount);
        topics[index].status = Lib.Status.SPENT;
        return
            Lib.TransferReceipt({
                to: topics[index].accountable,
                amount: amount,
                topic: topicTitle
            });
    }

    function getManager() external view returns (address) {
        return manager;
    }

    function getQuota() external view returns (uint) {
        return monthlyQuota;
    }
}
