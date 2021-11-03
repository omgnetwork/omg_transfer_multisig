const { Contract, Wallet, providers, utils } = require('ethers')
require('dotenv').config()

const WalletSimpleJson = require('./src/WalletSimple.json')
const OMGJson = require('./src/OMG.json')
const util = require('ethereumjs-util');

const l1Provider = new providers.JsonRpcProvider(process.env.L1_NODE_WEB3_URL)
const l1Wallet = new Wallet(process.env.SIGNER_PRIVATE_KEY, l1Provider)

const WalletAddress = process.env.WALLET_ADDRESS
const OMGAddress = '0xd26114cd6EE289AccF82350c8d8487fedB8A0C07'

const WalletSimple = new Contract(
    WalletAddress,
    WalletSimpleJson.abi,
    l1Wallet
)

const OMGToken = new Contract(
    OMGAddress,
    OMGJson
)

const serializeSignature = ({ r, s, v }) =>
  '0x' + Buffer.concat([r, s, Buffer.from([v])]).toString('hex');

async function main() {
    const receiverAddress = process.env.RECEIVER_ADDRESS
    const amountInOMGToSend = utils.parseEther(process.env.AMOUNT_OMG)

    const prefix = 'ETHER'
    // OMG contract
    const toAddress = OMGAddress
    const amount = 0
    const data = OMGToken.interface.encodeFunctionData(
        'transfer',
        [receiverAddress, amountInOMGToSend]
    )
    // 12 hours
    const expireTime = Math.floor((new Date().getTime()) / 1000) + 43200;

    const sequenceId = (await WalletSimple.getNextSequenceId()).toNumber()

    // get operationHash to sign
    const operationHash = utils.solidityKeccak256(['string', 'address', 'uint', 'bytes', 'uint', 'uint'], [prefix, toAddress, amount, data, expireTime, sequenceId])

    const sig = util.ecsign(util.toBuffer(operationHash), util.toBuffer(process.env.SIGNER_PRIVATE_KEY))

    console.log("Signature for first signer generated, specify/share with the second signer (SENDER_PRIVATE_KEY) and other env params and then have the second signer")

    console.log("Run this command:")
    console.log("-------------------")
    console.log(`node submitTx.js ${data} ${expireTime} ${sequenceId} ${serializeSignature(sig)}`)
    console.log("-------------------")
}

main()