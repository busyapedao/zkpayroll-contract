//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "./IERC1620.sol";

/**
* @notice extend IERC1620
*/
interface IStreamPay is IERC1620 {

    /**
    * @notice for batch createStream
    */
    function createStreamWithSender(address sender, address recipient, uint256 deposit, address tokenAddress, uint256 startTime, uint256 stopTime)
        external
        returns (uint256 streamId);
}
