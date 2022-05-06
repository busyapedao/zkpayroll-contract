const hre = require('hardhat')
const fs = require('fs')
const { BigNumber } = require('ethers')


async function main() {
    const accounts = await hre.ethers.getSigners()

    const Zkpayroll = await ethers.getContractFactory('Zkpayroll')
    const zkpayroll = await Zkpayroll.deploy()
    await zkpayroll.deployed()
    console.log('zkpayroll deployed:', zkpayroll.address)
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });