// SPDX-License-Identifier: MIT

pragma solidity ^0.8.5;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract BasicNFT is ERC721 {
    uint256 private tokenCounter;
    string public constant TOKEN_URI =
        "ipfs://bafybeigethuxibqnck6zhtno6ifl6o3xqnftl2einlb5jnfnnz6r2h46re.ipfs.localhost:8080/?filename=olivia1.json";

    constructor() ERC721("Olivia", "OLI") {
        tokenCounter = 0;
    }

    function mintNFT() public returns (uint256) {
        _safeMint(msg.sender, tokenCounter);
        tokenCounter += 1;

        return tokenCounter;
    }

    function getTokenCounter() public returns (uint256) {
        return tokenCounter;
    }

    function tokenURI(
        uint256 /*tokenId*/
    ) public view override returns (string memory) {
        return TOKEN_URI;
    }
}
