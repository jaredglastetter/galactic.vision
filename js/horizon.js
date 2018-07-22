

function assets(address) {
	var server = new StellarSdk.Server('https://horizon.stellar.org');
	server.accounts().accountId(address).call().then(function (account) {
		
		document.getElementById('address').innerHTML = account.account_id;
		
		var account_tabs = '<ul role="tablist" class="nav nav-tabs"><li role="presentation" class="active"><a id="account-tabs-tab-balances" role="tab" aria-controls="account-tabs-pane-balances" aria-selected="true" href="#">Balances</a></li><li role="presentation" class=""><a id="account-tabs-tab-payments" role="tab" aria-controls="account-tabs-pane-payments" tabindex="-1" aria-selected="false" href="#">Payments</a></li><li role="presentation" class=""><a id="account-tabs-tab-offers" role="tab" aria-controls="account-tabs-pane-offers" tabindex="-1" aria-selected="false" href="#">Offers</a></li><li role="presentation" class=""><a id="account-tabs-tab-trades" role="tab" aria-controls="account-tabs-pane-trades" tabindex="-1" aria-selected="false" href="#">Trades</a></li><li role="presentation" class=""><a id="account-tabs-tab-operations" role="tab" aria-controls="account-tabs-pane-operations" tabindex="-1" aria-selected="false" href="#">Operations</a></li><li role="presentation" class=""><a id="account-tabs-tab-transactions" role="tab" aria-controls="account-tabs-pane-transactions" tabindex="-1" aria-selected="false" href="#">Transactions</a></li></ul>';	
		document.getElementById('assets').innerHTML = account_tabs;


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
			document.getElementById('assets').innerHTML = assets_table;
		}

	    return '';
  	}).catch(function (err) {
  		if(err.message.status == 404){
  			
  		}
  		console.log(err);
    	console.error(err);
  	})

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

