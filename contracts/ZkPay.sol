//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/Context.sol";
import "./verifier.sol";
import "hardhat/console.sol";

contract ZkPay is Context {
    
    Verifier verifier = new Verifier();

    mapping(uint => mapping(address => uint)) public hash2token2amount;

    mapping(uint => bool) public usedProof;

    constructor() {
        
    }

    function recharge(uint pswHash, address tokenAddr, uint amount) public {
        IERC20(tokenAddr).transferFrom(_msgSender(), address(this), amount);
        hash2token2amount[pswHash][tokenAddr] += amount;
    }

    function withdraw(uint[2] memory a, uint[2][2] memory b, uint[2] memory c, uint pswHash, address tokenAddr, uint amount, address to) public {
        require(!usedProof[a[0]], "ZkPay::withdraw: proof used");
        require(verifier.verifyProof(a, b, c, [pswHash]), "ZkPay::withdraw: verifyProof fail");
        
        hash2token2amount[pswHash][tokenAddr] -= amount;
        usedProof[a[0]] = true;

        IERC20(tokenAddr).transfer(to, amount);
    }

}