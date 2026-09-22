"""
TrustChain Database Models (SQLAlchemy)
Configured for MySQL with automated SQLite fallback for local development.
"""
from datetime import datetime
from flask_sqlalchemy import SQLAlchemy
import hashlib
import json

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(50), default='AUDITOR') # SUPPLIER, MANUFACTURER, DISTRIBUTOR, RETAILER, CUSTOMER, AUDITOR
    organization = db.Column(db.String(150), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "username": self.username,
            "email": self.email,
            "role": self.role,
            "organization": self.organization,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }

class Transaction(db.Model):
    __tablename__ = 'transactions'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    transaction_id = db.Column(db.String(64), unique=True, nullable=False, index=True)
    product_id = db.Column(db.String(64), nullable=False, index=True)
    quantity = db.Column(db.Float, nullable=False)
    location = db.Column(db.String(128), nullable=False)
    timestamp = db.Column(db.String(64), nullable=False)
    supplier_details = db.Column(db.String(255), nullable=False)
    manufacturer = db.Column(db.String(255), nullable=True)
    distributor = db.Column(db.String(255), nullable=True)
    retailer = db.Column(db.String(255), nullable=True)
    price = db.Column(db.Float, nullable=True)
    risk_score = db.Column(db.Float, nullable=True)
    fraud_label = db.Column(db.Integer, nullable=True) # 0=Genuine, 1=Fraud, None=Unlabeled
    is_tampered = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def calculate_canonical_hash(self) -> str:
        """
        Cryptographic SHA-256 hash of canonical business fields.
        Used to record integrity on-chain and detect database tampering.
        """
        canonical_data = {
            "transaction_id": str(self.transaction_id).strip(),
            "product_id": str(self.product_id).strip(),
            "quantity": float(self.quantity),
            "location": str(self.location).strip(),
            "timestamp": str(self.timestamp).strip(),
            "supplier_details": str(self.supplier_details).strip(),
            "price": float(self.price) if self.price is not None else 0.0
        }
        serialized = json.dumps(canonical_data, sort_keys=True)
        return hashlib.sha256(serialized.encode('utf-8')).hexdigest()

    def to_dict(self):
        return {
            "id": str(self.id),
            "transaction_id": self.transaction_id,
            "product_id": self.product_id,
            "quantity": self.quantity,
            "location": self.location,
            "timestamp": self.timestamp,
            "supplier_details": self.supplier_details,
            "manufacturer": self.manufacturer or "",
            "distributor": self.distributor or "",
            "retailer": self.retailer or "",
            "price": self.price or 0.0,
            "risk_score": self.risk_score or 0.0,
            "fraud_label": self.fraud_label,
            "is_tampered": bool(self.is_tampered),
            "canonical_hash": self.calculate_canonical_hash(),
            "created_at": self.created_at.isoformat() if self.created_at else None
        }

class FraudPrediction(db.Model):
    __tablename__ = 'fraud_predictions'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    transaction_id = db.Column(db.String(64), db.ForeignKey('transactions.transaction_id'), nullable=False, index=True)
    prediction = db.Column(db.String(16), nullable=False) # FRAUD / GENUINE
    random_forest_prediction = db.Column(db.String(16), nullable=False)
    isolation_forest_prediction = db.Column(db.String(16), nullable=False)
    xgboost_prediction = db.Column(db.String(16), nullable=False)
    fraud_probability = db.Column(db.Float, nullable=False)
    risk_level = db.Column(db.String(16), nullable=False) # LOW, MEDIUM, HIGH
    details_json = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        details = json.loads(self.details_json) if self.details_json else {}
        return {
            "id": str(self.id),
            "transaction_id": self.transaction_id,
            "prediction": self.prediction,
            "fraud_probability": self.fraud_probability,
            "risk_level": self.risk_level,
            "model_results": {
                "random_forest": {
                    "prediction": self.random_forest_prediction,
                    "probability": details.get("rf_prob", self.fraud_probability),
                    "trees_agreement": details.get("rf_agreement", 0.9)
                },
                "isolation_forest": {
                    "prediction": self.isolation_forest_prediction,
                    "anomaly_score": details.get("if_score", 0.0),
                    "is_outlier": self.isolation_forest_prediction == "ANOMALY"
                },
                "xgboost": {
                    "prediction": self.xgboost_prediction,
                    "probability": details.get("xgb_prob", self.fraud_probability),
                    "confidence": details.get("xgb_conf", 0.88)
                }
            },
            "risk_factors": details.get("risk_factors", []),
            "created_at": self.created_at.isoformat() if self.created_at else None
        }

class BlockchainRecord(db.Model):
    __tablename__ = 'blockchain_records'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    transaction_id = db.Column(db.String(64), db.ForeignKey('transactions.transaction_id'), nullable=False, index=True)
    data_hash = db.Column(db.String(128), nullable=False)
    blockchain_tx_hash = db.Column(db.String(128), nullable=False)
    block_number = db.Column(db.Integer, nullable=False)
    contract_address = db.Column(db.String(128), nullable=False)
    verification_status = db.Column(db.String(32), default='VERIFIED') # VERIFIED, TAMPER DETECTED, PENDING
    network = db.Column(db.String(64), default='Ethereum Testnet')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": str(self.id),
            "transaction_id": self.transaction_id,
            "data_hash": self.data_hash,
            "blockchain_tx_hash": self.blockchain_tx_hash,
            "block_number": self.block_number,
            "contract_address": self.contract_address,
            "verification_status": self.verification_status,
            "network": self.network,
            "timestamp": self.created_at.isoformat() if self.created_at else None,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }

class Alert(db.Model):
    __tablename__ = 'alerts'
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    transaction_id = db.Column(db.String(64), nullable=False, index=True)
    alert_type = db.Column(db.String(64), nullable=False)
    risk_level = db.Column(db.String(16), nullable=False) # LOW, MEDIUM, HIGH
    message = db.Column(db.Text, nullable=False)
    status = db.Column(db.String(16), default='UNREAD') # UNREAD, READ, RESOLVED
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": str(self.id),
            "transaction_id": self.transaction_id,
            "alert_type": self.alert_type,
            "risk_level": self.risk_level,
            "message": self.message,
            "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }
