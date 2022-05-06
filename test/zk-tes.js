const { BigNumber } = require('ethers')
const snarkjs = require("snarkjs")
const fs = require("fs")

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


	// it('call', async function () {
	// 	// data from running zk/poseidon.js
    //     let data = {
    //         publicSignals: [
    //             '9902527471464154332635593528936384799214820166179556873554537535752372002359'
    //         ],
    //         Proof:
    //         {
    //             "pi_a": [
    //                 "10554735517936436648469326078854838653165037134071694613290918669472174393361",
    //                 "9020973076929972804814295038634380902539247985904041784137997335889338546794",
    //                 "1"
    //             ],
    //             "pi_b": [
    //                 [
    //                     "21242069596232102688574225414637465203165369675510707552899857770544345492196",
    //                     "11127930651807752727524147612605968700077493843287852938453499942203705216324"
    //                 ],
    //                 [
    //                     "1721269731417684876393225376501704324743258418777410472298933047709999873604",
    //                     "18173403561572387139822814582131735776604660612320303916331706231652779465103"
    //                 ],
    //                 [
    //                     "1",
    //                     "0"
    //                 ]
    //             ],
    //             "pi_c": [
    //                 "14508463408772966418646681023342378368335070518574650113005041750344474103995",
    //                 "4187242551831196567879720821963644246740692560955806272986635992125538886131",
    //                 "1"
    //             ]
    //         }
    //     }

    //     let a = [
    //         BigNumber.from(data.Proof.pi_a[0]).toHexString(),
    //         BigNumber.from(data.Proof.pi_a[1]).toHexString()
    //     ]
    //     let b = [
    //         [
    //             BigNumber.from(data.Proof.pi_b[0][1]).toHexString(),
    //             BigNumber.from(data.Proof.pi_b[0][0]).toHexString()
    //         ],
    //         [
    //             BigNumber.from(data.Proof.pi_b[1][1]).toHexString(),
    //             BigNumber.from(data.Proof.pi_b[1][0]).toHexString()
    //         ]
    //     ]
    //     let c = [
    //         BigNumber.from(data.Proof.pi_c[0]).toHexString(),
    //         BigNumber.from(data.Proof.pi_c[1]).toHexString()
    //     ]
    //     let input = [
    //         BigNumber.from(data.publicSignals[0]).toHexString()
    //     ]

    //     console.log(a, b, c, input)
    //     let success = await zkpayroll.verifyProof(a, b, c, input)

    //     console.log('verifyProof', success)
    // })

    it('createZkBox', async function () {
        let psw = 'abc123'
        let input = stringToHex(psw)
        console.log('input', input)

        let data = await snarkjs.groth16.fullProve({in:input}, "./zk/main2_js/main2.wasm", "./zk/circuit_final.zkey")

        // console.log("pswHash: ", data.publicSignals[0])
        console.log(JSON.stringify(data))

        const vKey = JSON.parse(fs.readFileSync("./zk/verification_key.json"))
        const res = await snarkjs.groth16.verify(vKey, data.publicSignals, data.proof)

        if (res === true) {
            console.log("Verification OK")

            await usdt.approve(zkpayroll.address, m(100, 18))
            console.log('step 1 approve done')

            await zkpayroll.createZkBox(data.publicSignals[0], usdt.address, m(100, 18))
            console.log('step 2 batchPay done')

        } else {
            console.log("Invalid proof")
        }
    })


    it('openZkBox', async function () {
        let psw = 'abc123'
        let input = stringToHex(psw)
        console.log('input', input)

        let data = await snarkjs.groth16.fullProve({in:input}, "./zk/main2_js/main2.wasm", "./zk/circuit_final.zkey")

        // console.log("pswHash: ", data.publicSignals[0])
        console.log(JSON.stringify(data))

        const vKey = JSON.parse(fs.readFileSync("./zk/verification_key.json"))
        const res = await snarkjs.groth16.verify(vKey, data.publicSignals, data.proof)

        if (res === true) {
            console.log("Verification OK")

            let a = [
                BigNumber.from(data.proof.pi_a[0]).toHexString(),
                BigNumber.from(data.proof.pi_a[1]).toHexString()
            ]
            let b = [
                [
                    BigNumber.from(data.proof.pi_b[0][1]).toHexString(),
                    BigNumber.from(data.proof.pi_b[0][0]).toHexString()
                ],
                [
                    BigNumber.from(data.proof.pi_b[1][1]).toHexString(),
                    BigNumber.from(data.proof.pi_b[1][0]).toHexString()
                ]
            ]
            let c = [
                BigNumber.from(data.proof.pi_c[0]).toHexString(),
                BigNumber.from(data.proof.pi_c[1]).toHexString()
            ]
            let pswHash = BigNumber.from(data.publicSignals[0]).toHexString()
            
            await zkpayroll.connect(accounts[1]).openZkBox(a, b, c, pswHash)
            console.log('openZkBox done')
    
            for (i=0; i<5; i++) {
                console.log('accounts[' + i + ']',
                    'usdt:', d(await usdt.balanceOf(accounts[i].address), 18), 
                    'busd:', d(await busd.balanceOf(accounts[i].address), 18)
                )
            }

        } else {
            console.log("Invalid proof")
        }

        
    })



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
