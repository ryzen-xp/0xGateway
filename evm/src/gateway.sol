// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IStarknetCore {
    /**
     * @notice Consumes a message that was sent from an L2 contract
     * @param fromAddress The L2 contract address that sent the message
     * @param payload The message payload
     */
    function consumeMessageFromL2(uint256 fromAddress, uint256[] calldata payload) 
        external 
        returns (bytes32);
}

contract Gateway {
    IStarknetCore public immutable starknetCore;
    uint256 public immutable L2_GATEWAY_ADDRESS;

    struct UserInfo {
        bytes32 usernameHash;
        address userAddress;
        bool active;
    }

    struct Wallet {
        uint256 chainId;
        uint256 addressOnChain;
        uint256 memo;
        uint256 tag;
        uint256 updatedAt;
    }

    // Storage
    mapping(bytes32 => UserInfo) public userInfos;
    mapping(bytes32 => uint256[]) public userChainIds;
    mapping(bytes32 => mapping(uint256 => Wallet)) public userWallets;

    // Events
    event UserInfoSynced(
        bytes32 indexed usernameHash, 
        address userAddress, 
        bool active,
        uint256 timestamp
    );
    
    event WalletSynced(
        bytes32 indexed usernameHash, 
        uint256 chainId, 
        uint256 addressOnChain,
        uint256 updatedAt,
        uint256 timestamp
    );

    event WalletRemoved(
        bytes32 indexed usernameHash,
        uint256 chainId,
        uint256 timestamp
    );

    constructor(address _starknetCore, uint256 _l2GatewayAddress) {
        require(_starknetCore != address(0), "Invalid Starknet Core address");
        require(_l2GatewayAddress != 0, "Invalid L2 Gateway address");
        
        starknetCore = IStarknetCore(_starknetCore);
        L2_GATEWAY_ADDRESS = _l2GatewayAddress;
    }

    /**
     * @notice Receives and processes messages from L2
     * @dev This single function handles all message types from L2
     * @param payload Message payload from L2 with message type as first element
     */
    function receiveFromL2(uint256[] calldata payload) external {
        require(payload.length >= 1, "Empty payload");

        // Consume the message from L2 to verify it's authentic
        starknetCore.consumeMessageFromL2(L2_GATEWAY_ADDRESS, payload);

        uint256 messageType = payload[0];

        if (messageType == 0) {
            // User info message
            _handleUserInfo(payload);
        } else if (messageType == 1) {
            // Wallet added/updated message
            _handleWalletUpdate(payload);
        } else if (messageType == 2) {
            // Wallet removed message
            _handleWalletRemoval(payload);
        } else {
            revert("Unknown message type");
        }
    }

    /**
     * @notice Handles user info updates from L2
     * @param payload [0]=messageType, [1]=usernameHash, [2]=userAddress, [3]=active
     */
    function _handleUserInfo(uint256[] calldata payload) internal {
        require(payload.length >= 4, "Invalid user info payload");

        bytes32 usernameHash = bytes32(payload[1]);
        address userAddr = address(uint160(payload[2]));
        bool active = payload[3] != 0;

        userInfos[usernameHash] = UserInfo({
            usernameHash: usernameHash,
            userAddress: userAddr,
            active: active
        });

        emit UserInfoSynced(usernameHash, userAddr, active, block.timestamp);
    }

    /**
     * @notice Handles wallet additions/updates from L2
     * @param payload [0]=messageType, [1]=usernameHash, [2]=chainId, [3]=address, 
     *                [4]=memo, [5]=tag, [6]=updatedAt
     */
    function _handleWalletUpdate(uint256[] calldata payload) internal {
        require(payload.length >= 7, "Invalid wallet payload");

        bytes32 usernameHash = bytes32(payload[1]);
        uint256 chainId = payload[2];

        Wallet memory wallet = Wallet({
            chainId: chainId,
            addressOnChain: payload[3],
            memo: payload[4],
            tag: payload[5],
            updatedAt: payload[6]
        });

        // Store wallet
        userWallets[usernameHash][chainId] = wallet;

        // Add chainId if not already present
        if (!_chainIdExists(usernameHash, chainId)) {
            userChainIds[usernameHash].push(chainId);
        }

        emit WalletSynced(
            usernameHash, 
            chainId, 
            wallet.addressOnChain, 
            wallet.updatedAt,
            block.timestamp
        );
    }

    /**
     * @notice Handles wallet removals from L2
     * @param payload [0]=messageType, [1]=usernameHash, [2]=chainId
     */
    function _handleWalletRemoval(uint256[] calldata payload) internal {
        require(payload.length >= 3, "Invalid removal payload");

        bytes32 usernameHash = bytes32(payload[1]);
        uint256 chainId = payload[2];

        // Delete the wallet
        delete userWallets[usernameHash][chainId];

        // Remove from chainIds array
        uint256[] storage chains = userChainIds[usernameHash];
        for (uint256 i = 0; i < chains.length; i++) {
            if (chains[i] == chainId) {
                // Move last element to this position and pop
                chains[i] = chains[chains.length - 1];
                chains.pop();
                break;
            }
        }

        emit WalletRemoved(usernameHash, chainId, block.timestamp);
    }

    // View functions
    function getUserInfo(bytes32 usernameHash) 
        external 
        view 
        returns (UserInfo memory) 
    {
        return userInfos[usernameHash];
    }

    function getWallet(bytes32 usernameHash, uint256 chainId) 
        external 
        view 
        returns (Wallet memory) 
    {
        return userWallets[usernameHash][chainId];
    }

    function getUserChainIds(bytes32 usernameHash) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return userChainIds[usernameHash];
    }

    function getAllUserWallets(bytes32 usernameHash) 
        external 
        view 
        returns (Wallet[] memory wallets) 
    {
        uint256[] memory chains = userChainIds[usernameHash];
        wallets = new Wallet[](chains.length);
        
        for (uint256 i = 0; i < chains.length; i++) {
            wallets[i] = userWallets[usernameHash][chains[i]];
        }
    }

    function isUserActive(bytes32 usernameHash) 
        external 
        view 
        returns (bool) 
    {
        return userInfos[usernameHash].active;
    }

    // Internal helper
    function _chainIdExists(bytes32 usernameHash, uint256 chainId) 
        internal 
        view 
        returns (bool) 
    {
        uint256[] memory chains = userChainIds[usernameHash];
        for (uint256 i = 0; i < chains.length; i++) {
            if (chains[i] == chainId) {
                return true;
            }
        }
        return false;
    }
}