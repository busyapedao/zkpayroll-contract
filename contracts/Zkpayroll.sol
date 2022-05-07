//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/Context.sol";
import "./interfaces/IStreamPay.sol";
import "hardhat/console.sol";

contract ZkPayroll is Context {
    
    IStreamPay public streamPay;

    constructor(address streamPayAddr) {
        streamPay = IStreamPay(streamPayAddr);
    }

    function batchPay(
        address[] calldata tokenAddrs, 
        address[] calldata toAddrs, 
        uint[] calldata amounts
        ) 
        public {

        require(
            tokenAddrs.length == toAddrs.length
            && toAddrs.length == amounts.length,
            "ZkPayroll::batchPay: length error"
        );

        for (uint i=0; i<tokenAddrs.length; i++) {
            IERC20(tokenAddrs[i]).transferFrom(_msgSender(), toAddrs[i], amounts[i]);
        }
    }


    function batchStreamPay(
        address[] calldata recipients, 
        uint[] calldata deposits, 
        address[] calldata tokenAddrs, 
        uint[] calldata startTimes, 
        uint[] calldata stopTimes
        ) 
        public {

        require(
            recipients.length == deposits.length 
            && deposits.length == tokenAddrs.length
            && tokenAddrs.length == startTimes.length
            && startTimes.length == stopTimes.length,
            "ZkPayroll::batchStreamPay: length error"
        );

        for (uint i=0; i<tokenAddrs.length; i++) {
            streamPay.createStreamWithSender(
                _msgSender(),
                recipients[i], 
                deposits[i], 
                tokenAddrs[i], 
                startTimes[i], 
                stopTimes[i]
            );
        }
    }

}