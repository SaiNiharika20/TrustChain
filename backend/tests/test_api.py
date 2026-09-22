"""
TrustChain Automated Test Suite
Covers:
- Database CRUD & transaction insertion
- ML Fraud Prediction (Random Forest, Isolation Forest, XGBoost)
- Canonical SHA-256 Hashing
- Blockchain Storage & Tamper Detection
"""
import pytest
import os
import json
from backend.app import create_app
from backend.models.database import db, Transaction, FraudPrediction, BlockchainRecord
from backend.blockchain.contract_service import blockchain_service
from backend.ml.pipeline import ml_pipeline

@pytest.fixture
def client():
    app = create_app()
    app.config['TESTING'] = True
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    
    with app.app_context():
        db.create_all()
        yield app.test_client()
        db.session.remove()
        db.drop_all()

def test_health_check(client):
    response = client.get('/api/health')
    assert response.status_code == 200
    data = response.get_json()
    assert data['status'] == 'healthy'
    assert data['database_connected'] is True

def test_create_transaction_and_predict(client):
    payload = {
        "transaction_id": "TEST-TX-001",
        "product_id": "PRD-TEST-99",
        "quantity": 1500,
        "location": "Berlin-Hub-DE",
        "supplier_details": "BioMed Global Logistics",
        "price": 30000
    }
    response = client.post('/api/transactions', json=payload)
    assert response.status_code == 201
    data = response.get_json()
    assert data['transaction']['transaction_id'] == 'TEST-TX-001'
    assert 'prediction' in data
    assert data['prediction']['prediction'] in ['GENUINE', 'FRAUD']
    assert 'random_forest' in data['prediction']['model_results']

def test_canonical_hash_consistency():
    record1 = {
        "transaction_id": "TX-HASH-1",
        "product_id": "PRD-A",
        "quantity": 100,
        "location": "Hub-A",
        "timestamp": "2026-03-01T00:00:00Z",
        "supplier_details": "Supplier X",
        "price": 500
    }
    hash1 = blockchain_service.hash_canonical_record(record1)
    hash2 = blockchain_service.hash_canonical_record(record1)
    assert hash1 == hash2
    assert len(hash1) == 64 # SHA-256 length

def test_blockchain_storage_and_tamper_detection(client):
    record = {
        "transaction_id": "TX-TAMPER-TEST",
        "product_id": "PRD-TAMPER-01",
        "quantity": 500,
        "location": "Rotterdam-Port-NL",
        "timestamp": "2026-03-01T12:00:00Z",
        "supplier_details": "Nordic Cargo",
        "price": 10000
    }
    # 1. Store on chain
    stored = blockchain_service.store_transaction("TX-TAMPER-TEST", record, "GENUINE")
    assert stored["verification_status"] == "VERIFIED"

    # 2. Verify unmodified record
    verify_valid = blockchain_service.verify_transaction_integrity("TX-TAMPER-TEST", record)
    assert verify_valid["is_match"] is True
    assert verify_valid["verification_status"] == "VERIFIED"

    # 3. Modify/Tamper with record (e.g. modify quantity from 500 to 50000)
    tampered_record = dict(record)
    tampered_record["quantity"] = 50000
    
    verify_tampered = blockchain_service.verify_transaction_integrity("TX-TAMPER-TEST", tampered_record)
    assert verify_tampered["is_match"] is False
    assert verify_tampered["verification_status"] == "TAMPER DETECTED"
