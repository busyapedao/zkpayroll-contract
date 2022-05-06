//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/Context.sol";
import "./verifier.sol";
import "hardhat/console.sol";

contract Zkpayroll is Context {
    
    Verifier verifier = new Verifier();

    mapping(uint => mapping(address => uint)) public hash2token2amount;

    mapping(uint => bool) public usedProof;

    constructor() {
        
    }

    function batchPay(address[] calldata tokenAddrs, address[] calldata toAddrs, uint[] calldata amounts) public {
        require(tokenAddrs.length == toAddrs.length && toAddrs.length == amounts.length, "Zkpayroll::batchPay: length error");

        for (uint i=0; i<tokenAddrs.length; i++) {
            IERC20(tokenAddrs[i]).transferFrom(_msgSender(), toAddrs[i], amounts[i]);
        }
    }

    // for testing
    function verifyProof(uint[2] memory a, uint[2][2] memory b, uint[2] memory c, uint[1] memory input) public view returns (bool) {
        return verifier.verifyProof(a, b, c, input);
    }

    function recharge(uint pswHash, address tokenAddr, uint amount) public {
        IERC20(tokenAddr).transferFrom(_msgSender(), address(this), amount);
        hash2token2amount[pswHash][tokenAddr] += amount;
    }

    function withdraw(uint[2] memory a, uint[2][2] memory b, uint[2] memory c, uint pswHash, address tokenAddr, uint amount, address to) public {
        require(!usedProof[a[0]], "Zkpayroll::withdraw: proof used");
        require(verifier.verifyProof(a, b, c, [pswHash]), "Zkpayroll::withdraw: verifyProof fail");
        
        hash2token2amount[pswHash][tokenAddr] -= amount;
        usedProof[a[0]] = true;

        IERC20(tokenAddr).transfer(to, amount);
    }

}