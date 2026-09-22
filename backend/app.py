"""
TrustChain Backend Application Entry Point
Flask + SQLAlchemy + REST API
"""
import os
import csv
from flask import Flask, jsonify
from flask_cors import CORS
from backend.models.database import db, Transaction, FraudPrediction, Alert, BlockchainRecord
from backend.routes.api_routes import api_bp
from backend.ml.pipeline import ml_pipeline
from backend.blockchain.contract_service import blockchain_service

def create_app(test_config=None):
    app = Flask(__name__)
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # Database Configuration: MySQL primary, fallback to local SQLite for zero-friction setup
    db_url = os.environ.get("DATABASE_URL")
    if not db_url:
        mysql_user = os.environ.get("MYSQL_USER", "trustchain_user")
        mysql_pw = os.environ.get("MYSQL_PASSWORD", "")
        mysql_host = os.environ.get("MYSQL_HOST", "localhost")
        mysql_port = os.environ.get("MYSQL_PORT", "3306")
        mysql_db = os.environ.get("MYSQL_DATABASE", "trustchain_db")
        if mysql_pw:
            db_url = f"mysql+pymysql://{mysql_user}:{mysql_pw}@{mysql_host}:{mysql_port}/{mysql_db}"
        else:
            # Local lightweight SQLite storage for local testing & development
            db_url = "sqlite:///trustchain.db"

    app.config['SQLALCHEMY_DATABASE_URI'] = db_url
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev_secret_key_trustchain_2026')

    db.init_app(app)
    app.register_blueprint(api_bp, url_prefix='/api')

    with app.app_context():
        db.create_all()
        # Seed initial sample dataset if table is empty
        _seed_initial_data()

    return app

def _seed_initial_data():
    if Transaction.query.first() is not None:
        return

    csv_path = os.path.join(os.path.dirname(__file__), '..', 'dataset', 'sample_transactions.csv')
    if not os.path.exists(csv_path):
        return

    try:
        with open(csv_path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                tx = Transaction(
                    transaction_id=row['transaction_id'],
                    product_id=row['product_id'],
                    quantity=float(row['quantity']),
                    location=row['location'],
                    timestamp=row['timestamp'],
                    supplier_details=row['supplier_details'],
                    manufacturer=row.get('manufacturer', ''),
                    distributor=row.get('distributor', ''),
                    retailer=row.get('retailer', ''),
                    price=float(row.get('price', 100)),
                    risk_score=float(row.get('risk_score', 0.1)),
                    fraud_label=int(row['fraud_label']) if row.get('fraud_label') else None
                )
                db.session.add(tx)
                db.session.commit()

                # Run ML Prediction
                pred = ml_pipeline.predict_transaction(tx.to_dict())
                fraud_pred = FraudPrediction(
                    transaction_id=tx.transaction_id,
                    prediction=pred["prediction"],
                    random_forest_prediction=pred["model_results"]["random_forest"]["prediction"],
                    isolation_forest_prediction=pred["model_results"]["isolation_forest"]["prediction"],
                    xgboost_prediction=pred["model_results"]["xgboost"]["prediction"],
                    fraud_probability=pred["fraud_probability"],
                    risk_level=pred["risk_level"]
                )
                db.session.add(fraud_pred)

                # Store on blockchain for genuine transactions
                if pred["prediction"] == "GENUINE":
                    bc_rec = blockchain_service.store_transaction(tx.transaction_id, tx.to_dict(), "GENUINE")
                    bc = BlockchainRecord(
                        transaction_id=tx.transaction_id,
                        data_hash=bc_rec["data_hash"],
                        blockchain_tx_hash=bc_rec["blockchain_tx_hash"],
                        block_number=bc_rec["block_number"],
                        contract_address=bc_rec["contract_address"],
                        verification_status="VERIFIED"
                    )
                    db.session.add(bc)
                else:
                    alert = Alert(
                        transaction_id=tx.transaction_id,
                        alert_type="ML_FRAUD_DETECTED",
                        risk_level=pred["risk_level"],
                        message=f"Suspicious transaction {tx.transaction_id} flagged: {', '.join(pred['risk_factors'][:2])}"
                    )
                    db.session.add(alert)
                db.session.commit()
    except Exception as e:
        print(f"Error seeding initial data: {e}")

if __name__ == '__main__':
    app = create_app()
    port = int(os.environ.get("FLASK_PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)
