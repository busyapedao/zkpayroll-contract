const { BigNumber } = require('ethers')
const snarkjs = require("snarkjs")
const fs = require("fs")

describe('ZkPay-test', function () {
    let accounts
    let provider
    let zkPay
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
		await usdt.mint(accounts[1].address, m(1000, 18))
        console.log('usdt mint to accounts[1]', d(await usdt.balanceOf(accounts[1].address), 18))


        busd = await MockERC20.deploy('MockBUSD', 'BUSD')
        await busd.deployed()
        console.log('busd deployed:', busd.address)
		await busd.mint(accounts[0].address, m(1000, 18))
        console.log('busd mint to accounts[0]', d(await busd.balanceOf(accounts[0].address), 18))
		await busd.mint(accounts[1].address, m(1000, 18))
        console.log('busd mint to accounts[1]', d(await busd.balanceOf(accounts[1].address), 18))

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
        let psw = 'abc123'
        let tokenAddr = '0x0' //hex or int
        let amount = '0' //hex or int
        let input = [stringToHex(psw), tokenAddr, amount]
        console.log('input', input)

        let data = await snarkjs.groth16.fullProve({in:input}, "./zk/main3_js/main3.wasm", "./zk/circuit_final.zkey")

        // console.log("pswHash: ", data.publicSignals[0])
        console.log(JSON.stringify(data))

        const vKey = JSON.parse(fs.readFileSync("./zk/verification_key.json"))
        const res = await snarkjs.groth16.verify(vKey, data.publicSignals, data.proof)

        if (res === true) {
            console.log("Verification OK")

            let pswHash = data.publicSignals[0]
            let allHash = data.publicSignals[3]
            let boxhash = ethers.utils.solidityKeccak256(['uint256', 'address'], [pswHash, accounts[0].address])

            let proof = [
                BigNumber.from(data.proof.pi_a[0]).toHexString(),
                BigNumber.from(data.proof.pi_a[1]).toHexString(),
                BigNumber.from(data.proof.pi_b[0][1]).toHexString(),
                BigNumber.from(data.proof.pi_b[0][0]).toHexString(),
                BigNumber.from(data.proof.pi_b[1][1]).toHexString(),
                BigNumber.from(data.proof.pi_b[1][0]).toHexString(),
                BigNumber.from(data.proof.pi_c[0]).toHexString(),
                BigNumber.from(data.proof.pi_c[1]).toHexString()
            ]

            await zkPay.register(boxhash, proof, pswHash, allHash)
            console.log('register done')

        } else {
            console.log("Invalid proof")
        }
    })


    it('rechargeWithAddress', async function () {
        await usdt.connect(accounts[1]).approve(zkPay.address, m(100, 18))
        console.log('step 1 approve done')

        await zkPay.connect(accounts[1]).rechargeWithAddress(accounts[1].address, accounts[0].address, usdt.address, m(100, 18))
        console.log('step 2 rechargeWithAddress done')

        await print()
    })


    it('withdraw round1', async function () {
        let psw = 'abc123'
        let tokenAddr = usdt.address //hex or int
        let amount = s(m(30, 18)) //hex or int
        let input = [stringToHex(psw), tokenAddr, amount]
        console.log('input', input)

        let data = await snarkjs.groth16.fullProve({in:input}, "./zk/main3_js/main3.wasm", "./zk/circuit_final.zkey")

        // console.log("pswHash: ", data.publicSignals[0])
        console.log(JSON.stringify(data))

        const vKey = JSON.parse(fs.readFileSync("./zk/verification_key.json"))
        const res = await snarkjs.groth16.verify(vKey, data.publicSignals, data.proof)

        if (res === true) {
            console.log("Verification OK")

            let pswHash = data.publicSignals[0]
            let allHash = data.publicSignals[3]

            let proof = [
                BigNumber.from(data.proof.pi_a[0]).toHexString(),
                BigNumber.from(data.proof.pi_a[1]).toHexString(),
                BigNumber.from(data.proof.pi_b[0][1]).toHexString(),
                BigNumber.from(data.proof.pi_b[0][0]).toHexString(),
                BigNumber.from(data.proof.pi_b[1][1]).toHexString(),
                BigNumber.from(data.proof.pi_b[1][0]).toHexString(),
                BigNumber.from(data.proof.pi_c[0]).toHexString(),
                BigNumber.from(data.proof.pi_c[1]).toHexString()
            ]

            await zkPay.withdraw(proof, pswHash, usdt.address, m(30, 18), allHash, accounts[2].address)
            console.log('withdraw done')
    
            await print()

        } else {
            console.log("Invalid proof")
        }
    })


    it('withdraw round2', async function () {
        let psw = 'abc123'
        let tokenAddr = usdt.address //hex or int
        let amount = s(m(30, 18)) //hex or int
        let input = [stringToHex(psw), tokenAddr, amount]
        console.log('input', input)

        let data = await snarkjs.groth16.fullProve({in:input}, "./zk/main3_js/main3.wasm", "./zk/circuit_final.zkey")

        // console.log("pswHash: ", data.publicSignals[0])
        console.log(JSON.stringify(data))

        const vKey = JSON.parse(fs.readFileSync("./zk/verification_key.json"))
        const res = await snarkjs.groth16.verify(vKey, data.publicSignals, data.proof)

        if (res === true) {
            console.log("Verification OK")

            let pswHash = data.publicSignals[0]
            let allHash = data.publicSignals[3]

            let proof = [
                BigNumber.from(data.proof.pi_a[0]).toHexString(),
                BigNumber.from(data.proof.pi_a[1]).toHexString(),
                BigNumber.from(data.proof.pi_b[0][1]).toHexString(),
                BigNumber.from(data.proof.pi_b[0][0]).toHexString(),
                BigNumber.from(data.proof.pi_b[1][1]).toHexString(),
                BigNumber.from(data.proof.pi_b[1][0]).toHexString(),
                BigNumber.from(data.proof.pi_c[0]).toHexString(),
                BigNumber.from(data.proof.pi_c[1]).toHexString()
            ]

            await zkPay.withdraw(proof, pswHash, usdt.address, m(30, 18), allHash, accounts[2].address)
            console.log('withdraw done')
    
            await print()

        } else {
            console.log("Invalid proof")
        }
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


    function stringToHex(string) {
        let hexStr = '';
        for (let i = 0; i < string.length; i++) {
            let compact = string.charCodeAt(i).toString(16)
            hexStr += compact
        }
        return '0x' + hexStr
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
