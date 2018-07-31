

function assets(address) {
	var server = new StellarSdk.Server('https://horizon.stellar.org');

	app.payments_sent = 0;
	app.payments_received = 0;

	//calc total payments (limit 200 right now)
	server.payments().forAccount(address).limit(200).call().then(function (account) {
		var paymentArr = account.records;
		//console.log(paymentArr);

		console.log(paymentArr.length);

		for(var i = 0; i < paymentArr.length; i++){

			var payment = paymentArr[i];

			if(payment.from == address) {
				app.payments_sent++
			} else {
				app.payments_received++;
			}
		}
	});


	var horizonUrl = 'https://horizon.stellar.org/accounts/' + address + '/trades?limit=200';

	//calc total trades (limit 200 right now)
	$.ajax({
        url: horizonUrl,
        success: function(account) {
        	app.trades_completed = account._embedded.records.length;
        	console.log(app.trades_completed);

        	var tradesArr = account._embedded.records;

        	var assetObj = {};
         	//console.log("Printing Trade Records");
         	//console.log(tradesArr);

        	for(var i = 0; i < tradesArr.length; i++) {
	         	//console.log("next transaction");
	        	//console.log(transactionsArr[i]);

	        	var trade = tradesArr[i];

		        // check base asset type
		        var baseAsset;
		        if(trade.base_asset_code) {
		            baseAsset = trade.base_asset_code;
		        } else {
		            baseAsset = trade.base_asset_type;
		        }

		        // check counter asset type
		        var counterAsset;
		        if(trade.counter_asset_code) {
		            counterAsset = trade.counter_asset_code;
		        } else {
		            counterAsset = trade.counter_asset_type;
		        }

		        //check for native asset
		        if(baseAsset == "native"){
		          baseAsset = "XLM";
		        }
		        if(counterAsset == "native"){
		          counterAsset = "XLM";
		        }


		        //tally assets
		        if(assetObj[baseAsset]) {
		        	assetObj[baseAsset] += 1;
		        } else {
		        	assetObj[baseAsset] = 1;
		        }

		        if(assetObj[counterAsset]) {
		        	assetObj[counterAsset] += 1;
		        } else {
		        	assetObj[counterAsset] = 1;
		        }
		    }

		    var most_traded = "";
		    var biggestCount = 0;
		    var data = {};
		    var datasets = [];
		    var innerData = [];
		    var backgroundColor = [];
		    var labels = [];
		    var colour = "";


		    console.log(assetObj);
		    for (var key in assetObj) {
		    	var count = assetObj[key];
		    	console.log("printing count value: " + count);

		    	innerData.push(count);
		    	labels.push(key);

		    	if(asset_colours.hasOwnProperty(key)) {
      				colour = asset_colours[key];
      			} else {
      				var x = Math.round(0xffffff * Math.random()).toString(16);
					var y = (6-x.length);
					var z = "000000";
					var z1 = z.substring(0,y);
					colour= "#" + z1 + x;
      			}

      			backgroundColor.push(colour);


		    	if(count > biggestCount) {
		    		most_traded = key;
		    		biggestCount = count;
		    	}

		    }

		    app.most_traded = most_traded;

		    
		    //combine data
		    datasets.push({ data: innerData, backgroundColor: backgroundColor});

		    //data = { datasets: datasets[0], labels: labels };

		    data = {
			    datasets: [{
			        data: innerData,
			        backgroundColor: backgroundColor
			    }],

			    // These labels appear in the legend and in the tooltips when hovering different arcs
			    labels: labels
			};

			console.log("Printing trades chart data");
		    console.log(data);

		    $('#tradesChart').replaceWith('<canvas id="tradesChart"></canvas>');

		    var ctx = $("#tradesChart");

		    ctx.height = 350;
		    ctx.width = 350;

		    var myPieChart = new Chart(ctx,{
			    type: 'pie',
			    data: data,
			    options: {
					responsive: true,
					maintainAspectRatio: false
				}
			});

 		}
    });

	server.accounts().accountId(address).call().then(function (account) {

		var data = {};
	    var datasets = [];
		//console.log(account);
		document.getElementById('address').innerHTML = account.account_id;
		
		//var account_tabs = '<ul role="tablist" class="nav nav-tabs" id="account-tabs"><li role="presentation" class="nav-item active"><a id="account-tabs-tab-balances" class="nav-link active" data-toggle="tab" role="tab" aria-controls="account-tabs-pane-balances" aria-selected="true" href="#balances">Balances</a></li><li role="presentation" class="nav-item"><a id="account-tabs-tab-payments" class="nav-link" href="#payments_tab" data-toggle="tab" role="tab" aria-controls="account-tabs-pane-payments" tabindex="-1" aria-selected="false">Payments</a></li><li role="presentation" class="nav-item"><a id="account-tabs-tab-offers" class="nav-link" href="#offers" data-toggle="tab" role="tab" aria-controls="account-tabs-pane-offers" tabindex="-1" aria-selected="false">Offers</a></li><li role="presentation" class="nav-item"><a id="account-tabs-tab-trades" href="#tab_trades" data-toggle="tab" role="tab" aria-controls="account-tabs-pane-trades" tabindex="-1" aria-selected="false" href="#">Trades</a></li><li role="presentation" class="nav-item"><a id="account-tabs-tab-operations" data-url="?action=operations" role="tab" aria-controls="account-tabs-pane-operations" tabindex="-1" aria-selected="false" href="#">Operations</a></li><li role="presentation" class="nav-item"><a id="account-tabs-tab-transactions" data-url="?action=transactions" role="tab" aria-controls="account-tabs-pane-transactions" tabindex="-1" aria-selected="false" href="#">Transactions</a></li></ul><div class="tab-content"><div id="balances" class="tab-pane active"></div><div id="payments_tab" class="tab-pane fade"></div><div id="operations" class="tab-pane fade"></div></div>';	
		//document.getElementById('account-menu').innerHTML = account_tabs;

		var assets_table = '<table class="table table-dark table-hover table-condensed"><thead><tr><th class="text-center active col-sm-2">Code</th><th class="text-center active col-sm-2">Balance</th></tr></thead><tbody>';

		app.buildPieChart(account.balances);

		for(var row in account.balances) {
			var asset = account.balances[row];

			var code;
			var usd_value = 0;
			var asset_id = "";
			var ajax;

			console.log(asset);

			
			if(asset.asset_code) {
	            code = asset.asset_code;
	        } else {
	        	if(asset.asset_type == "native") {
	        		code = "XLM";
	        	} else {
	        		code = asset.asset_type;
	        	}      
	        }

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

		$( document ).ajaxComplete(function(event, xhr, settings) {
			//console.log(event);
			//console.log("num of requests so far: " + app.num_assets);
			//console.log("num total requests expected: " + app.num_expected);
		    if(app.num_assets == app.num_expected) {
		    	console.log("building pie chart");
		    	console.log(app.innerData);
		    	//combine data
			    datasets.push({ data: app.innerData, backgroundColor: app.backgroundColor});

			    //data = { datasets: datasets[0], labels: labels };

			    data = {
				    datasets: [{
				        data: app.innerData,
				        backgroundColor: app.backgroundColor
				    }],

				    // These labels appear in the legend and in the tooltips when hovering different arcs
				    labels: app.labels
				};

			    console.log(data);

			    $('#myChart').replaceWith('<canvas id="myChart"></canvas>');
			     $('.chartjs-size-monitor').remove();


			    var ctx = $("#myChart");

			    ctx.height = 350;
			    ctx.width = 350;

			    var myPieChart = new Chart(ctx,{
				    type: 'pie',
				    data: data,
				    options: {
						responsive: true,
						maintainAspectRatio: false
					}
				});
			 }
		});



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
		//console.log("printing account records");
		var paymentArr = account.records;
		//console.log(paymentArr);
		for(var i = 0; i < paymentArr.length; i++){
			//console.log("next loop");
			//console.log(paymentArr[i]);
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


		if(paymentArr.length < 1){
  		   payments_table += '</tbody></table><p class="text-center">There are no payments to show for this account</p></div>'
  		}
  		else{
  		   payments_table += '</tbody></table></div>';
  		}

		document.getElementById('payments_tab').innerHTML = payments_table;

	    return '';
  	}).catch(function (err) {
  		if(err.message.status == 404){
  			
  		}
  		console.log(err);
    	console.error(err);
  	});


  	/**** Offers Tab Data ****/
  	server.offers('accounts', address).call().then(function (account) {
    

    var offers_table = '<table id="offer-table" class="table table-dark table-hover table-condensed"><thead><tr><th id="offers-buy">Buy Asset</th><th id="offers-sell">Sell Asset</th><th id="offers-amount">Amount</th><th id="offers-price">Price</th></tr></thead><tbody>'
    var offersArr = account.records;

    //console.log("printing offers records");
    //console.log(offersArr);

     for(var i = 0; i < offersArr.length; i++){
  		// 	console.log("next offer");
  		// 	console.log(offersArr[i]);

  		 	var offer = offersArr[i];


  		 	var amount = offer.amount;
  		 	var price = offer.price;

  		 	//buy asset
  		 	var buyType;

  		 	if(offer.buying.asset_code){
  		 		buyType = offer.buying.asset_code;
  		 	}else{
  		 		buyType = offer.buying.asset_type;
  		 	}

  		 	//sell type
  		 	var sellType;

  		 	if(offer.selling.asset_code){
  		 		sellType = offer.selling.asset_code;
  		 	}else{
  		 		sellType = offer.selling.asset_type;
  		 	}

  		 	if(sellType == "native"){
  		 		sellType = "XLM";
  		 	}

  		 	if(buyType == "native"){
  		 		buyType = "XLM";
  		 	}

  		 	offers_table += '<tr><td class="text-center"><b>' + buyType + '</b></td><td class="text-center"><b>' + sellType + '</b></td><td class="text-center"><b>' + amount + '</b></td><td class="text-center"><b>' + price + '</b></td></tr>';
	
  		 }

  		 if(offersArr < 1){
  		 	offers_table += '</tbody></table><p class="text-center">There are no offers to show for this account</p></div>'
  		 }
  		 else{
  		 	offers_table += '</tbody></table></div>';
  		 }
  		 
  		 
		 document.getElementById('offers_tab').innerHTML = offers_table;

  }).catch(function (err) {

    if(err.message.status == 404){
  			
  		}
  		console.log(err);
    	console.error(err);
  });


  	/**** Trades Tab Data ****/

    horizonUrl = 'https://horizon.stellar.org/accounts/' + address + '/trades';
    
    $.ajax({
        url: horizonUrl,
        success: function(account){

         var trades_table = '<table id="trade-table" class="table table-dark table-hover table-condensed"><thead><tr><th id="trades-info">Trade Information</th><th id="trades-time">Time</th></tr></thead><tbody>'

         //var tradesArr = [];
         var tradesArr = account._embedded.records;

         //console.log("Printing Trade Records");
         //console.log(tradesArr);

         for(var i = 0; i < tradesArr.length; i++){
          //console.log("next transaction");
          //console.log(transactionsArr[i]);

         var trade = tradesArr[i];


        // check base asset type
        var baseAsset;
        if(trade.base_asset_code) {
                baseAsset = trade.base_asset_code;
        } else {
                baseAsset = trade.base_asset_type;
        }

        // check counter asset type
        var counterAsset;
        if(trade.counter_asset_code) {
                counterAsset = trade.counter_asset_code;
        } else {
                counterAsset = trade.counter_asset_type;
        }

        //check for native asset
        if(baseAsset == "native"){
          baseAsset = "XLM";
        }
        if(counterAsset == "native"){
          counterAsset = "XLM";
        }

         var description = "[" + trade.base_account.substring(0,4) + "] " + trade.base_amount.substring(0,6) + " " + baseAsset   + " FOR " +  trade.counter_amount.substring(0,6) + " " + counterAsset + " [" + trade.counter_account.substring(0,4) + "] ";
         var time = trade.ledger_close_time;
          //var type = trade.type;
            

        trades_table += '<tr><td class="text-center"><b>' + description + '</b></td><td class="text-center"><b>' + time + '</b></td></tr>';
            

         }
        
         if(tradesArr < 1){
            trades_table += '</tbody></table><p class="text-center">There are no Trades to show for this account</p></div>'
         }
         else{
            trades_table += '</tbody></table></div>';
         }

          
        document.getElementById('trades_tab').innerHTML = trades_table;



        }
    });
  	// server.transactions().forAccount(address).call().then(function (account) {

  // 		var trades_table = '<table id="trade-table" class="table table-dark table-hover table-condensed"><thead><tr><th id="trades-info">Trade Information</th><th id="trades-time">Time</th></tr></thead><tbody>'

  // 		var tradesArr = [];
  // 		//var tradesArr = account.records;

  // 		//console.log("Printing Trade Records");
  // 		//console.log(tradesArr);

  // 		// for(var i = 0; i < tradesArr.length; i++){
  // 		// 	//console.log("next transaction");
  // 		// 	//console.log(transactionsArr[i]);

  // 		// 	var trade = tradesArr[i];


  // 		// 	//var type = trade.type;
  			

  // 		// 	//trades_table += '<tr><td class="text-center"><b>' + [type] + '</b></td><td class="text-center"><b>' + [type1] + '</b></td><td class="text-center"><b>' + [type2] + '</b></td></tr>';
  			

  // 		// }
    
  // 		if(tradesArr < 1){
  // 		   trades_table += '</tbody></table><p class="text-center">There are no Trades to show for this account</p></div>'
  // 		}
  // 		else{
  // 		   trades_table += '</tbody></table></div>';
  // 		}

  		
		// document.getElementById('trades_tab').innerHTML = trades_table;

  // }).catch(function (err) {
  //   if(err.message.status == 404){
  			
  // 		}
  // 		console.log(err);
  //   	console.error(err);
  // });
//////////////////////////////////////////////////////


  	/**** Operations Tab Data ****/

  		server.operations().forAccount(address).call().then(function (account) {

  		var operations_table = '<table id="operation-table" class="table table-dark table-hover table-condensed"><thead><tr><th id="operations-account">Account</th><th id="operations-operation">Operation</th><th id="operations-transaction">Transaction</th><th id="operations-time">Time</th></tr></thead><tbody>';

  		var operationsArr = account.records;

  		//console.log("Printing operation Records");
  		//console.log(operationsArr);

  		for(var i = 0; i < operationsArr.length; i++){
  			//console.log("next operation");
  			//console.log(transactionsArr[i]);

  			var operation = operationsArr[i];


  			var time = operation.created_at;
  			var accountID = operation.source_account.substring(0,4);
  			var operationType = operation.type;
  			var transaction= operation.transaction_hash.substring(0,4);

  			

  			operations_table += '<tr><td class="text-center"><b>' + accountID + '</b></td><td class="text-center"><b>' + operationType + '</b></td><td class="text-center"><b>' + transaction + '</b></td><td class="text-center"><b>' + time + '</b></td></tr>';
  			

  		}

  		if(operationsArr < 1){
  		   operations_table += '</tbody></table><p class="text-center">There are no operations to show for this account</p></div>'
  		}
  		else{
  		   operations_table += '</tbody></table></div>';
  		}

		document.getElementById('operations_tab').innerHTML = operations_table;

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

  		//console.log("printing transaction records");
  		//console.log(transactionsArr);

  		for(var i = 0; i < transactionsArr.length; i++){
  			//console.log("next transaction");
  			//console.log(transactionsArr[i]);

  			var transaction = transactionsArr[i];


  			var fee = transaction.fee_paid;
  			var id_hash = transaction.hash.substring(0,4);
  			var time = transaction.created_at;

  			transactions_table += '<tr><td class="text-center"><b>' + id_hash + '</b></td><td class="text-center"><b>' + fee + '</b></td><td class="text-center"><b>' + time + '</b></td></tr>';
  			

  		}

  		if(transactionsArr.length < 1){
  		   transactions_table += '</tbody></table><p class="text-center">There are no transactions to show for this account</p></div>'
  		}
  		else{
  		   transactions_table += '</tbody></table></div>';
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

