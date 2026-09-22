"""
TrustChain Flask API Routes Blueprint
Implements all REST API endpoints for Transactions, ML, Blockchain, Alerts & Reports.
"""
from flask import Blueprint, request, jsonify, current_app
from backend.models.database import db, Transaction, FraudPrediction, BlockchainRecord, Alert, User
from backend.ml.pipeline import ml_pipeline
from backend.blockchain.contract_service import blockchain_service
import pandas as pd
import io
import datetime

api_bp = Blueprint('api', __name__)

@api_bp.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "healthy",
        "service": "TrustChain Backend API",
        "timestamp": datetime.datetime.utcnow().isoformat(),
        "database_connected": True,
        "ml_engine_ready": True,
        "blockchain_connected": blockchain_service.is_connected
    })

@api_bp.route('/dashboard/stats', methods=['GET'])
def get_dashboard_stats():
    transactions = Transaction.query.all()
    total = len(transactions)
    
    fraud_predictions = FraudPrediction.query.all()
    pred_map = {p.transaction_id: p for p in fraud_predictions}
    
    fraud_count = sum(1 for p in fraud_predictions if p.prediction == 'FRAUD')
    genuine_count = sum(1 for p in fraud_predictions if p.prediction == 'GENUINE')
    
    if total == 0 and len(fraud_predictions) > 0:
        total = len(fraud_predictions)
    elif total > 0 and len(fraud_predictions) == 0:
        genuine_count = total
        
    fraud_rate = round((fraud_count / max(total, 1)) * 100, 1)
    
    bc_records = BlockchainRecord.query.all()
    verified_count = sum(1 for b in bc_records if b.verification_status == 'VERIFIED')
    pending_count = max(0, total - len(bc_records))
    
    alerts = Alert.query.filter_by(status='UNREAD').all()
    
    # Aggregated charts
    # 1. Fraud vs Genuine
    fraud_vs_genuine = [
        {"name": "Genuine", "value": genuine_count, "color": "#10b981"},
        {"name": "Fraudulent", "value": fraud_count, "color": "#ef4444"}
    ]
    
    # 2. Fraud by Supplier
    supplier_stats = {}
    for tx in transactions:
        supp = tx.supplier_details or "Unknown"
        pred = pred_map.get(tx.transaction_id)
        is_fraud = (pred and pred.prediction == 'FRAUD') or (tx.fraud_label == 1)
        if supp not in supplier_stats:
            supplier_stats[supp] = {"total": 0, "fraud": 0}
        supplier_stats[supp]["total"] += 1
        if is_fraud:
            supplier_stats[supp]["fraud"] += 1
            
    fraud_by_supplier = [
        {
            "supplier": s,
            "total_count": data["total"],
            "fraud_count": data["fraud"],
            "fraud_rate": round((data["fraud"] / max(data["total"], 1)) * 100, 1)
        }
        for s, data in sorted(supplier_stats.items(), key=lambda x: x[1]["fraud"], reverse=True)[:6]
    ]

    # 3. Fraud by Location
    loc_stats = {}
    for tx in transactions:
        loc = tx.location.split("-")[0] if "-" in tx.location else tx.location
        pred = pred_map.get(tx.transaction_id)
        is_fraud = (pred and pred.prediction == 'FRAUD') or (tx.fraud_label == 1)
        if loc not in loc_stats:
            loc_stats[loc] = {"total": 0, "fraud": 0}
        loc_stats[loc]["total"] += 1
        if is_fraud:
            loc_stats[loc]["fraud"] += 1
            
    fraud_by_location = [
        {"location": l, "total_count": data["total"], "fraud_count": data["fraud"]}
        for l, data in sorted(loc_stats.items(), key=lambda x: x[1]["fraud"], reverse=True)[:6]
    ]

    # 4. Status distribution
    status_dist = [
        {"name": "Blockchain Verified", "count": verified_count, "color": "#3b82f6"},
        {"name": "Pending Verification", "count": pending_count, "color": "#f59e0b"},
        {"name": "Fraud Flagged", "count": fraud_count, "color": "#ef4444"}
    ]

    return jsonify({
        "total_transactions": total,
        "genuine_transactions": genuine_count,
        "fraudulent_transactions": fraud_count,
        "fraud_detection_rate": fraud_rate,
        "blockchain_verified_transactions": verified_count,
        "pending_transactions": pending_count,
        "recent_alerts_count": len(alerts),
        "fraud_vs_genuine": fraud_vs_genuine,
        "fraud_by_supplier": fraud_by_supplier,
        "fraud_by_location": fraud_by_location,
        "transaction_status_distribution": status_dist
    })

@api_bp.route('/transactions', methods=['GET'])
def get_transactions():
    txs = Transaction.query.order_by(Transaction.id.desc()).all()
    preds = {p.transaction_id: p.to_dict() for p in FraudPrediction.query.all()}
    bcs = {b.transaction_id: b.to_dict() for b in BlockchainRecord.query.all()}
    
    result = []
    for t in txs:
        t_dict = t.to_dict()
        t_dict["prediction"] = preds.get(t.transaction_id)
        t_dict["blockchain"] = bcs.get(t.transaction_id)
        result.append(t_dict)
    return jsonify(result)

@api_bp.route('/transactions', methods=['POST'])
def create_transaction():
    data = request.get_json() or {}
    if not data.get('transaction_id') or not data.get('product_id') or not data.get('quantity'):
        return jsonify({"error": "Missing required fields: transaction_id, product_id, quantity"}), 400

    existing = Transaction.query.filter_by(transaction_id=data['transaction_id']).first()
    if existing:
        return jsonify({"error": f"Transaction ID '{data['transaction_id']}' already exists"}), 400

    tx = Transaction(
        transaction_id=data['transaction_id'],
        product_id=data['product_id'],
        quantity=float(data.get('quantity', 1)),
        location=data.get('location', 'Primary-Depot'),
        timestamp=data.get('timestamp', datetime.datetime.utcnow().isoformat()),
        supplier_details=data.get('supplier_details', 'General Supplier'),
        manufacturer=data.get('manufacturer', ''),
        distributor=data.get('distributor', ''),
        retailer=data.get('retailer', ''),
        price=float(data.get('price', 100)),
        risk_score=float(data.get('risk_score', 0.1)),
        fraud_label=data.get('fraud_label')
    )
    db.session.add(tx)
    db.session.commit()

    # Automatically trigger ML prediction
    prediction = ml_pipeline.predict_transaction(tx.to_dict())
    fraud_pred = FraudPrediction(
        transaction_id=tx.transaction_id,
        prediction=prediction["prediction"],
        random_forest_prediction=prediction["model_results"]["random_forest"]["prediction"],
        isolation_forest_prediction=prediction["model_results"]["isolation_forest"]["prediction"],
        xgboost_prediction=prediction["model_results"]["xgboost"]["prediction"],
        fraud_probability=prediction["fraud_probability"],
        risk_level=prediction["risk_level"]
    )
    db.session.add(fraud_pred)

    if prediction["risk_level"] in ['HIGH', 'MEDIUM'] or prediction["prediction"] == 'FRAUD':
        alert = Alert(
            transaction_id=tx.transaction_id,
            alert_type="ML_FRAUD_DETECTED",
            risk_level=prediction["risk_level"],
            message=f"Transaction {tx.transaction_id} flagged with {int(prediction['fraud_probability']*100)}% fraud probability: {', '.join(prediction['risk_factors'][:2])}"
        )
        db.session.add(alert)

    db.session.commit()
    return jsonify({"transaction": tx.to_dict(), "prediction": prediction}), 201

@api_bp.route('/transactions/predict', methods=['POST'])
def predict_transaction_endpoint():
    data = request.get_json() or {}
    if not data.get('quantity'):
        return jsonify({"error": "Quantity required for ML evaluation"}), 400
    res = ml_pipeline.predict_transaction(data)
    return jsonify(res)

@api_bp.route('/transactions/upload', methods=['POST'])
def upload_dataset():
    if 'file' not in request.files:
        return jsonify({"error": "No file uploaded. Please provide a CSV file."}), 400
    file = request.files['file']
    if not file.filename.endswith('.csv'):
        return jsonify({"error": "Only CSV files are supported."}), 400

    try:
        stream = io.StringIO(file.stream.read().decode("UTF8"), newline=None)
        df = pd.read_csv(stream)
        required_cols = ['transaction_id', 'product_id', 'quantity', 'location', 'supplier_details']
        missing = [c for c in required_cols if c not in df.columns]
        if missing:
            return jsonify({"error": f"CSV is missing required headers: {', '.join(missing)}"}), 400

        created_count = 0
        for _, row in df.iterrows():
            tx_id = str(row['transaction_id']).strip()
            if not Transaction.query.filter_by(transaction_id=tx_id).first():
                tx = Transaction(
                    transaction_id=tx_id,
                    product_id=str(row['product_id']).strip(),
                    quantity=float(row['quantity']),
                    location=str(row['location']).strip(),
                    timestamp=str(row.get('timestamp', datetime.datetime.utcnow().isoformat())),
                    supplier_details=str(row['supplier_details']).strip(),
                    manufacturer=str(row.get('manufacturer', '')),
                    distributor=str(row.get('distributor', '')),
                    retailer=str(row.get('retailer', '')),
                    price=float(row.get('price', 0)) if pd.notnull(row.get('price')) else 0.0,
                    risk_score=float(row.get('risk_score', 0.1)) if pd.notnull(row.get('risk_score')) else 0.1,
                    fraud_label=int(row['fraud_label']) if ('fraud_label' in row and pd.notnull(row['fraud_label'])) else None
                )
                db.session.add(tx)
                created_count += 1
        db.session.commit()

        # Train pipeline on the newly uploaded dataset
        ml_pipeline.train_pipeline(df, is_synthetic=False)
        return jsonify({
            "message": f"Successfully uploaded and parsed {len(df)} transactions ({created_count} new records added to database).",
            "records_count": len(df),
            "ml_status": "RETRAINED"
        })
    except Exception as e:
        return jsonify({"error": f"Failed to parse CSV file: {str(e)}"}), 500

@api_bp.route('/ml/status', methods=['GET'])
def get_ml_status():
    return jsonify({
        "is_trained": ml_pipeline.is_trained,
        "dataset_type": ml_pipeline.dataset_type,
        "last_trained_at": ml_pipeline.last_trained_at,
        "models": ml_pipeline.metrics
    })

@api_bp.route('/ml/train', methods=['POST'])
def trigger_ml_train():
    txs = Transaction.query.all()
    if not txs:
        return jsonify({"error": "No transaction records in database to train on."}), 400
    df = pd.DataFrame([t.to_dict() for t in txs])
    metrics = ml_pipeline.train_pipeline(df, is_synthetic=False)
    return jsonify({"message": "ML models retrained successfully", "metrics": metrics})

@api_bp.route('/blockchain/store', methods=['POST'])
def store_blockchain_record():
    data = request.get_json() or {}
    tx_id = data.get('transaction_id')
    if not tx_id:
        return jsonify({"error": "transaction_id is required"}), 400

    tx = Transaction.query.filter_by(transaction_id=tx_id).first()
    if not tx:
        return jsonify({"error": f"Transaction {tx_id} not found in database"}), 404

    record = blockchain_service.store_transaction(
        transaction_id=tx_id,
        record_dict=tx.to_dict(),
        prediction_status=data.get('prediction_status', 'VERIFIED')
    )

    bc = BlockchainRecord.query.filter_by(transaction_id=tx_id).first()
    if not bc:
        bc = BlockchainRecord(
            transaction_id=tx_id,
            data_hash=record["data_hash"],
            blockchain_tx_hash=record["blockchain_tx_hash"],
            block_number=record["block_number"],
            contract_address=record["contract_address"],
            verification_status="VERIFIED"
        )
        db.session.add(bc)
    else:
        bc.data_hash = record["data_hash"]
        bc.blockchain_tx_hash = record["blockchain_tx_hash"]
        bc.block_number = record["block_number"]
        bc.verification_status = "VERIFIED"
    db.session.commit()

    return jsonify(record), 200

@api_bp.route('/blockchain/verify', methods=['POST'])
def verify_blockchain_record():
    data = request.get_json() or {}
    tx_id = data.get('transaction_id')
    if not tx_id:
        return jsonify({"error": "transaction_id is required"}), 400

    tx = Transaction.query.filter_by(transaction_id=tx_id).first()
    if not tx:
        return jsonify({"error": f"Transaction {tx_id} not found in database"}), 404

    res = blockchain_service.verify_transaction_integrity(tx_id, tx.to_dict())
    return jsonify(res)

@api_bp.route('/alerts', methods=['GET'])
def get_alerts():
    alerts = Alert.query.order_by(Alert.id.desc()).all()
    return jsonify([a.to_dict() for a in alerts])

@api_bp.route('/transactions/<transaction_id>', methods=['GET'])
def get_single_transaction(transaction_id):
    tx = Transaction.query.filter_by(transaction_id=transaction_id).first()
    if not tx:
        return jsonify({"error": f"Transaction '{transaction_id}' not found"}), 404
    pred = FraudPrediction.query.filter_by(transaction_id=transaction_id).first()
    bc = BlockchainRecord.query.filter_by(transaction_id=transaction_id).first()
    t_dict = tx.to_dict()
    t_dict["prediction"] = pred.to_dict() if pred else None
    t_dict["blockchain"] = bc.to_dict() if bc else None
    return jsonify(t_dict)

@api_bp.route('/ml/metrics', methods=['GET'])
def get_ml_metrics():
    return jsonify(ml_pipeline.metrics)

@api_bp.route('/fraud', methods=['GET'])
def get_fraud_monitoring():
    txs = Transaction.query.order_by(Transaction.id.desc()).all()
    preds = {p.transaction_id: p.to_dict() for p in FraudPrediction.query.all()}
    bcs = {b.transaction_id: b.to_dict() for b in BlockchainRecord.query.all()}
    
    result = []
    for t in txs:
        pred = preds.get(t.transaction_id)
        is_fraud = (pred and pred["prediction"] == "FRAUD") or t.fraud_label == 1 or t.is_tampered
        is_high_risk = pred and pred["risk_level"] in ["HIGH", "MEDIUM"]
        if is_fraud or is_high_risk:
            t_dict = t.to_dict()
            t_dict["prediction"] = pred
            t_dict["blockchain"] = bcs.get(t.transaction_id)
            result.append(t_dict)
    return jsonify(result)

@api_bp.route('/blockchain/<transaction_id>', methods=['GET'])
def get_blockchain_record_by_id(transaction_id):
    bc = BlockchainRecord.query.filter_by(transaction_id=transaction_id).first()
    if not bc:
        return jsonify({"error": f"No blockchain record found for transaction {transaction_id}"}), 404
    return jsonify(bc.to_dict())

@api_bp.route('/reports/fraud', methods=['GET'])
def get_fraud_reports():
    txs = Transaction.query.order_by(Transaction.id.desc()).all()
    preds = {p.transaction_id: p.to_dict() for p in FraudPrediction.query.all()}
    bcs = {b.transaction_id: b.to_dict() for b in BlockchainRecord.query.all()}

    enriched = []
    fraud_count = 0
    genuine_count = 0
    tampered_count = 0

    for t in txs:
        t_dict = t.to_dict()
        pred = preds.get(t.transaction_id)
        t_dict["prediction"] = pred
        t_dict["blockchain"] = bcs.get(t.transaction_id)
        
        if (pred and pred["prediction"] == "FRAUD") or t.fraud_label == 1:
            fraud_count += 1
        else:
            genuine_count += 1
            
        if t.is_tampered:
            tampered_count += 1
            
        enriched.append(t_dict)

    return jsonify({
        "generated_at": datetime.datetime.utcnow().isoformat(),
        "total_count": len(enriched),
        "fraud_count": fraud_count,
        "genuine_count": genuine_count,
        "tampered_count": tampered_count,
        "transactions": enriched
    })

@api_bp.route('/alerts/<alert_id>/resolve', methods=['POST'])
def resolve_alert(alert_id):
    # Support numeric or string format
    alert = None
    if alert_id.isdigit():
        alert = Alert.query.get(int(alert_id))
    if not alert:
        alert = Alert.query.filter((Alert.id == alert_id) | (Alert.transaction_id == alert_id)).first()

    if not alert:
        return jsonify({"error": f"Alert '{alert_id}' not found"}), 404

    alert.status = 'RESOLVED'
    db.session.commit()
    return jsonify({"message": f"Alert {alert_id} resolved", "alert": alert.to_dict()})
