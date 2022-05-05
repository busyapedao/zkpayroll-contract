//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/Context.sol";
import "hardhat/console.sol";

contract Zkpayroll is Context {
    

    constructor() {
        
    }

    function batchPay(address[] calldata tokenAddrs, address[] calldata toAddrs, uint[] calldata amounts) public {
        require(tokenAddrs.length == toAddrs.length && toAddrs.length == amounts.length, "Zkpayroll::batchPay: length error");

        for (uint i=0; i<toAddrs.length; i++) {
            IERC20 token = IERC20(tokenAddrs[i]);
            address to = toAddrs[i];
            uint amount = amounts[i];
            token.transferFrom(_msgSender(), to, amount);
        }
    }

}
