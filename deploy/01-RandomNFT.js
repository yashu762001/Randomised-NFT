const { network, ethers } = require("hardhat");
const {
  developmentChains,
  networkConfig,
} = require("../helper-hardhat-config");
const { verify } = require("../utils/verify");
const { storeImages, storeJSONToPinata } = require("../utils/uploadToPinata");

const imagesLocation = "./images/randomNft";

const metaDataTemplate = {
  name: "",
  description: "",
  image: "",
  attributes: [
    {
      color: "white",
    },

    {
      height: "165cm",
    },
  ],
};

const description = [
  "Olivia in Car",
  "Olivia at Awards",
  "Olivia having fun at Disney",
  "OLivia Resting",
  "OLivia Graduated from High School",
];

module.exports = async function ({ getNamedAccounts, deployments }) {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = network.config.chainId;
  let vrfCoordinatorV2address;
  let subscriptionId;
  const gasLane = networkConfig[chainId]["gasLane"];
  const callbackGasLimit = networkConfig[chainId]["callbackGasLimit"];
  const mintFees = networkConfig[chainId]["mintFees"];

  let tokenuris = [
    "ipfs://QmVo3HZ2SvA8JjT4VCynZ2yBK8oZUzVf7WcSuwELYxuqcN",
    "ipfs://QmV8gS53FVzEtS1Q95jxqsXaAeCSU8rWsbyN7dN7Ccvt6C",
    "ipfs://Qmek8n7XAj49DphqWMGD5okLFkz9boPWtr2V5ZsdVywShj",
    "ipfs://QmeqJy974NubqbvG1QHP8mNhmgjDq7ebdEBuX5ZJQaDrjT",
    "ipfs://Qme5BskHM1TvbQfQgPBFBnqj4iT6RtUuNijKnSMjHxM3dL",
  ];

  // get ipfs nodes of all images :

  if (developmentChains.includes(network.name)) {
    const vrfCoordinatorV2Mock = await ethers.getContract(
      "VRFCoordinatorV2Mock"
    );
    vrfCoordinatorV2address = vrfCoordinatorV2Mock.address;

    const tx = await vrfCoordinatorV2Mock.createSubscription();
    const txReceipt = await tx.wait(1);
    subscriptionId = txReceipt.events[0].args.subId;
  } else {
    vrfCoordinatorV2address = networkConfig[chainId]["vrfCoordinatorV2"];
    subscriptionId = networkConfig[chainId]["subscriptionId"];
  }

  if (process.env.UPLOAD_TO_PINATA == "true") {
    tokenuris = await handleTokenUris();
    console.log(tokenuris);
  }

  const args = [
    vrfCoordinatorV2address,
    subscriptionId,
    gasLane,
    callbackGasLimit,
    mintFees,
    tokenuris,
  ];

  const randomNft = await deploy("RandomIPFSNFT", {
    from: deployer,
    args: args,
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1,
  });
  log(`Deployed at ${randomNft.address}`);
  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    await verify(randomNft.address, args);
  }
};

async function handleTokenUris() {
  tokenuris = [];
  const { responses, files } = await storeImages(imagesLocation);

  for (index in responses) {
    const tokenMetaData = { ...metaDataTemplate };
    tokenMetaData.name = files[index].replace(".png", "");
    tokenMetaData.description = description[index];
    tokenMetaData.image = `ipfs://${responses[index].IpfsHash}`;

    console.log(`Uploading ${tokenMetaData.name} Meta Data to IPFS`);

    // Storing JSON to Pinata
    console.log(tokenMetaData);
    const metaDataResponse = await storeJSONToPinata(tokenMetaData);
    tokenuris.push(`ipfs://${metaDataResponse.IpfsHash}`);
  }

  console.log("Token URI'S uploaded!!!!");
  return tokenuris;
}

module.exports.tags = ["all", "randomipfs", "main"];
