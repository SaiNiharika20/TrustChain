// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title TrustChain
 * @notice Supply Chain Fraud Detection & Tamper-Proof Audit Trail Smart Contract
 * @dev Stores cryptographic hashes of verified supply chain transactions on-chain.
 * Raw transaction records are kept in the off-chain database (e.g. MySQL).
 * Hashes are compared to ensure complete data integrity and detect tampering.
 */
contract TrustChain {
    // Contract owner / deployer (e.g., Supply Chain Authority or consortium admin)
    address public owner;

    struct Record {
        string transactionId;
        bytes32 dataHash;
        uint256 timestamp;
        string predictionStatus; // "GENUINE", "FRAUD", "FLAGGED"
        address registeredBy;
        bool exists;
    }

    // Mapping from transaction ID to its on-chain Record
    mapping(string => Record) private transactions;

    // Array of all registered transaction IDs for auditing
    string[] private transactionIds;

    // Events emitted for transparent blockchain tracking
    event TransactionStored(
        string indexed transactionId,
        bytes32 indexed dataHash,
        uint256 timestamp,
        string predictionStatus,
        address registeredBy
    );

    event TransactionVerified(
        string indexed transactionId,
        bytes32 submittedHash,
        bool isVerified,
        uint256 timestamp
    );

    event OwnershipTransferred(
        address indexed previousOwner,
        address indexed newOwner
    );

    modifier onlyOwner() {
        require(msg.sender == owner, "TrustChain: caller is not the owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    /**
     * @notice Store a cryptographic hash of a verified supply-chain transaction
     * @param _transactionId Unique business identifier (e.g. "TX-2026-0042")
     * @param _dataHash Keccak256 or SHA256 cryptographic hash of canonical record fields
     * @param _predictionStatus ML classification result ("GENUINE" or "FRAUD")
     */
    function storeTransactionHash(
        string calldata _transactionId,
        bytes32 _dataHash,
        string calldata _predictionStatus
    ) external {
        require(bytes(_transactionId).length > 0, "TrustChain: invalid transactionId");
        require(_dataHash != bytes32(0), "TrustChain: invalid hash");
        require(!transactions[_transactionId].exists, "TrustChain: transaction hash already registered");

        transactions[_transactionId] = Record({
            transactionId: _transactionId,
            dataHash: _dataHash,
            timestamp: block.timestamp,
            predictionStatus: _predictionStatus,
            registeredBy: msg.sender,
            exists: true
        });

        transactionIds.push(_transactionId);

        emit TransactionStored(
            _transactionId,
            _dataHash,
            block.timestamp,
            _predictionStatus,
            msg.sender
        );
    }

    /**
     * @notice Retrieve stored on-chain transaction metadata
     * @param _transactionId Transaction identifier
     */
    function getTransaction(string calldata _transactionId)
        external
        view
        returns (
            string memory transactionId,
            bytes32 dataHash,
            uint256 timestamp,
            string memory predictionStatus,
            address registeredBy,
            bool exists
        )
    {
        Record memory record = transactions[_transactionId];
        return (
            record.transactionId,
            record.dataHash,
            record.timestamp,
            record.predictionStatus,
            record.registeredBy,
            record.exists
        );
    }

    /**
     * @notice Verify whether a candidate data hash matches the immutable blockchain record
     * @param _transactionId Transaction identifier
     * @param _candidateHash Hash computed from current database values
     * @return isValid True if candidate hash matches blockchain record exactly, false if tampered or missing
     */
    function verifyTransaction(
        string calldata _transactionId,
        bytes32 _candidateHash
    ) external view returns (bool isValid) {
        Record memory record = transactions[_transactionId];
        if (!record.exists) {
            return false;
        }
        return (record.dataHash == _candidateHash);
    }

    /**
     * @notice Get total count of registered records on-chain
     */
    function getRecordCount() external view returns (uint256) {
        return transactionIds.length;
    }

    /**
     * @notice Transfer contract ownership
     */
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "TrustChain: zero address");
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }
}
