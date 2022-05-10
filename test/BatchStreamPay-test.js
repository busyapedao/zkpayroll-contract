const { BigNumber } = require('ethers')

describe('BatchPay-test', function () {
    let accounts
    let provider
    let streamPay
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

    
    it('batchStreamPay', async function () {
		await usdt.approve(streamPay.address, m(1000, 18))
        console.log('step 1 approve done')

        let blockHeight = await provider.getBlockNumber()
        let block = await provider.getBlock(blockHeight)
        // console.log('block', block)

        let startTime = block.timestamp + 5;
        let stopTime = startTime + 100;

		await zkPayroll.batchStreamPay(
            [
                accounts[1].address,
                accounts[2].address,
                accounts[3].address
            ], [
                m(100, 18),
                m(100, 18),
                m(100, 18)
            ], [
                usdt.address,
                usdt.address,
                usdt.address
            ], [
                startTime,
                startTime,
                startTime
            ], [
                stopTime,
                stopTime,
                stopTime
            ]
        )
        console.log('step 2 batchStreamPay done')

        // let streamCount = n(await streamPay.streamCount());
        // for (let streamId=1; streamId<=streamCount; streamId++) {
        //     let stream = await streamPay.getStream(streamId)
        //     console.log('stream', stream)
        // }

        let streams = await streamPay.getUserStreams(accounts[0].address, 1, 3)
        console.log('stream', streams)

        await print()
    })


    it('withdrawFromStream', async function () {
        let streamCount = n(await streamPay.streamCount());
        for (let streamId=1; streamId<=streamCount; streamId++) {
            await delay(5)
            await accounts[9].sendTransaction({to:accounts[10].address, value:m(1,18)}) //force hardhat node running
            await print()

            await streamPay.withdrawFromStream(streamId, m(2, 18))
            console.log('withdrawFromStream done streamId=', streamId)

            let streams = await streamPay.getUserStreams(accounts[0].address, 1, 3)
            console.log('stream', streams)
        }

        await print()
    })


    it('cancelStream', async function () {
        let streamCount = n(await streamPay.streamCount());
        for (let streamId=1; streamId<=streamCount; streamId++) {
            await delay(5)
            await accounts[9].sendTransaction({to:accounts[10].address, value:m(1,18)}) //force hardhat node running
            await print()
    
            await streamPay.cancelStream(streamId)
            console.log('cancelStream done')

            let streams = await streamPay.getUserStreams(accounts[0].address, 1, 3)
            console.log('stream', streams)
        }

        await print()
    })


    async function print() {
        console.log('')
        for (let i=0; i<4; i++) {
            console.log('accounts[' + i + ']',
            'usdt:', d(await usdt.balanceOf(accounts[i].address), 18)
			)
		}
        
        let streamCount = n(await streamPay.streamCount());
        for (let streamId=1; streamId<=streamCount; streamId++) {
            let stream = await streamPay.streams(streamId)
            console.log('')
            console.log('streamId', streamId)
            if (stream.isEntity) {
                console.log('stream remainingBalance', d(stream.remainingBalance, 18))
                console.log('balanceOf sender', d(await streamPay.balanceOf(streamId, stream.sender), 18))
                console.log('balanceOf recipient', d(await streamPay.balanceOf(streamId, stream.recipient), 18))
            } else {
                console.log('stream not exist')
            }
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
