//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/Context.sol";
import "./verifier.sol";
import "hardhat/console.sol";

contract ZkPay is Context {
    Verifier verifier = new Verifier();

    struct SafeBox{
        bytes32 boxhash;
        address user;
        mapping(address => uint) balance;
    }

    mapping(bytes32 => SafeBox) public boxhash2safebox;

    mapping(address => bytes32) public user2boxhash;

    mapping(uint => bool) public usedProof;


    constructor() {}


    function balanceOf(address user, address[] memory tokenAddrs) public view returns(uint[] memory bals) {
        bytes32 boxhash = user2boxhash[user];
        SafeBox storage box = boxhash2safebox[boxhash];
        bals = new uint[](tokenAddrs.length);
        for (uint i=0; i<tokenAddrs.length; i++) {
            address tokenAddr = tokenAddrs[i];
            bals[i] = box.balance[tokenAddr];
        }
    }


    function register(
        bytes32 boxhash,
        uint[8] memory proof,
        uint pswHash,
        uint allHash
    ) public {
        SafeBox storage box = boxhash2safebox[boxhash];

        require(user2boxhash[_msgSender()] == bytes32(0), "ZkPay::register: one user one safebox");
        require(box.boxhash == bytes32(0), "ZkPay::register: boxhash has been registered");
        require(keccak256(abi.encodePacked(pswHash, _msgSender())) == boxhash, "ZkPay::register: boxhash error");
        require(
            verifier.verifyProof(
                [proof[0], proof[1]],
                [[proof[2], proof[3]], [proof[4], proof[5]]],
                [proof[6], proof[7]],
                [pswHash, uint160(0x00), 0, allHash]
            ),
            "ZkPay::register: verifyProof fail"
        );

        box.boxhash = boxhash;
        box.user = _msgSender();

        user2boxhash[_msgSender()] = boxhash;
    }


    function rechargeWithBoxhash(
        bytes32 boxhash,
        address tokenAddr,
        uint amount
    ) public {
        SafeBox storage box = boxhash2safebox[boxhash];
        require(box.boxhash != bytes32(0), "ZkPay::rechargeWithBoxhash: safebox not register yet");

        IERC20(tokenAddr).transferFrom(_msgSender(), address(this), amount);
        box.balance[tokenAddr] += amount;
    }


    function rechargeWithAddress(
        address user,
        address tokenAddr,
        uint amount
    ) public {
        bytes32 boxhash = user2boxhash[user];
        require(boxhash != bytes32(0), "ZkPay::rechargeWithAddress: safebox not register yet");

        rechargeWithBoxhash(boxhash, tokenAddr, amount);
    }


    function withdraw(
        uint[8] memory proof,
        uint pswHash,
        address tokenAddr,
        uint amount,
        uint allHash,
        address to
    ) public {
        require(!usedProof[proof[0]], "ZkPay::withdraw: proof used");

        bytes32 boxhash = user2boxhash[_msgSender()];
        require(keccak256(abi.encodePacked(pswHash, _msgSender())) == boxhash, "ZkPay::withdraw: pswHash error");

        require(
            verifier.verifyProof(
                [proof[0], proof[1]],
                [[proof[2], proof[3]], [proof[4], proof[5]]],
                [proof[6], proof[7]],
                [pswHash, uint160(tokenAddr), amount, allHash]
            ),
            "ZkPay::withdraw: verifyProof fail"
        );

        SafeBox storage box = boxhash2safebox[boxhash];
        require(box.boxhash != bytes32(0), "ZkPay::withdraw: safebox not register yet");

        usedProof[proof[0]] = true;
        box.balance[tokenAddr] -= amount;

        IERC20(tokenAddr).transfer(to, amount);
    }

}