const { BigNumber } = require('ethers')

describe('Zkpayroll-test', function () {
    let accounts
    let provider
    let zkpayroll
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


        const Zkpayroll = await ethers.getContractFactory('Zkpayroll')
        zkpayroll = await Zkpayroll.deploy()
        await zkpayroll.deployed()
        console.log('zkpayroll deployed:', zkpayroll.address)

    })

    
    it('batchPay', async function () {
		let data = {
			tokenAddrs: [
				usdt.address,
				busd.address,
				busd.address
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

		await usdt.approve(zkpayroll.address, m(10, 18))
		await busd.approve(zkpayroll.address, m(50, 18))
        console.log('step 1 approve done')
		
		await zkpayroll.batchPay(data.tokenAddrs, data.toAddrs, data.amounts)
        console.log('step 2 batchPay done')
		
		for (let i=0; i<4; i++) {
			console.log('accounts[' + i + ']',
				'usdt:', d(await usdt.balanceOf(accounts[i].address), 18), 
				'busd:', d(await busd.balanceOf(accounts[i].address), 18)
			)
		}
    })


    it('batchPay max test', async function () {
		let data = {
			tokenAddrs: [
				
			],
			toAddrs: [
				
			],
			amounts: [
				
			]
		}

		//the max is 293, with gas limit 30000000
		for (let i=0; i<293; i++) {
			data.tokenAddrs.push(usdt.address)
			data.toAddrs.push(accounts[4].address)
			data.amounts.push(m(1, 18))
		}

		await usdt.approve(zkpayroll.address, m(1000, 18))
        console.log('step 1 approve done')
		
		await zkpayroll.batchPay(data.tokenAddrs, data.toAddrs, data.amounts)
        console.log('step 2 batchPay done')
		
		for (i=0; i<5; i++) {
			console.log('accounts[' + i + ']',
				'usdt:', d(await usdt.balanceOf(accounts[i].address), 18), 
				'busd:', d(await busd.balanceOf(accounts[i].address), 18)
			)
		}
    })


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
