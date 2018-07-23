

function assets(address) {
	var server = new StellarSdk.Server('https://horizon.stellar.org');
	server.accounts().accountId(address).call().then(function (account) {
		console.log(account);
		document.getElementById('address').innerHTML = account.account_id;
		
		//var account_tabs = '<ul role="tablist" class="nav nav-tabs" id="account-tabs"><li role="presentation" class="nav-item active"><a id="account-tabs-tab-balances" class="nav-link active" data-toggle="tab" role="tab" aria-controls="account-tabs-pane-balances" aria-selected="true" href="#balances">Balances</a></li><li role="presentation" class="nav-item"><a id="account-tabs-tab-payments" class="nav-link" href="#payments_tab" data-toggle="tab" role="tab" aria-controls="account-tabs-pane-payments" tabindex="-1" aria-selected="false">Payments</a></li><li role="presentation" class="nav-item"><a id="account-tabs-tab-offers" class="nav-link" href="#offers" data-toggle="tab" role="tab" aria-controls="account-tabs-pane-offers" tabindex="-1" aria-selected="false">Offers</a></li><li role="presentation" class="nav-item"><a id="account-tabs-tab-trades" href="#tab_trades" data-toggle="tab" role="tab" aria-controls="account-tabs-pane-trades" tabindex="-1" aria-selected="false" href="#">Trades</a></li><li role="presentation" class="nav-item"><a id="account-tabs-tab-operations" data-url="?action=operations" role="tab" aria-controls="account-tabs-pane-operations" tabindex="-1" aria-selected="false" href="#">Operations</a></li><li role="presentation" class="nav-item"><a id="account-tabs-tab-transactions" data-url="?action=transactions" role="tab" aria-controls="account-tabs-pane-transactions" tabindex="-1" aria-selected="false" href="#">Transactions</a></li></ul><div class="tab-content"><div id="balances" class="tab-pane active"></div><div id="payments_tab" class="tab-pane fade"></div><div id="operations" class="tab-pane fade"></div></div>';	
		//document.getElementById('account-menu').innerHTML = account_tabs;

		var assets_table = '<table class="table table-bordered table-dark"><thead><tr><th class="text-center active col-sm-2">Code</th><th class="text-center active col-sm-2">Balance</th></tr></thead><tbody>';


		for(var row in account.balances){
			var asset = account.balances[row];

			if(asset.asset_type == 'native'){
				assets_table += '<tr><td class="text-center"><b>'+ "XLM" +'</b></td><td><b><span class="pull-right prl">'+numberWithCommas(asset.balance)+'</span></b></td></tr>';
			} else {
				assets_table += '<tr><td class="text-center"><b>'+asset.asset_code+'</b></td><td><b><span class="pull-right prl">'+numberWithCommas(asset.balance)+'</span></b></td></tr>';
			}
		}

		if(account.balances.length > 1){
			assets_table += '</tbody></table></div>';
			document.getElementById('balances').innerHTML = assets_table;
		}

	    return '';
  	}).catch(function (err) {
  		if(err.message.status == 404){
  			
  		}
  		console.log(err);
    	console.error(err);
  	});


  	/**** Payments Tab Data ****/
	server.payments().forAccount(address).call().then(function (account) {

		//console.log(account);

		var payments_table = '<table id="payment-table" class="table table-dark table-hover table-condensed"><thead><tr><th id="account">From</th><th id="to_account">To</th><th id="payment">Payment</th><th id="transaction">Transaction</th><th id="time">Time</th><th /></tr></thead><tbody>'
		console.log("printing account records");
		var paymentArr = account.records;
		console.log(paymentArr);
		for(var i = 0; i < paymentArr.length; i++){
			console.log("next loop");
			console.log(paymentArr[i]);
			var payment = paymentArr[i];

			//find out what type of payment

			
			var amount = payment.amount;
			var tx_hash = payment.transaction_hash;
			var tx_hash_display = tx_hash.substring(0,16);
			var time = payment.created_at;
			var asset;

			if(payment.asset_code) {
				asset = payment.asset_code;
			} else {
				asset = payment.asset_type;
			}

			if(payment.type == "payment") {
				var from = payment.from.substring(0,4);
				var to = payment.to.substring(0,4);
				if(payment.asset_type == 'native'){
					payments_table += '<tr><td class="text-center"><b>'+from+'</b></td><td class="text-center"><b>'+to+'</b></td><td><b><span class="pull-right prl">'+payment.amount + ' XLM' +'</span></b></td><td class="text-center"><b>'+tx_hash_display+'</b></td><td class="text-center"><b>'+payment.created_at+'</b></td></tr>';
				} else {
					payments_table += '<tr><td class="text-center"><b>'+from+'</b></td><td class="text-center"><b>'+to+'</b></td><td><b><span class="pull-right prl">'+payment.amount + ' ' + asset +'</span></b></td><td class="text-center"><b>'+tx_hash_display+'</b></td><td class="text-center"><b>'+payment.created_at+'</b></td></tr>';
				}
			}
		}

		payments_table += '</tbody></table></div>';
		document.getElementById('payments_tab').innerHTML = payments_table;

	    return '';
  	}).catch(function (err) {
  		if(err.message.status == 404){
  			
  		}
  		console.log(err);
    	console.error(err);
  	});


  	/**** Transactions Tab Data ****/
  	server.transactions().forAccount(address).call().then(function(account){

  		var transactions_table = '<table id="transaction-table" class="table table-dark table-hover table-condensed"><thead><tr><th id="transactions-account">Account</th><th id="transactions-fee">Fee</th><th id="transactions-time">Time</th></tr></thead><tbody>'
  		var transactionsArr = account.records;

  		console.log("printing transaction recors");
  		console.log(transactionsArr);

  		for(var i = 0; i < transactionsArr.length; i++){
  			console.log("next transaction");
  			console.log(transactionsArr[i]);

  			var transaction = transactionsArr[i];


  			var fee = transaction.fee_paid;
  			var id_hash = transaction.hash.substring(0,4);
  			var time = transaction.created_at;

  			transactions_table += '<tr><td class="text-center"><b>' + id_hash + '</b></td><td class="text-center"><b>' + fee + '</b></td><td class="text-center"><b>' + time + '</b></td></tr>';
  			

  		}

  		transactions_table += '</tbody></table></div>';
  		document.getElementById('transactions_tab').innerHTML = transactions_table;

  	}).catch(function (err){
  		if(err.message.status == 404){
  			
  		}
  		console.log(err);
    	console.error(err);
  	});
  	
}

/* transactions table tab*/

function address_tx(address, cursor){
	var server = new StellarSdk.Server('https://horizon.stellar.org');
	server.transactions().forAccount(address).cursor(cursor).order('desc').limit(25).call().then(function (transactions) {
		if ($('#more').length > 0) { remove('more'); }
		document.getElementById('txs').innerHTML += format_txs(transactions, 'address', address);
	    return '';
  	}).catch(function (err) {
    	console.error(err);
  	})
}

function capitalizeFirstLetter(string) {
    return string[0].toUpperCase() + string.slice(1);
}
function numberWithCommas(x) {
	var parts = x.split(".");
	return parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") + (parts[1] ? "." + parts[1] : "");
}
function remove(id) {
    return (elem=document.getElementById(id)).parentNode.removeChild(elem);
}

