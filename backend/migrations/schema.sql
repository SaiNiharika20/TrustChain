-- ==========================================================
-- TrustChain Relational Database Schema (MySQL 8.0+)
-- Supply Chain Fraud Detection Using Machine Learning & Blockchain
-- ==========================================================

CREATE DATABASE IF NOT EXISTS `trustchain_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `trustchain_db`;

-- 1. Stakeholder Users Table
CREATE TABLE IF NOT EXISTS `users` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `username` VARCHAR(80) NOT NULL UNIQUE,
    `email` VARCHAR(120) NOT NULL UNIQUE,
    `password_hash` VARCHAR(255) NOT NULL,
    `role` ENUM('SUPPLIER', 'MANUFACTURER', 'DISTRIBUTOR', 'RETAILER', 'CUSTOMER', 'AUDITOR') NOT NULL DEFAULT 'AUDITOR',
    `organization` VARCHAR(150) NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_users_role` (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Supply Chain Transactions Table (Off-Chain Canonical Record)
CREATE TABLE IF NOT EXISTS `transactions` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `transaction_id` VARCHAR(64) NOT NULL UNIQUE,
    `product_id` VARCHAR(64) NOT NULL,
    `quantity` DECIMAL(14, 2) NOT NULL,
    `location` VARCHAR(128) NOT NULL,
    `timestamp` VARCHAR(64) NOT NULL,
    `supplier_details` VARCHAR(255) NOT NULL,
    `manufacturer` VARCHAR(255) DEFAULT '',
    `distributor` VARCHAR(255) DEFAULT '',
    `retailer` VARCHAR(255) DEFAULT '',
    `price` DECIMAL(14, 2) DEFAULT 0.00,
    `risk_score` DECIMAL(6, 4) DEFAULT 0.0000,
    `fraud_label` TINYINT DEFAULT NULL COMMENT '0=Genuine, 1=Fraudulent, NULL=Unlabeled',
    `is_tampered` BOOLEAN DEFAULT FALSE,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_tx_product` (`product_id`),
    INDEX `idx_tx_supplier` (`supplier_details`),
    INDEX `idx_tx_location` (`location`),
    INDEX `idx_tx_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Machine Learning Fraud Predictions Table
CREATE TABLE IF NOT EXISTS `fraud_predictions` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `transaction_id` VARCHAR(64) NOT NULL,
    `prediction` ENUM('FRAUD', 'GENUINE') NOT NULL,
    `random_forest_prediction` VARCHAR(16) NOT NULL,
    `isolation_forest_prediction` VARCHAR(16) NOT NULL,
    `xgboost_prediction` VARCHAR(16) NOT NULL,
    `fraud_probability` DECIMAL(6, 4) NOT NULL,
    `risk_level` ENUM('LOW', 'MEDIUM', 'HIGH') NOT NULL,
    `details_json` TEXT NULL,
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_fp_tx_id` (`transaction_id`),
    INDEX `idx_fp_risk` (`risk_level`),
    INDEX `idx_fp_pred` (`prediction`),
    CONSTRAINT `fk_fp_transaction` FOREIGN KEY (`transaction_id`) REFERENCES `transactions` (`transaction_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Blockchain Integrity Records Table (Ethereum EVM Contract Links)
CREATE TABLE IF NOT EXISTS `blockchain_records` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `transaction_id` VARCHAR(64) NOT NULL UNIQUE,
    `data_hash` VARCHAR(128) NOT NULL COMMENT 'Canonical SHA-256 digest of off-chain record',
    `blockchain_tx_hash` VARCHAR(128) NOT NULL COMMENT 'Ethereum transaction receipt hash',
    `block_number` BIGINT NOT NULL,
    `contract_address` VARCHAR(128) NOT NULL,
    `verification_status` ENUM('VERIFIED', 'TAMPER DETECTED', 'PENDING', 'NOT REGISTERED') NOT NULL DEFAULT 'VERIFIED',
    `network` VARCHAR(64) DEFAULT 'Ethereum Sepolia Testnet',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_bc_tx_id` (`transaction_id`),
    INDEX `idx_bc_status` (`verification_status`),
    CONSTRAINT `fk_bc_transaction` FOREIGN KEY (`transaction_id`) REFERENCES `transactions` (`transaction_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Security & Operational Alerts Table
CREATE TABLE IF NOT EXISTS `alerts` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `transaction_id` VARCHAR(64) NOT NULL,
    `alert_type` VARCHAR(64) NOT NULL,
    `risk_level` ENUM('LOW', 'MEDIUM', 'HIGH') NOT NULL,
    `message` TEXT NOT NULL,
    `status` ENUM('UNREAD', 'READ', 'RESOLVED', 'ACTIVE') NOT NULL DEFAULT 'UNREAD',
    `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX `idx_alert_tx_id` (`transaction_id`),
    INDEX `idx_alert_status` (`status`),
    INDEX `idx_alert_risk` (`risk_level`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
