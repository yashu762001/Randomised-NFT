// SPDX-License-Identifier: MIT

pragma solidity ^0.8.5;

import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract RandomIPFSNFT is VRFConsumerBaseV2, ERC721URIStorage {
    // when we mint an NFT a random number will be generated. Using that number we will get a Random NFT of OLivia Sanabia.

    VRFCoordinatorV2Interface private immutable i_COORDINATOR;
    uint64 private s_subscriptionId;
    bytes32 private s_gasLane;
    uint32 private s_callBackGasLimit;
    uint16 private constant REQUEST_CONFIRMATIONS = 3;
    uint32 private NUM_WORDS = 1;

    mapping(uint256 => address) requestIdtoAddress;
    string[5] internal OliviaTokenURIS; /*= [
    //     "ipfs://bafybeibje6aple2galwbs2wpqelshwzpy6kni3pvc4c5gkhb6haz3lfmkm.ipfs.localhost:8080/?filename=oli1.png",
    //     "ipfs://bafybeiat7eqnk6sp4g252cktkarq33qpzhnzt76fpelfixsoikxrk3qwdq.ipfs.localhost:8080/?filename=oli2.png",
    //     "ipfs://bafybeif5zcg5mfe44bbtzzd5n4o32jplczzl3nzd6hcrrbzb2ae6c56dfa.ipfs.localhost:8080/?filename=oli3.png",
    //     "ipfs://bafybeihvacpsyc2kkim544bvtcl3sfjonsgizooetco5zbw4dzhbv2h3ci.ipfs.localhost:8080/?filename=oli4.png",
    //     "ipfs://bafybeiegq7mb2hnjqgu6fglz6rvxe3b2spzufrp2rkfs3ifznlxhjgi24q.ipfs.localhost:8080/?filename=oli5.png"
    // ];*/

    uint256 public tokenCounter;
    uint256 public s_mintFee;
    address owner;

    event NFTRequested(uint256 requestId, address requester);
    event NFTMinted(Image image, address minter);

    enum Image {
        OLI_CAR,
        OLI_AWARDS,
        OLI_DISNEY,
        OLI_RESTING,
        OLI_GRADUATE
    }

    constructor(
        address vrfCoordinatorV2,
        uint64 subscriptionId,
        bytes32 gasLane,
        uint32 callBackGasLimit,
        uint256 mintFee,
        string[5] memory tokenUri
    ) VRFConsumerBaseV2(vrfCoordinatorV2) ERC721("Random IPFS\
    NFT", "RIN") {
        i_COORDINATOR = VRFCoordinatorV2Interface(vrfCoordinatorV2);
        s_subscriptionId = subscriptionId;
        s_gasLane = gasLane;
        s_callBackGasLimit = callBackGasLimit;
        s_mintFee = mintFee;
        owner = msg.sender;
        OliviaTokenURIS = tokenUri;
    }

    function requestNft() public payable returns (uint256 requestId) {
        require(msg.value >= s_mintFee, "Cannot Mint due to insufficient fees");
        requestId = i_COORDINATOR.requestRandomWords(
            s_gasLane,
            s_subscriptionId,
            REQUEST_CONFIRMATIONS,
            s_callBackGasLimit,
            NUM_WORDS
        );

        requestIdtoAddress[requestId] = msg.sender;

        emit NFTRequested(requestId, msg.sender);
    }

    function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords)
        internal
        override
    {
        address nftOwner = requestIdtoAddress[requestId];
        uint256 randomNumber = randomWords[0] % 100;
        Image randomNft = getImage(randomNumber);
        _safeMint(nftOwner, tokenCounter);
        _setTokenURI(tokenCounter, OliviaTokenURIS[uint256(randomNft)]);
        tokenCounter += 1;

        emit NFTMinted(randomNft, nftOwner);
    }

    function getImage(uint256 randomNumber) public pure returns (Image) {
        uint256[5] memory arr = getChanceArray();
        uint256 prev = 0;
        for (uint256 i = 0; i < arr.length; i++) {
            if (randomNumber > prev && randomNumber <= arr[i]) {
                return Image(i);
            }

            prev = arr[i];
        }
    }

    function getChanceArray() public pure returns (uint256[5] memory) {
        uint256[5] memory arr;
        arr[0] = 10;
        arr[1] = 35;
        arr[2] = 67;
        arr[3] = 81;
        arr[4] = 100;

        return arr;
    }

    function withdraw() public returns (bool) {
        require(owner == msg.sender, "Not have the permission to withdraw");
        (bool succ, ) = payable(owner).call{value: address(this).balance}("");
        return succ;
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override
        returns (string memory)
    {
        return OliviaTokenURIS[tokenId];
    }
}
