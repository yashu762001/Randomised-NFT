const developmentChains = ["hardhat", "localhost"];
const decimals = 8;
const INITIAL_ANSWER = 200000000000;

const { ethers } = require("hardhat");

const networkConfig = {
  4: {
    name: "rinkeby",
    vrfCoordinatorV2: "0x6168499c0cFfCaCD319c818142124B7A15E857ab",
    mintFees: ethers.utils.parseEther("0.01"),
    gasLane:
      "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc",
    subscriptionId: "7550",
    callbackGasLimit: "500000",
    interval: "30",
  },

  31337: {
    name: "hardhat",
    mintFees: ethers.utils.parseEther("0.01"),
    gasLane:
      "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc",
    callbackGasLimit: "500000",
    interval: "30",
  },
};

module.exports = {
  developmentChains,
  networkConfig,
};
