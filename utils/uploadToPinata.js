const pinataSDK = require("@pinata/sdk");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

const pinata = pinataSDK(
  process.env.PINATA_API_KEY,
  process.env.PINATA_SECRET_API_KEY
);

async function storeImages(imageFilePath) {
  console.log("Uploading To IPFS!!!!!");
  const fullimagesPath = path.resolve(imageFilePath);
  const files = fs.readdirSync(fullimagesPath);
  let responses = [];
  for (index in files) {
    console.log(`Uploading ${files[index]}`);
    const readableStream = fs.createReadStream(
      `${fullimagesPath}/${files[index]}`
    );

    try {
      const resp = await pinata.pinFileToIPFS(readableStream);
      responses.push(resp);
    } catch (err) {
      console.log(err);
    }
  }
  console.log(responses);
  return { responses, files };
}

async function storeJSONToPinata(metaData) {
  try {
    const resp = await pinata.pinJSONToIPFS(metaData);
    return resp;
  } catch (err) {
    console.log(err);
  }
}

module.exports = {
  storeImages,
  storeJSONToPinata,
};
