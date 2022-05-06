//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/Context.sol";
import "./verifier.sol";
import "hardhat/console.sol";

contract Zkpayroll is Context {
    
    Verifier verifier = new Verifier();

    struct ZkBox {
        address tokenAddr;
        uint amount;
    }
    mapping(uint => ZkBox) public hash2zkbox;

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

    function createZkBox(uint pswHash, address tokenAddr, uint amount) public {
        IERC20(tokenAddr).transferFrom(_msgSender(), address(this), amount);
        hash2zkbox[pswHash] = ZkBox(tokenAddr, amount);
    }

    function openZkBox(uint[2] memory a, uint[2][2] memory b, uint[2] memory c, uint pswHash) public {
        require(verifier.verifyProof(a, b, c, [pswHash]), "Zkpayroll::openZkBox: verifyProof fail");
        
        ZkBox storage box = hash2zkbox[pswHash];
        IERC20(box.tokenAddr).transfer(_msgSender(), box.amount);
    }

}