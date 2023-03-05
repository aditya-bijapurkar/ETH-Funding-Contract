const { deployments, ethers, getNamedAccounts } = require("hardhat");
const {assert, expect}=require('chai');

describe("FundMe", function(){
    let fundMe, deployer, mockV3Aggregator;
    let sendValue=ethers.utils.parseEther("1");    // 1 ETH => 10^18 wei
    beforeEach(async function(){
        deployer=(await getNamedAccounts()).deployer;
        await deployments.fixture(["all"]);
        fundMe=await ethers.getContract("FundMe", deployer);
        mockV3Aggregator=await ethers.getContract("MockV3Aggregator", deployer);
    });

    describe("constructor", function(){
        it("sets the aggregator correctly", async function(){
            const response = await fundMe.priceFeed();
            assert.equal(response,mockV3Aggregator.address);
        });
    });

    describe("fund", function(){
        it("Fails if less eth is spent", async function(){
            await expect(fundMe.fund()).to.be.revertedWith("ETH spent is less than minimum required");
        });

        it("updated the funded data structure", async function(){
            await fundMe.fund({value: sendValue});
            const response=await fundMe.addressToAmountFunded(deployer);
            assert.equal(response.toString(), sendValue.toString());
        });
        
        it("adds funder to the funders array", async function(){
            await fundMe.fund({value: sendValue});
            const response=await fundMe.funders(0);
            assert.equal(response,deployer);
        });
    });
    
    describe("withdraw", function(){
        beforeEach(async function(){
            await fundMe.fund({value: sendValue});
        });

        it("withdraws all balance to a single fuunder", async function(){
            // Arrange
            const startDeployerBalance=await ethers.provider.getBalance(deployer);
            const startFundMeBalance=await ethers.provider.getBalance(fundMe.address);

            // Act
            const transactionResponse=await fundMe.withdraw();
            const transactionReciept=await transactionResponse.wait(1);
                // apply breakpoint here and use debugger to see the tx reciept
                // use .mul  .add   as eth wei is represented in big numbers
            const {effectiveGasPrice,gasUsed} = transactionReciept;
            const gasCost=effectiveGasPrice.mul(gasUsed);

            const endingDeployerBalance=await ethers.provider.getBalance(deployer);
            const endingFundMeBalance=await ethers.provider.getBalance(fundMe.address);

            // Assert
            assert.equal(endingFundMeBalance,0);
            assert.equal(startDeployerBalance.add(startFundMeBalance).toString(),
                    endingDeployerBalance.sub(startFundMeBalance).toString());
        });
        
        it("allows withdrawl from multiple funders", async function(){
            // Arrange
            const accounts=ethers.getSigners();
            // 0th account is of deployer
            for(let i=1;i<6;i++){
                const connectedAccount=await fundMe.connect(accounts[i]);
                connectedAccount.fund({value: sendValue});
            }
            const startDeployerBalance=await ethers.provider.getBalance(deployer);

            // Act
            const transactionResponse=await fundMe.withdraw();
            const ca=await fundMe.connect(accounts[1]);
            ca.fund({value: sendValue});
            const startFundMeBalance=await ethers.provider.getBalance(fundMe.address);
            const transactionReciept=await transactionResponse.wait(1);
            const {effectiveGasPrice,gasUsed} = transactionReciept;
            const gasCost=effectiveGasPrice.mul(gasUsed);

            const endingDeployerBalance=await ethers.provider.getBalance(deployer);
            const endingFundMeBalance=await ethers.providers.getBalance(fundMe.address);

            // Assert
            assert(endingFundMeBalance,0);
            assert(startDeployerBalance.add(startFundMeBalance).toString(),
                    endingDeployerBalance.add(gasCost).toString());
        });

        // it("does denies non-owners to withdraw", async function(){
        //     const attacker=ethers.providers.getSigned
        // });
    });
})