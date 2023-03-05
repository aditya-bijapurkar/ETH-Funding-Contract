// hardhat-deplot import
// no need of main function
// hardhat-deploy will call a specific function we call here

const { network } = require("hardhat");
const {networkConfig, devChains}=require("../helper-hardhat-config");
const {verify}=require("../utils/verify");

/*
function deployFunc(hre){   
    hre.getNamedAccounts
    hre.deployments
}
module.exports.default=deployFunc;
*/

// making an asyncronous anonymus function
// module.exports=async(hre)=>{
//      const {getNamedAccounts, deployments} = hre
// }

module.exports= async ({getNamedAccounts, deployments})=>{    // hre functions
    const {deploy, log} = deployments;
    const {deployer}=  await getNamedAccounts();
    const chainId=network.config.chainId;

    // if chain is X use address A, if chain is Y use address B*/
    let ethUsdPriceFeedAddress;
    // if contracts dont exist we create a mimimal version of them for our local testing
    if(devChains.includes(network.name)){
        const ethUsdAggregator = await deployments.get("MockV3Aggregator");
        ethUsdPriceFeedAddress=ethUsdAggregator.address;
    }
    else{
        ethUsdPriceFeedAddress=networkConfig[chainId]["ethUsdPriceFeed"];
    }

    const fundMe=await deploy("FundMe",{
        from: deployer,
        args:[ethUsdPriceFeedAddress],
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1
    })
    const args=[ethUsdPriceFeedAddress];
    if(!devChains.includes(network.name) && process.env.ETHERSCAN_API_KEY){
        //verify
        await(verify(fundMe.address,args));
    }
    log("-------------------------------------")
}

module.exports.tags=["all","fundme"];

// forking a blockchain
/*
mocks->
    when a contract is linked to another contract while testing it all its dependancies needs to be tested
    mocks are basically dummy pieces of code which simulate the dependancies so that we can do atomic testing on the code

    when going dfor a localhost or a hardhat network we need to use a mock

    when we want to change chains?
        =>
*/