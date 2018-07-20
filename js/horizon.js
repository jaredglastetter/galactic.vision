function processTransaction(transaction){
	var data = [];
	//console.log(transaction);
	
	data['fee'] = transaction.fee;
	data['sequence'] = transaction.sequence;

	if (transaction.operations[0].source != null) {
	   data['from'] = transaction.operations[0].source;
	} else {
	   data['from'] = transaction.source;
	}

	if(transaction.operations[0].type == 'createAccount'){
		//4b6210130796f52995f5c1e0d3b662c7d79c5ea92e269f347868c5eb6c96db0e

		data['label']  			   = "Create Account";
		data['amount_formated']    = '<b><span class="pull-left">XLM</span><span class="pull-right">'+transaction.operations[0].startingBalance+'</span></b>';
		data['to']        		   = transaction.operations[0].destination;
		data['to_formated']        = '<a href="/address/'+transaction.operations[0].destination+'" class="pull-right">'+transaction.operations[0].destination+'</a>';
		data['operation_fromated'] = '<tr><td></td><td class="text-center col-md-2 prl pll"><b><span class="pull-left">XLM</span><span class="pull-right">'+transaction.operations[0].startingBalance+'</span></b></td></tr>';
		
	} else if(transaction.operations[0].type == 'payment'){
		//e53a9183d502a0084ba04a846f3e21e287352857292b05cd8397d37371c4b82e

		data['label']  			   = "Payment";
		data['amount_formated']    = '<b><span class="pull-left">'+transaction.operations[0].asset.code+'</span><span class="pull-right">'+transaction.operations[0].amount+'</span></b>';
		data['to']        		   = transaction.operations[0].destination;
		data['to_formated']        = '<a href="/address/'+transaction.operations[0].destination+'" class="pull-right">'+transaction.operations[0].destination+'</a>';
		data['operation_fromated'] = '<tr><td></td><td class="text-center col-md-2 prl pll"><b><span class="pull-left">'+transaction.operations[0].asset.code+'</span><span class="pull-right">'+transaction.operations[0].amount+'</span></b></td></tr>';

	} else if(transaction.operations[0].type == 'pathPayment'){
		
		data['label']  			   = "Path Payment";
		data['amount_formated']    = '<b><span class="pull-left">'+transaction.operations[0].destAsset.code+'</span><span class="pull-right">'+transaction.operations[0].destAmount+'</span></b>';
		data['to']        		   = transaction.operations[0].destination;
		data['to_formated']        = '<a href="/address/'+transaction.operations[0].destination+'" class="pull-right">'+transaction.operations[0].destination+'</a>';
		data['operation_fromated'] = '<tr><td class="text-center col-md-2 prl pll"><b><span class="pull-left">Max '+transaction.operations[0].sendAsset.code+'</span><span class="pull-right">'+transaction.operations[0].sendMax+'</span></b></td><td></td><td class="text-center col-md-2 prl pll"><b><span class="pull-left">'+transaction.operations[0].destAsset.code+'</span><span class="pull-right">'+transaction.operations[0].destAmount+'</span></b></td></tr>';

	} else if(transaction.operations[0].type == 'manageOffer'){

		data['label']  			   = "Manage Offer";
		data['amount_formated']    = '<b><a class="manageOffer" data-original-title="Offer" tabindex="0" data-placement="top" role="button" data-toggle="popover" data-trigger="focus" title="" data-content="Buying '+transaction.operations[0].buying.code+' '+transaction.operations[0].amount+' x '+transaction.operations[0].price+' '+transaction.operations[0].selling.code+'">View Offer</a></b>';
		data['to']        		   = '';
		data['to_formated']        = '<b class="pull-right">N/A</b>';

		if(transaction.operations[0].selling.code == 'XLM'){
			//2051301d6d63edb7e62890f81a01c92260e1066596d42281d8fb1ba5b1d5e4b3

			var offer_type 	    = "Buying";
			var issuer_fromated = '<tr><td class="col-md-5"></td><td class="text-center"><b>Issuer</b></td><td class="col-md-5 text-center"><small><a href="/address/'+transaction.operations[0].buying.issuer+'">'+transaction.operations[0].buying.issuer+'</a></small></td></tr>';

		} else if(transaction.operations[0].buying.code == 'XLM'){
			//7311918c57f5bc4f3e70648571fb3ab54edebcd1546dbc8dddc92c61c432612a

			var offer_type      = "Selling";
			var issuer_fromated = '<tr><td class="col-md-5 text-center"><small><a href="/address/'+transaction.operations[0].selling.issuer+'">'+transaction.operations[0].selling.issuer+'</a></small></td><td class="text-center"><b>Issuer</b></td><td class="col-md-5"></td></tr>';
		} 
		data['operation_fromated']  = '<tr><td class="text-center col-md-2 prl pll"><b><span class="pull-left">Price '+transaction.operations[0].selling.code+'</span><span class="pull-right">'+transaction.operations[0].price+'</span></b></td><td class="text-center"><b>'+offer_type+'</b></td><td class="text-center col-md-2 prl pll"><b><span class="pull-left">'+transaction.operations[0].buying.code+'</span><span class="pull-right">'+transaction.operations[0].amount+'</span></b></td></tr>';
		data['operation_fromated'] += issuer_fromated;

	} else if(transaction.operations[0].type == 'createPassiveOffer'){

		data['label']  			   = "Create Passive Offer";
		data['amount_formated']    = '<b><a class="manageOffer" data-original-title="Offer" tabindex="0" data-placement="top" role="button" data-toggle="popover" data-trigger="focus" title="" data-content="Buying '+transaction.operations[0].buying.code+' '+transaction.operations[0].amount+' x '+transaction.operations[0].price+' '+transaction.operations[0].selling.code+'">View Offer</a></b>';
		data['to']        		   = '';
		data['to_formated']        = '<b class="pull-right">N/A</b>';

		if(transaction.operations[0].selling.code == 'XLM'){
			//

			var offer_type 	    = "Buying";
			var issuer_fromated = '<tr><td class="col-md-5"></td><td class="text-center"><b>Issuer</b></td><td class="col-md-5 text-center"><small><a href="/address/'+transaction.operations[0].buying.issuer+'">'+transaction.operations[0].buying.issuer+'</a></small></td></tr>';

		} else if(transaction.operations[0].buying.code == 'XLM'){
			//fe0561e3ffc0716ced9d95cac5ec3f3e6841009bbadb876855b5cb13371d3036
			
			var offer_type      = "Selling";
			var issuer_fromated = '<tr><td class="col-md-5 text-center"><small><a href="/address/'+transaction.operations[0].selling.issuer+'">'+transaction.operations[0].selling.issuer+'</a></small></td><td class="text-center"><b>Issuer</b></td><td class="col-md-5"></td></tr>';
		} 
		data['operation_fromated']  = '<tr><td class="text-center col-md-2 prl pll"><b><span class="pull-left">Price '+transaction.operations[0].selling.code+'</span><span class="pull-right">'+transaction.operations[0].price+'</span></b></td><td class="text-center"><b>'+offer_type+'</b></td><td class="text-center col-md-2 prl pll"><b><span class="pull-left">'+transaction.operations[0].buying.code+'</span><span class="pull-right">'+transaction.operations[0].amount+'</span></b></td></tr>';
		data['operation_fromated'] += issuer_fromated;

	} else if(transaction.operations[0].type == 'setOptions'){
			//4665626867d806451f8151b3510e9703bd5e627b08eedfa79963b684407b5b3c

		data['label']  				= "Set Options";
		data['amount_formated'] 	= '<b>N/A</b>';
		data['to']        		    = '';
		data['to_formated']     	= '<b class="pull-right">N/A</b>';
		data['operation_fromated']  = '<tr><td class="col-md-2 prl pll"><b><span class="pull-left">Home Domain:</span></b></td><td><b>'+transaction.operations[0].homeDomain+'</b></td></tr>';
		data['operation_fromated'] += '<tr><td class="col-md-2 prl pll"><b><span class="pull-left">Inflation Destination:</span></b></td><td><a href="/address/'+transaction.operations[0].inflationDest+'">'+transaction.operations[0].inflationDest+'</a></td></tr>';

	} else if(transaction.operations[0].type == 'changeTrust'){
		//beac3cf9a32f145b70d18ccc17b44ee3f465e00f27b23fc9198a42692a41b528

		data['label']  				= "Change Trust";
		data['amount_formated'] 	= '<b><span class="pull-left">'+transaction.operations[0].line.code+'</span><span class="pull-right">'+transaction.operations[0].limit+'</span></b>';
		data['to']        		    = '';
		data['to_formated']     	= '<b class="pull-right">N/A</b>';
		data['operation_fromated']  = '<tr><td class="text-center col-md-2 prl pll"><b><span class="pull-left">Limit '+transaction.operations[0].line.code+'</span><span class="pull-right">'+transaction.operations[0].limit+'</span></b></td><td></td><td></td></tr>';
		data['operation_fromated'] += '<tr><td class="col-md-5 text-center"><small><a href="/address/'+transaction.operations[0].line.issuer+'">'+transaction.operations[0].line.issuer+'</a></small></td><td class="text-center"><b>Issuer</b></td><td class="col-md-5"></td></tr>';

	} else if(transaction.operations[0].type == 'allowTrust'){
		//4c40792565505d7b665df6b31eda256ca661e1962d35b7171d5cbeb8731eb84b

		if(transaction.operations[0].authorize){
			var authorize = '<i class="fa fa-check-circle-o text-success" aria-hidden="true"></i>';
		} else {
			var authorize = '<i class="fa fa-times-circle-o text-danger" aria-hidden="true"></i>';
		}

		data['label']  				= "Allow Trust";
		data['amount_formated'] 	= '<b>'+transaction.operations[0].assetCode+'</b>';
		data['to']        		    = '';
		data['to_formated']     	= '<b class="pull-right">N/A</b>';
		data['operation_fromated']  = '<tr><td class="text-center col-md-2 prl pll"><b><span class="pull-left">'+transaction.operations[0].assetCode+'</span><span class="pull-right">'+authorize+'</span></b></td><td></td><td></td></tr>';
		data['operation_fromated'] += '<tr><td class="col-md-5 text-center"><small><a href="/address/'+transaction.operations[0].trustor+'">'+transaction.operations[0].trustor+'</a></small></td><td class="text-center"><b>Trustor</b></td><td class="col-md-5"></td></tr>';

	} else if(transaction.operations[0].type == 'accountMerge'){
		//1021e80f3215bb7d55bdcfa39ff6eab3fd8ca4bc0910853271f36e9c1ea36085

		data['label'] 				= "Account Merge";
		data['amount_formated'] 	= '<b>N/A</b>';
		data['to']        		    = '';
		data['to_formated']        	= '<a href="/address/'+transaction.operations[0].destination+'" class="pull-right">'+transaction.operations[0].destination+'</a>';
		data['operation_fromated']  = '';

	} else if(transaction.operations[0].type == 'inflation'){
		//bbd3f04eeeadffef65b786f9f5e166088cfade0b8433182f2fc6d02bb61aae20

		data['label']  				= "Inflation";
		data['amount_formated'] 	= '<b>N/A</b>';
		data['to']        		    = '';
		data['to_formated']     	= '<b class="pull-right">N/A</b>';
		data['operation_fromated']  = '';

	} else if(transaction.operations[0].type == 'manageData'){

		data['label']  				= "Manage Data";
		data['amount_formated'] 	= '<b>N/A</b>';
		data['to']        		    = '';
		data['to_formated']     	= '<b class="pull-right">N/A</b>';
		data['operation_fromated']  = '';

	}

    return data;
}

function transaction(tx){
	var server = new StellarSdk.Server('https://horizon.stellar.org');
	server.transactions().transaction(tx).call().then(function (tx) {

	   	var tx_data = processTransaction(new StellarBase.Transaction(tx.envelope_xdr));

		console.log(tx);
		console.log(tx_data);

		document.getElementById('label').innerHTML = tx_data.label;
		document.getElementById('hash').innerHTML  = tx.id;

		document.getElementById('from').innerHTML  = tx_data.from;
    	document.getElementById("from").href       = "/address/"+tx_data.from; 

		document.getElementById('to').innerHTML    = tx_data.to_formated;

		document.getElementById('operation').innerHTML  = tx_data.operation_fromated;

		document.getElementById('created_at').innerHTML = tx.created_at.replace(/T|Z/g, " ")+" &middot; "+jQuery.timeago(tx.created_at);
		document.getElementById('fee').innerHTML = (tx_data.fee/10000000).toFixed(8)+" XLM";

		document.getElementById('paging_token').innerHTML = tx.paging_token;
		document.getElementById('sequence').innerHTML  = tx_data.sequence;
		if(tx.memo == null){
			document.getElementById('memo').innerHTML      = 'N/A';
			document.getElementById('memo_type').innerHTML = '';
		} else {
			document.getElementById('memo').innerHTML      = tx.memo;
			document.getElementById('memo_type').innerHTML = ' '+tx.memo_type;
		}

		var sigs = "";
		for(var rowID in tx.signatures){
			var sig = tx.signatures[rowID];
			sigs += '<tr><td class="pll">'+sig+'</td></tr>';
		}
		document.getElementById('sigs').innerHTML = sigs;

		tx.ledger().then(function (ledger) {
	    	document.getElementById('ledger').innerHTML = '<a href="/ledger/'+ledger.sequence+'">'+ledger.sequence+'</a>';

	    	return '';
	  	})
	  .catch(function (err) { console.error(err); })
	  return '';
  	}).catch(function (err) { console.error(err); })
  	return '';
}

function address(address) {
	var server = new StellarSdk.Server('https://horizon.stellar.org');
	server.accounts().accountId(address).call().then(function (account) {
		
		document.getElementById('address').innerHTML = account.account_id;
			
		var assets_table = '<div class="panel panel-info"><div class="panel-heading"><h3 class="panel-title text-center">Assets</h3></div><table class="table table-striped table-bordered"><thead><tr><th class="text-center active col-sm-2">Code</th><th class="text-center active col-sm-2">Balance</th></tr></thead><tbody>';

		for(var row in account.balances){
			var asset = account.balances[row];

			if(asset.asset_type == 'native'){

				document.getElementById('balance').innerHTML  = numberWithCommas(asset.balance);
				document.getElementById('currency').innerHTML = "XLM";

			    $.get("/price", function(data){
					document.getElementById('value_btc').innerHTML = numberWithCommas((asset.balance * data.xlm_btc).toFixed(8));
					document.getElementById('value_usd').innerHTML = numberWithCommas((asset.balance * data.xlm_usd).toFixed(4));
					document.getElementById('value_eur').innerHTML = numberWithCommas((asset.balance * data.xlm_eur).toFixed(4));
			    });
			} else {
				assets_table += '<tr><td class="text-center"><b>'+asset.asset_code+'</b></td><td><b><span class="pull-right prl">'+numberWithCommas(asset.balance)+'</span></b></td></tr>';

			}

		}

		if(account.balances.length > 1){
			assets_table += '</tbody></table></div>';
			document.getElementById('assets').innerHTML = assets_table;
		}

	   // address_tx(address, '');

	    return '';
  	}).catch(function (err) {
  		if(err.message.status == 404){
  			
  		}

  		console.log(err);
    	console.error(err);
  	})

}

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
function get_price(){
    $.get("/price", function(data){
 
		document.getElementById('xlm_btc').innerHTML = data['xlm_btc'];
		document.getElementById('xlm_usd').innerHTML = data['xlm_usd'];
		document.getElementById('xlm_eur').innerHTML = data['xlm_eur'];
		document.getElementById('volume').innerHTML  = (data['volume']*data['xlm_usd']).toFixed(8);
		document.getElementById('market_cap_usd').innerHTML = numberWithCommas(data['market_cap_usd']);


        document.getElementById('calc-xlm_usd').value = data['xlm_usd'];
        document.getElementById('calc-xlm_eur').value = data['xlm_eur'];
        document.getElementById('calc-xlm_btc').value = data['xlm_btc'];
        document.getElementById('calc-btc_usd').value = data['btc_usd'];

        document.getElementById('calc-top-input').value = 5000;
        document.getElementById('calc-bottom-input').value = (data['xlm_usd'] * 5000).toFixed(4);

        document.getElementById('opt_top').value    = "XLM";
        document.getElementById('opt_bottom').value = "USD";

    });
}

function calculatePrice(e) {
    var xlm_usd = parseFloat(document.getElementById("calc-xlm_usd").value);
    var xlm_btc = parseFloat(document.getElementById("calc-xlm_btc").value);
    var btc_usd = parseFloat(document.getElementById("calc-btc_usd").value);
    var x = parseFloat(document.getElementById(e).value);
    var top = document.getElementById("opt_top").value;
    var bottom = document.getElementById("opt_bottom").value;
    if (x.length != 0 && isNaN(x) == false) {
        if (e == "calc-top-input") {
            toField = "calc-bottom-input";
            if (top == "USD" && bottom == "USD") {
                var sum = x
            }
            if (top == "USD" && bottom == "XLM") {
                var sum = x / xlm_usd
            }
            if (top == "USD" && bottom == "BTC") {
                var sum = x / btc_usd
            }
            if (top == "XLM" && bottom == "USD") {
                var sum = x * xlm_usd
            }
            if (top == "XLM" && bottom == "XLM") {
                var sum = x
            }
            if (top == "XLM" && bottom == "BTC") {
                var sum = x * xlm_btc
            }
            if (top == "BTC" && bottom == "XLM") {
                var sum = x / xlm_btc
            }
            if (top == "BTC" && bottom == "USD") {
                var sum = x * btc_usd
            }
            if (top == "BTC" && bottom == "BTC") {
                var sum = x
            }
        }
        if (e == "calc-bottom-input") {
            toField = "calc-top-input";
            if (top == "USD" && bottom == "USD") {
                var sum = x
            }
            if (top == "USD" && bottom == "XLM") {
                var sum = x * t
            }
            if (top == "USD" && bottom == "BTC") {
                var sum = x * xlm_usd
            }
            if (top == "XLM" && bottom == "USD") {
                var sum = x / xlm_usd
            }
            if (top == "XLM" && bottom == "XLM") {
                var sum = x
            }
            if (top == "XLM" && bottom == "BTC") {
                var sum = x / xlm_btc
            }
            if (top == "BTC" && bottom == "XLM") {
                var sum = x * xlm_btc
            }
            if (top == "BTC" && bottom == "USD") {
                var sum = x / btc_usd
            }
            if (top == "BTC" && bottom == "BTC") {
                var sum = x
            }
        }
        document.getElementById(toField).value = sum.toFixed(8);
    }
}

function change_opt(a, b){
    document.getElementById('label_'+a).innerHTML = b;
    document.getElementById('opt_'+a).value = b;
    if(a == 'top'){
    	calculatePrice('calc-bottom-input');
    } else{
    	calculatePrice('calc-top-input');
    }
}
