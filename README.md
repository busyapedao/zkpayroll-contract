<div align="center"><img src="./doc/zknewlogo3.png"></div>

#### USDT and BUSD as salary is being popular, zkpayroll is a tool for salary manage and distribute, with zk-proof, it's privacy and security. The contracts have no owner, that means zkpayroll is running as a protocol, a infrastructure of DAO.
#### The contracts have 3 features:

### 1.Batch Pay
<div align="center"><img src="./doc/batchpay.png"></div>
<p>If there're 100 salaries to pay, it needs 100 Txs, use batchPay, it only need 1 Tx.</p>
<p>This is the basic feature, it can also use to hide the high salary.</p>

##### e.g. someone's salary is 10000 USDT (so high~), the admin ask him for 5 wallets to receive payment, every transation is no more than 2000 USDT in bathPay, is someone's salary more than 2000 USDT? No one knows.<br>
<br>
<br>

### 2.Stream Pay
<p>You pay a payment to someone, the token is locked in the contract, it releases by the time, which means the recipient can claim every second, like stream.</p>
<div align="center"><img src="./doc/streampay.png"></div>
<p>This is how the contract works:</p>
<p>The sender deposits to the contract, the recipient claims from the contract, then the contract calculats how much the recipient can claim.</p>
<p>The stream can be canceled by sender and recipient, then the contract auto claim for the recipient, and the remaining amount is back to the sender.</p>
<p>The StreamPay.sol contract implements ERC1620 <https://eips.ethereum.org/EIPS/eip-1620></p>
<p>We extend getUserStreams() function，for frontend use.</p>
<br>
<br>

### 3.Zero knowledge Pay
<p>Last year, we got 3 new teammates, they were newbies in Web3, we taught them to use wallet, told them the traps, but after the salary payment, 2 of 3 had bean stolen, because they donwloaded the fake Metamask.</p>
<p>We recognize that the newbie's first salary is much easier to be stole.</p>
<p>So We build safebox for everyone, give assets double safety.</p>
<div align="center"><img src="./doc/zkpay-1.png"></div>
<p>User create a safebox with password hash in the contract, the only way to withdraw from safebox is sending the correct password. So if the private key is taken by the hacker, without password, the hacker can't withdraw tokens from safebox.</p>
<p>But the problem is that if the password was sent, everyone knows the password.</p>
<p>So we use zk-proof instead.</p>
<div align="center"><img src="./doc/zkpay-2.png"></div>
<p>It can hide password, it works like signature, user signs the data with password, and the contract verify the signature.</p>
<p>Following is how the "sign" works in zk circuit (in zk, the algorithm is called circuit).</p>
<div align="center"><img src="./doc/zkpay-3.png"></div>
<p>Poseidon is a kind of hash algorithm, it's circuit friendly and popular in zk circuits, the SHA256 we tried, but it didn't work well, so we chose Poseidon circuit instead.</p>
<p>User input password, tokenAddr and amount, that means user knows the password, and he want to take the amount of token. The zk circuit output the proof and the result data, to proof that the password hash is generated by the hash algorithm, if the result modify, the verify in the contract will fail.</p>
<p>The better than signature algorithm, we can design the output in zk. The result contains not only password hash, but also tokenAddr, amount, all hash. After verify success in contract, it will take amount of token from the correct safebox.</p>
<p>We did something more in the contract:</p>
<ul>
<li>One wallet One safebox. So we can send token to someone's safebox by his wallet address.
<li>User need create safebox once (register). After register, user knows the safebox. Maybe without register is better? We're discussing. 
<li>Only the safebox owner can withdraw. Double safety. 
    <ul>
    <li>the wallet private key is taken, the safebox is still safe. 
    <li>the safebox password is taken, it's still safe. 
    <li>both private key and password are taken, that's so bad.
    </ul>
</ul>
<p>About Double Spent:<br>
The used proof was recorded in contract, so double spent is impossible. In other side, the proof is quite different every time, in zk circuit, even though input the same data, it'll output the same, but the proofs are different. So the safebox owner can withdraw the same thing every time.</p>
<br>
<br>

## FAQ
### Where is the password store?
In your mind.<br>
<br>

### If the project fail or be hacked, is my safebox safe?
Yes, the safebox is in the contract, and the contract has no owner, it's running forever and no one can modify it.<br>
<br>

### How long did zkpayroll developed?
Since 2022-5-4, for the Dora Hackthon <https://dorahacks.io/buidl/2790>.<br>
<br>

### How many Tx can batch into one?
293 in testing.<br>
<br>

### What is the product design base on?
Stay simple, stay protocol.<br>
A assets tool as Metamask.<br>
<br>

### What is the future plan?
Working to earn? Maybe.<br>
Saving to earn? I guess.<br>