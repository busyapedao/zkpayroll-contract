const hre = require('hardhat')
const fs = require('fs')
const { BigNumber } = require('ethers')

// streamPay deployed: 0xd8cf6CB47fDf8384D7a87E39F37E585fFdF08155
// zkPay deployed: 0x426A2aF1D0bD8996E693aa8d44F2EB406d54BEf8
// zkPayroll deployed: 0x51A28a9A15047f46AA0BD587d3327a086cae55BE
// usdt deployed: 0x822CA080e094Bf068090554A19Bc3D6618c800B3
// busd deployed: 0xB68A1de84D11D4b8f4e7826687750262cDC73b7e

async function main() {
	const accounts = await hre.ethers.getSigners()

	const StreamPay = await ethers.getContractFactory('StreamPay')
	const streamPay = await StreamPay.attach('0xd8cf6CB47fDf8384D7a87E39F37E585fFdF08155')
    let arr = await streamPay.getUserStreams('0x05e6959423FFb22e04D873bB1013268aa34E24B8', 1, 10)
    console.log(arr)

	const ZkPay = await ethers.getContractFactory('ZkPay')
	const zkPay = await await ZkPay.attach('0x426A2aF1D0bD8996E693aa8d44F2EB406d54BEf8')

	const ZkPayroll = await ethers.getContractFactory('ZkPayroll')
	const zkPayroll = await ZkPayroll.attach('0x51A28a9A15047f46AA0BD587d3327a086cae55BE')

	const MockERC20 = await ethers.getContractFactory('MockERC20')
	const usdt = await MockERC20.attach('0x822CA080e094Bf068090554A19Bc3D6618c800B3')

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