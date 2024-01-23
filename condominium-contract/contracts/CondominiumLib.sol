// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

// Uncomment this line to use console.log
// import "hardhat/console.sol";
library CondominiumLib {
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

    enum Options {
        EMPTY,
        YES,
        NO,
        ABSTENTION
    }

    struct Vote {
        address resident;
        uint16 residence;
        Options option;
        uint256 timestamp;
    }
}