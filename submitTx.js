const { Contract, Wallet, providers, utils } = require('ethers')
require('dotenv').config()

const WalletSimpleJson = require('./src/WalletSimple.json')

const l1Provider = new providers.JsonRpcProvider(process.env.L1_NODE_WEB3_URL)
const l1Wallet = new Wallet(process.env.SENDER_PRIVATE_KEY, l1Provider)

const WalletAddress = process.env.WALLET_ADDRESS
const OMGAddress = '0xd26114cd6EE289AccF82350c8d8487fedB8A0C07'

const WalletSimple = new Contract(
    WalletAddress,
    WalletSimpleJson.abi,
    l1Wallet
)

async function main() {
    // submit the tx with following params
    const toAddress = OMGAddress
    const amount = 0
    const args = process.argv.slice(2)
    const data = args[0]

    const expireTime = args[1]
    const sequenceId = args[2]

    const sig = args[3]

    const submitTx = await WalletSimple.sendMultiSig(
        toAddress,
        amount,
        data,
        expireTime,
        sequenceId,
        sig
    )
    await submitTx.wait()

    console.log("Done!")
}

main()