//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/Context.sol";
import "./StreamPay.sol";
import "./ZkPay.sol";
import "hardhat/console.sol";

contract ZkPayroll is Context {

    StreamPay public streamPay;

    ZkPay public zkPay;


    constructor(address streamPayAddr, address zkPayAddr) {
        streamPay = StreamPay(streamPayAddr);
        zkPay = ZkPay(zkPayAddr);
    }


    function batchPay(
        address[] calldata tokenAddrs,
        address[] calldata toAddrs,
        uint[] calldata amounts
    ) public {
        require(
            tokenAddrs.length == toAddrs.length &&
            toAddrs.length == amounts.length,
            "ZkPayroll::batchPay: length error"
        );

        for (uint i = 0; i < tokenAddrs.length; i++) {
            IERC20(tokenAddrs[i]).transferFrom(
                _msgSender(),
                toAddrs[i],
                amounts[i]
            );
        }
    }


    function batchStreamPay(
        address[] calldata recipients,
        uint[] calldata deposits,
        address[] calldata tokenAddrs,
        uint[] calldata startTimes,
        uint[] calldata stopTimes
    ) public {
        require(
            recipients.length == deposits.length &&
            deposits.length == tokenAddrs.length &&
            tokenAddrs.length == startTimes.length &&
            startTimes.length == stopTimes.length,
            "ZkPayroll::batchStreamPay: length error"
        );

        for (uint i = 0; i < tokenAddrs.length; i++) {
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


    function batchZkPay(
        address[] calldata tokenAddrs,
        address[] calldata toAddrs,
        uint[] calldata amounts
    ) public {
        require(
            tokenAddrs.length == toAddrs.length &&
            toAddrs.length == amounts.length,
            "ZkPayroll::batchZkPay: length error"
        );

        for (uint i = 0; i < tokenAddrs.length; i++) {
            zkPay.rechargeWithAddress(_msgSender(), toAddrs[i], tokenAddrs[i], amounts[i]);
        }
    }
}
