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

    string public message;

    constructor() {
        //owner = payable(msg.sender);
        manager = msg.sender;
        message = "Hello World";
        for (uint8 i = 1; i <= 2; i++) {
            //blocos
            for (uint8 j = 1; j <= 5; j++) {
                //andares
                for (uint8 k = 1; k <= 4; k++) {
                    //unidades
                    residences[(i * 1000) + (j * 100) + k] = true;
                }
            }
        }//END_OF_LOOP
    }

    function append(
        string memory a,
        string memory b
    ) internal pure returns (string memory) {
        return string(abi.encodePacked(a, b));
    }

    function setMessage(string memory newMessage) public {
        require(msg.sender == manager, "You do not have permission");
        message = newMessage;
    }
}
