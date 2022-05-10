const hre = require('hardhat')
const fs = require('fs')
const { BigNumber } = require('ethers')

// streamPay deployed: 0x6FD9dB63dbC6BE452ae7B0Fe9995c81d967870Bb
// zkPayroll deployed: 0xF56479d94aBDe6256Dc5C4C7f454aF5d69C851Bb
// zkPay deployed: 0x5D220bC580E370b568f6b0d4d1A9Ca056f8B878A
// usdt deployed: 0x822CA080e094Bf068090554A19Bc3D6618c800B3
// busd deployed: 0xB68A1de84D11D4b8f4e7826687750262cDC73b7e

async function main() {
	const accounts = await hre.ethers.getSigners()

	const StreamPay = await ethers.getContractFactory('StreamPay')
	const streamPay = await StreamPay.deploy()
	await streamPay.deployed()
	console.log('streamPay deployed:', streamPay.address)

	const ZkPay = await ethers.getContractFactory('ZkPay')
	const zkPay = await ZkPay.deploy()
	await zkPay.deployed()
	console.log('zkPay deployed:', zkPay.address)

	const ZkPayroll = await ethers.getContractFactory('ZkPayroll')
	const zkPayroll = await ZkPayroll.deploy(streamPay.address, zkPay.address)
	await zkPayroll.deployed()
	console.log('zkPayroll deployed:', zkPayroll.address)

	// const MockERC20 = await ethers.getContractFactory('MockERC20')
	// // const usdt = await MockERC20.attach('0x822CA080e094Bf068090554A19Bc3D6618c800B3')
	// const usd = await MockERC20.deploy('MockBUSD', 'BUSD')
	// await usd.deployed()
	// console.log('busd deployed:', usd.address)
	
	// await usd.mint('0x05e6959423FFb22e04D873bB1013268aa34E24B8', m(1000000, 18))
	// await usd.mint(accounts[0].address, m(1000000, 18))
	console.log('done')
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