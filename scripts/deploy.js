const hre = require('hardhat')
const fs = require('fs')
const { BigNumber } = require('ethers')


async function main() {
	const accounts = await hre.ethers.getSigners()

	// const Zkpayroll = await ethers.getContractFactory('Zkpayroll')
	// const zkpayroll = await Zkpayroll.deploy()
	// await zkpayroll.deployed()
	// console.log('zkpayroll deployed:', zkpayroll.address)

	// const MockERC20 = await ethers.getContractFactory('MockERC20')
	// const usdt = await MockERC20.deploy('MockUSDT', 'USDT')
	// await usdt.deployed()
	// console.log('usdt deployed:', usdt.address)

	const MockERC20 = await ethers.getContractFactory('MockERC20')
	const usdt = await MockERC20.attach('0x822CA080e094Bf068090554A19Bc3D6618c800B3')
	await usdt.mint(accounts[0].address, m(1000000, 18))
}


function getAbi(jsonPath) {
	let file = fs.readFileSync(jsonPath)
	let abi = JSON.parse(file.toString()).abi
	return abi
}

async function delay(sec) {
	return new Promise((resolve, reject) => {
		setTimeout(resolve, sec * 1000);
	})
}

function m(num, decimals) {
	return BigNumber.from(num).mul(BigNumber.from(10).pow(decimals))
}

function d(bn, decimals) {
	return bn.mul(BigNumber.from(100)).div(BigNumber.from(10).pow(decimals)).toNumber() / 100
}

function b(num) {
	return BigNumber.from(num)
}

function n(bn) {
	return bn.toNumber()
}

function s(bn) {
	return bn.toString()
}

main()
	.then(() => process.exit(0))
	.catch(error => {
		console.error(error);
		process.exit(1);
	});