// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title IArcCaffeine
 * @dev Interface for the main ArcCaffeine contract.
 */
interface IArcCaffeine {
    function usernames(address user) external view returns (string memory);
    function addresses(string memory username) external view returns (address);
}

/**
 * @title CreatorSupporterBadge
 * @dev Soulbound ERC-721 for ArcCaffeine creator supporters.
 *      - Non-transferable (soulbound)
 *      - One badge per (supporter, creator) pair
 *      - Shows creator username on the NFT
 */
contract CreatorSupporterBadge is ERC721, Ownable {
    uint256 private _tokenIdCounter;

    IArcCaffeine public arcCaffeine;

    // TokenId => Creator address
    mapping(uint256 => address) public tokenCreator;

    // Supporter => Creator => Has claimed
    mapping(address => mapping(address => bool)) public hasClaimed;

    // Supporter => Creator => TokenId
    mapping(address => mapping(address => uint256)) public badgeTokenId;

    event BadgeClaimed(address indexed supporter, address indexed creator, uint256 tokenId, string creatorUsername);

    constructor(address _arcCaffeine) ERC721("ArcCaffeine Supporter", "ARCSUP") Ownable(msg.sender) {
        arcCaffeine = IArcCaffeine(_arcCaffeine);
    }

    /**
     * @dev Claim a supporter badge for a specific creator.
     * @param creatorUsername The username of the creator to claim badge for.
     */
    function claim(string memory creatorUsername) external {
        address creator = arcCaffeine.addresses(creatorUsername);
        require(creator != address(0), "Creator not found");
        require(!hasClaimed[msg.sender][creator], "Already claimed for this creator");

        hasClaimed[msg.sender][creator] = true;
        _tokenIdCounter++;
        uint256 newTokenId = _tokenIdCounter;

        tokenCreator[newTokenId] = creator;
        badgeTokenId[msg.sender][creator] = newTokenId;

        _safeMint(msg.sender, newTokenId);

        emit BadgeClaimed(msg.sender, creator, newTokenId, creatorUsername);
    }

    /**
     * @dev Check if a supporter can claim for a creator.
     */
    function canClaim(address supporter, address creator) external view returns (bool) {
        return !hasClaimed[supporter][creator];
    }

    /**
     * @dev Override to make token soulbound.
     */
    function _update(address to, uint256 tokenId, address auth) internal override returns (address) {
        address from = _ownerOf(tokenId);
        if (from != address(0) && to != address(0)) {
            revert("Soulbound: Transfer not allowed");
        }
        return super._update(to, tokenId, auth);
    }

    /**
     * @dev Returns on-chain SVG metadata with Arc theme.
     */
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);

        address creator = tokenCreator[tokenId];
        string memory username = arcCaffeine.usernames(creator);

        return string(
            abi.encodePacked(
                'data:application/json;base64,',
                _base64Encode(
                    bytes(
                        string(
                            abi.encodePacked(
                                '{"name":"Supporter of @',
                                username,
                                '","description":"This soulbound badge proves you supported @',
                                username,
                                ' on ArcCaffeine. Built on Arc Network.","image":"data:image/svg+xml;base64,',
                                _base64Encode(bytes(_getSVG(username))),
                                '","attributes":[{"trait_type":"Creator","value":"@',
                                username,
                                '"},{"trait_type":"Network","value":"Arc Testnet"},{"trait_type":"Type","value":"Soulbound"}]}'
                            )
                        )
                    )
                )
            )
        );
    }

    /**
     * @dev Generate Arc-themed SVG with creator username.
     */
    function _getSVG(string memory username) internal pure returns (string memory) {
        return string(
            abi.encodePacked(
                '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400">',
                '<defs>',
                '<linearGradient id="border" x1="0%" y1="0%" x2="100%" y2="100%">',
                '<stop offset="0%" style="stop-color:#a855f7"/>',
                '<stop offset="100%" style="stop-color:#f97316"/>',
                '</linearGradient>',
                '<linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">',
                '<stop offset="0%" style="stop-color:#1a1a2e"/>',
                '<stop offset="100%" style="stop-color:#16213e"/>',
                '</linearGradient>',
                '</defs>',
                '<rect width="400" height="400" rx="24" fill="url(#border)"/>',
                '<rect x="8" y="8" width="384" height="384" rx="20" fill="url(#bg)"/>',
                _getPattern(),
                _getCoffeeIcon(),
                '<text x="200" y="280" font-size="32" font-family="Arial,sans-serif" font-weight="bold" fill="white" text-anchor="middle">SUPPORTER</text>',
                '<text x="200" y="320" font-size="22" font-family="Arial,sans-serif" fill="#a855f7" text-anchor="middle">@',
                username,
                '</text>',
                '<text x="200" y="370" font-size="14" font-family="Arial,sans-serif" fill="rgba(255,255,255,0.5)" text-anchor="middle">ArcCaffeine on Arc Network</text>',
                '</svg>'
            )
        );
    }

    /**
     * @dev Blockchain/circuit pattern for background.
     */
    function _getPattern() internal pure returns (string memory) {
        return '<g opacity="0.1" stroke="#a855f7" stroke-width="1" fill="none">'
               '<circle cx="60" cy="60" r="20"/><circle cx="60" cy="60" r="8"/>'
               '<circle cx="340" cy="60" r="20"/><circle cx="340" cy="60" r="8"/>'
               '<line x1="80" y1="60" x2="320" y2="60"/>'
               '<line x1="60" y1="80" x2="60" y2="120"/>'
               '<line x1="340" y1="80" x2="340" y2="120"/>'
               '<rect x="40" y="340" width="40" height="40" rx="4"/>'
               '<rect x="320" y="340" width="40" height="40" rx="4"/>'
               '<line x1="80" y1="360" x2="320" y2="360"/>'
               '</g>';
    }

    /**
     * @dev Coffee cup icon.
     */
    function _getCoffeeIcon() internal pure returns (string memory) {
        return '<g transform="translate(140,80)">'
               '<path d="M20 40 L20 100 Q20 120 40 120 L80 120 Q100 120 100 100 L100 40 Z" fill="#d4a574" stroke="#b8956a" stroke-width="2"/>'
               '<path d="M100 50 Q130 50 130 75 Q130 100 100 100" fill="none" stroke="#d4a574" stroke-width="8" stroke-linecap="round"/>'
               '<ellipse cx="60" cy="40" rx="45" ry="10" fill="#8b5a2b"/>'
               '<path d="M40 20 Q50 0 60 20" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="3" stroke-linecap="round"/>'
               '<path d="M60 15 Q70 -5 80 15" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="3" stroke-linecap="round"/>'
               '</g>';
    }

    function _toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) return "0";
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) { digits++; temp /= 10; }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }

    function _base64Encode(bytes memory data) internal pure returns (string memory) {
        string memory TABLE = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
        if (data.length == 0) return "";
        string memory result = new string(4 * ((data.length + 2) / 3));
        bytes memory table = bytes(TABLE);
        bytes memory resultBytes = bytes(result);
        uint256 i = 0;
        uint256 j = 0;
        for (; i + 3 <= data.length; i += 3) {
            uint256 a = uint8(data[i]);
            uint256 b = uint8(data[i + 1]);
            uint256 c = uint8(data[i + 2]);
            resultBytes[j++] = table[a >> 2];
            resultBytes[j++] = table[((a & 0x03) << 4) | (b >> 4)];
            resultBytes[j++] = table[((b & 0x0f) << 2) | (c >> 6)];
            resultBytes[j++] = table[c & 0x3f];
        }
        if (data.length % 3 == 1) {
            uint256 a = uint8(data[i]);
            resultBytes[j++] = table[a >> 2];
            resultBytes[j++] = table[(a & 0x03) << 4];
            resultBytes[j++] = "=";
            resultBytes[j++] = "=";
        } else if (data.length % 3 == 2) {
            uint256 a = uint8(data[i]);
            uint256 b = uint8(data[i + 1]);
            resultBytes[j++] = table[a >> 2];
            resultBytes[j++] = table[((a & 0x03) << 4) | (b >> 4)];
            resultBytes[j++] = table[(b & 0x0f) << 2];
            resultBytes[j++] = "=";
        }
        return result;
    }
}
