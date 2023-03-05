// SPDX-License-Identifier: MIT

// pragma
pragma solidity ^0.8.8;


// imports
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "./PriceConverter.sol";

import "hardhat/console.sol";

// error codes
error FundMe__NotOwner();


// interfaces
// libraries


// contracts
/**
 * @title A contract for crowd funding
 * @author Aditya Bijapurkar
 * @notice Demo of a funding contract
 * @dev This implements pricefeed as a library
 */
contract FundMe {
    // *type declarations
    using PriceConverter for uint256;

    // *state variables
    mapping(address => uint256) public addressToAmountFunded;
    address[] public funders;

    // Could we make this constant?  /* hint: no! We should make it immutable! */
    address public /* immutable */ i_owner;
    uint256 public constant MINIMUM_USD = 50 * 10 ** 18;
    AggregatorV3Interface public priceFeed;
    
    // *events

    // *modifiers
    modifier onlyOwner {
        // require(msg.sender == owner);
        if (msg.sender != i_owner) revert FundMe__NotOwner();
        _;
    }


    // *Functions order
    //// constructor 
    //// recieve
    //// fallback
    //// external
    //// public
    //// internal
    //// private
    //// pure/view

    constructor(address priceFeedAddress) {
        i_owner = msg.sender;
        priceFeed=AggregatorV3Interface(priceFeedAddress);
    }

    receive() external payable {
        fund();
    }

    fallback() external payable {
        fund();
    }

    function fund() public payable {

//this prints zero even
        console.log(msg.value.getConversionRate(priceFeed));
        console.log(MINIMUM_USD);
        require(
            msg.value.getConversionRate(priceFeed) >= MINIMUM_USD,
            "Didnt send enough"
        );
        funders.push(msg.sender);
        addressToAmountFunded[msg.sender] = msg.value;
    }

    function getVersion() public view returns (uint256){
        // ETH/USD price feed address of Goerli Network.
        // AggregatorV3Interface priceFeed = AggregatorV3Interface(0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e);
        return priceFeed.version();
    }
    
    
    
    function withdraw() public onlyOwner {
        for (uint256 funderIndex=0; funderIndex < funders.length; funderIndex++){
            address funder = funders[funderIndex];
            addressToAmountFunded[funder] = 0;
        }
        funders = new address[](0);
        console.log("FundMe balance is %s", address(this).balance);
        // // transfer
        // payable(msg.sender).transfer(address(this).balance);
        // // send
        // bool sendSuccess = payable(msg.sender).send(address(this).balance);
        // require(sendSuccess, "Send failed");
        // call
        (bool callSuccess, ) = payable(msg.sender).call{value: address(this).balance}("");
        require(callSuccess, "Call failed");
        
    }


    
    // Explainer from: https://solidity-by-example.org/fallback/
    // Ether is sent to contract
    //      is msg.data empty?
    //          /   \ 
    //         yes  no
    //         /     \
    //    receive()?  fallback() 
    //     /   \ 
    //   yes   no
    //  /        \
    //receive()  fallback()

}