// // in frontend we should use 'import' keyword instread of 'require' keyword we use in the node
// import {ethers} from "./ethers-5.6.esm.min.js";
// import {abi, contractAddress} from "./constants.js";

// const connectButton=document.getElementById("connectButton");
// connectButton.onclick=connect;

// const fundButton=document.getElementById("fundButton");
// fundButton.onclick=fund;

// async function connect(){
//     if(typeof window.ethereum!=="undefined"){
//         await window.ethereum.request({method: "eth_requestAccounts"});
//         connectButton.innerHTML="Connected!"
//     }
//     else{
//         connectButton.innerHTML="please Install Metamask"
//     }
// }


// async function fund(){
//     let ethAmount="5";
//     console.log(`Funding with ${ethAmount}`);
//     if(typeof window.ethereum!=="undefined"){
//         // provider (connection to blockchain)
//         const provider=new ethers.providers.Web3Provider(window.ethereum);

//         // signer / wallet
//         const signer=provider.getSigner();
//         console.log(signer);

//         // contract that we are interacting with   --> (we need to save it in a constant file as contracts keep getting changed as we interact with them)
//         const contract=new ethers.Contract(contractAddress,abi,signer);
//         // ^ABI and address


//         // making transactions 
//         try{
//             const transactionResponse=await contract.fund({value: ethers.utils.parseEther(ethAmount)});
//             await listenForTransactionMine(transactionResponse);
//         }
//         catch(error){
//             console.log(error);
//         }
//     }
// }

// function listenForTransactionMine(transactionResponse, provider){
//     console.log(`Mining ${transactionResponse.hash}...`)
//     // returns a Promise
//     provider.once(transactionResponse.hash, (transactionReciept)=>{
//         console.log(`Completed with ${transactionReciept.confirmations} confirmations`);
//     });
// }







import { ethers } from "./ethers-5.6.esm.min.js"
import { abi, contractAddress } from "./constants.js"

const connectButton = document.getElementById("connectButton")
const withdrawButton = document.getElementById("withdrawButton")
const fundButton = document.getElementById("fundButton")
const balanceButton = document.getElementById("balanceButton")
connectButton.onclick = connect
withdrawButton.onclick = withdraw
fundButton.onclick = fund
balanceButton.onclick = getBalance

async function connect() {
  if (typeof window.ethereum !== "undefined") {
    try {
      await ethereum.request({ method: "eth_requestAccounts" })
    } catch (error) {
      console.log(error)
    }
    connectButton.innerHTML = "Connected"
    const accounts = await ethereum.request({ method: "eth_accounts" })
    console.log(accounts)
  } else {
    connectButton.innerHTML = "Please install MetaMask"
  }
}

async function withdraw() {
  console.log(`Withdrawing...`)
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    await provider.send('eth_requestAccounts', [])
    const signer = provider.getSigner()
    const contract = new ethers.Contract(contractAddress, abi, signer)
    try {
      const transactionResponse = await contract.withdraw()
      await listenForTransactionMine(transactionResponse, provider)
      // await transactionResponse.wait(1)
    } catch (error) {
      console.log(error)
    }
  } else {
    withdrawButton.innerHTML = "Please install MetaMask"
  }
}

async function fund() {
  const ethAmount = document.getElementById("inputEth").value;
  console.log(`Funding with ${ethAmount}...`)
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner()
    const contract = new ethers.Contract(contractAddress, abi, signer)
    try {
      const transactionResponse = await contract.fund({
        value: ethers.utils.parseEther(ethAmount),
      })
      await listenForTransactionMine(transactionResponse, provider)
    } catch (error) {
      console.log(error)
    }
  } else {
    fundButton.innerHTML = "Please install MetaMask"
  }
}

async function getBalance() {
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    try {
      const balance = await provider.getBalance(contractAddress)
      console.log(ethers.utils.formatEther(balance))
    } catch (error) {
      console.log(error)
    }
  } else {
    balanceButton.innerHTML = "Please install MetaMask"
  }
}

function listenForTransactionMine(transactionResponse, provider) {
    console.log(`Mining ${transactionResponse.hash}`)
    return new Promise((resolve, reject) => {
        try {
            provider.once(transactionResponse.hash, (transactionReceipt) => {
                console.log(
                    `Completed with ${transactionReceipt.confirmations} confirmations. `
                )
                resolve()
            })
        } catch (error) {
            reject(error)
        }
    })
}

