const {network} = require("hardhat");
const {devChains} = require("../helper-hardhat-config");
const DECIMALS=8;
const INITIAL_ANSWER=2000000000000; // 2000

module.exports= async ({getNamedAccounts, deployments}) =>{
    const {deploy, log}=deployments;
    const {deployer}=await getNamedAccounts();
    // const chainId=network.config.chainId;

    if(devChains.includes(network.name)){
        log("Local netword detected! Deploying mocks");
        await deploy("MockV3Aggregator",{
            contract: "MockV3Aggregator",
            from: deployer,
            log: true,
            args: [DECIMALS,INITIAL_ANSWER]
        })
        log("Mocks Deployed");
        log("-------------------------");
    }
}

module.exports.tags = ["all","mocks"];