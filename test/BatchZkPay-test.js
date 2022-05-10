const { BigNumber } = require('ethers')
const zkPayHelp = require('../zk/zkPayHelp.js')

describe('BatchPay-test', function () {
    let accounts
    let provider
    let streamPay
    let zkPay
    let zkPayroll
    let usdt
    let busd

    before(async function () {
        accounts = await ethers.getSigners()
        provider = accounts[0].provider
    })

    it('deploy', async function () {
        const MockERC20 = await ethers.getContractFactory('MockERC20')
        usdt = await MockERC20.deploy('MockUSDT', 'USDT')
        await usdt.deployed()
        console.log('usdt deployed:', usdt.address)
		await usdt.mint(accounts[0].address, m(1000, 18))
        console.log('usdt mint to accounts[0]', d(await usdt.balanceOf(accounts[0].address), 18))

        busd = await MockERC20.deploy('MockBUSD', 'BUSD')
        await busd.deployed()
        console.log('busd deployed:', busd.address)
		await busd.mint(accounts[0].address, m(1000, 18))
        console.log('busd mint to accounts[0]', d(await busd.balanceOf(accounts[0].address), 18))

        const StreamPay = await ethers.getContractFactory('StreamPay')
        streamPay = await StreamPay.deploy()
        await streamPay.deployed()
        console.log('streamPay deployed:', streamPay.address)
        
        const ZkPay = await ethers.getContractFactory('ZkPay')
        zkPay = await ZkPay.deploy()
        await zkPay.deployed()
        console.log('zkPay deployed:', zkPay.address)

        const ZkPayroll = await ethers.getContractFactory('ZkPayroll')
        zkPayroll = await ZkPayroll.deploy(streamPay.address, zkPay.address)
        await zkPayroll.deployed()
        console.log('zkPayroll deployed:', zkPayroll.address)

    })

    
    it('register', async function () {
        for (let i=1; i<=3; i++) {
            let {pswHash, allHash, proof} = await zkPayHelp.generateProof('abc123', '0x00', '0')
            let boxhash = zkPayHelp.getBoxhash(pswHash, accounts[i].address)
            // console.log('pswHash', pswHash, 'boxhash', boxhash)

            await zkPay.connect(accounts[i]).register(boxhash, proof, pswHash, allHash)
            console.log('accounts %s register done', i)
        }
    })


    it('batchZkPay', async function () {
		let data = {
			tokenAddrs: [
				usdt.address,
				usdt.address,
				usdt.address
			],
			toAddrs: [
				accounts[1].address,
				accounts[2].address,
				accounts[3].address
			],
			amounts: [
				m(10, 18),
				m(20, 18),
				m(30, 18)
			]
		}

		await usdt.approve(zkPay.address, m(60, 18))
        console.log('step 1 approve done')
		
		await zkPayroll.batchZkPay(data.tokenAddrs, data.toAddrs, data.amounts)
        console.log('step 2 batchZkPay done')
		
		await print()
    })


    it('withdraw', async function () {
        for (let i=1; i<=3; i++) {
            let {pswHash, allHash, proof} = await zkPayHelp.generateProof('abc123', usdt.address, s(m(10, 18)))
            await zkPay.connect(accounts[i]).withdraw(proof, pswHash, usdt.address, m(10, 18), allHash, accounts[4].address)
            console.log('accounts %s withdraw done', i)
        }

        await print()
    })


    async function print() {
        console.log('')
        for (let i=0; i<=4; i++) {
            console.log('accounts[' + i + ']',
            'usdt:', d(await usdt.balanceOf(accounts[i].address), 18), 
            'safebox usdt:', d((await zkPay.balanceOf(accounts[i].address, [usdt.address]))[0], 18)
			)
		}
        console.log('')
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
})
