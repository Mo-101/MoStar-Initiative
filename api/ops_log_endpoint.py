"""
ops-log endpoint implementation for MoStar Payout API

Add this code to the bottom of your app.py file to include the /ops-log endpoint
which provides operation logs including payouts and wallet registrations.
"""

@app.route('/ops-log', methods=['GET'])
def ops_log():
    """Return the operation logs (payouts and wallet registrations)"""
    try:
        if not db:
            return jsonify({"error": "Database not configured"}), 500
        
        # Get query parameters for filtering
        wallet = request.args.get('wallet', None)
        status = request.args.get('status', None)
        days = request.args.get('days', None)
        limit = min(int(request.args.get('limit', 100)), 500)  # Cap at 500 results
        
        # Build the payout query
        payout_query = Payout.query
        
        if wallet:
            payout_query = payout_query.filter(Payout.wallet_address == wallet)
        
        if status:
            payout_query = payout_query.filter(Payout.status == status)
            
        if days:
            from datetime import datetime, timedelta
            cutoff_date = datetime.utcnow() - timedelta(days=int(days))
            payout_query = payout_query.filter(Payout.created_at >= cutoff_date)
        
        # Get most recent payouts first
        payouts = payout_query.order_by(Payout.created_at.desc()).limit(limit).all()
        
        # Get wallet registrations
        registration_query = WalletRegistration.query
        
        if wallet:
            registration_query = registration_query.filter(WalletRegistration.wallet_address == wallet)
            
        if days:
            from datetime import datetime, timedelta
            cutoff_date = datetime.utcnow() - timedelta(days=int(days))
            registration_query = registration_query.filter(WalletRegistration.created_at >= cutoff_date)
            
        registrations = registration_query.order_by(WalletRegistration.created_at.desc()).limit(limit).all()
        
        # Format the results
        payouts_data = [{
            'id': p.id,
            'wallet_address': p.wallet_address,
            'amount': p.amount,
            'tx_hash': p.tx_hash,
            'explorer_url': f"https://polygonscan.com/tx/{p.tx_hash}" if p.tx_hash else None,
            'status': p.status,
            'created_at': p.created_at.isoformat(),
            'updated_at': p.updated_at.isoformat()
        } for p in payouts]
        
        registrations_data = [{
            'id': r.id,
            'wallet_address': r.wallet_address,
            'created_at': r.created_at.isoformat()
        } for r in registrations]
        
        # Add summary data
        summary = {
            'total_payouts': Payout.query.count(),
            'total_payouts_completed': Payout.query.filter_by(status='completed').count(),
            'total_payouts_failed': Payout.query.filter_by(status='failed').count(),
            'total_payouts_pending': Payout.query.filter_by(status='processing').count() + 
                               Payout.query.filter_by(status='pending').count(),
            'total_unique_wallets': WalletRegistration.query.count(),
        }
        
        return jsonify({
            'summary': summary,
            'payouts': payouts_data,
            'registrations': registrations_data
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500
