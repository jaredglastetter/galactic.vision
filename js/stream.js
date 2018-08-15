function RequestStream() {

  this.server = new StellarSdk.Server('https://horizon.stellar.org');

  /*
  this.stream = this.server.transactions()
  .cursor('now')
  .stream({
    onmessage: function (message) {
      //console.log(message);
      console.log("initial transactions stream");
      tripManager.addTrip(new Trip(centerNode.position, message));
    }
  });*/

  //console.log(this.es);
}


RequestStream.prototype = {
  constructor: RequestStream,
  transactions:function ()  {
    //this.es.close();

    this.stream = this.server.transactions()
    .cursor('now')
    .stream({
      onmessage: function (message) {
        //console.log(message);
        //var account = message.source_account;
        
        var transaction = new Object();
        transaction.name = "transaction";
        if(!app.accountView && $("#transactions_stream").hasClass("selected") && activeWindow) {
          tripManager.addTrip(new Trip(centerNode.position));
        }
      }
    });
  },
  payments: function () {
    //this.stream.close();
    this.stream = this.server.payments()
    .cursor('now')
    .stream({
      onmessage: function (message) {
        //console.log(message);
        //only send if it is a payment
        if(message.type == "payment") {
          var payment = new Object();
          payment.name = "payment";
          if(message.asset_code) {
            payment.asset = message.asset_code; 
          } else if(message.asset_type) {
            payment.asset = message.asset_type; 
          }

          if(!app.accountView && $("#payments_stream").hasClass("selected") && activeWindow) {
            tripManager.addTrip(new Trip(centerNode.position, payment,  message));
          }
        }
      }
    });
  },
  operations: function () {
    //this.es.close();
    this.stream = this.server.operations()
    .cursor('now')
    .stream({
      onmessage: function (message) {
        //console.log(message);
        //console.log("hi")
        //test account info
        //var account = message.from;
        //console.log(account);
        //console.log(this.server.accounts(account));
        if(globalView) {
          var trade = new Object();
          trade.name = "trade";
          if(message.asset_code != "DRA") {
            if(message.buying_asset_code) {
              trade.asset = message.buying_asset_code; 
            } else {
              trade.asset = message.buying_asset_type; 
            }
            if(message.selling_asset_code) {
              trade.asset2 = message.selling_asset_code; 
            } else {
              trade.asset2 = message.selling_asset_type; 
            }
          }
          //console.log(trade);
          if(!app.accountView && $("#operations_stream").hasClass("selected") && activeWindow) {
            tripManager.addTrip(new Trip(centerNode.position, trade, message));
          }
        }
      }
    });
  },
  trades: function () {
    setInterval(function() {
      liveMode.getTrades();
    }, 2000);

  },
  getTrades: function () {
    //manual stream 
    var tradesUrl = "https://horizon.stellar.org/trades?order=desc";
    var currentTime;
    var lastTrade;
    var lastRecord;
    var newTrades;


    $.ajax({
      url: tradesUrl,

      success: function(trades) {

        var newTrades;
        var allTrades;

        trades = trades._embedded.records;

        var count = app.trades.length;

        if(app.trades.length == 0) {
          app.trades = app.trades.concat(trades);
          app.numTrades = app.trades.length - count;
          newTrades = app.trades;
        } else {
          app.trades = app.trades.concat(trades);
          allTrades = _.uniq(app.trades, 'id');

          app.trades = allTrades;

          app.numTrades = app.trades.length - count;
          newTrades = allTrades.slice(allTrades.length - app.numTrades - 1,  allTrades.length - 1)

          app.currTrades = newTrades;
        }

        for(var i = 0; i < newTrades.length; i++) {
          newTrades[i].type = "trade";
          //setup trade object
          var trade = new Object();
          trade.name = "trade";

          if(newTrades[i].counter_amount > 0.0001) {
            if(newTrades[i].buying_asset_code) {
              trade.asset = newTrades[i].base_asset_code; 
            } else {
              trade.asset = newTrades[i].base_asset_type; 
            }
            if(newTrades[i].selling_asset_code) {
              trade.asset2 = newTrades[i].counter_asset_code; 
            } else {
              trade.asset2 = newTrades[i].counter_asset_type; 
            }


            if($("#trades_stream").hasClass("selected")){
              tripManager.addTrip(new Trip(centerNode.position, trade, newTrades[i]));
            }
            
          }
        }

        //console.log("num of trades inserted: " + app.numTrades);
        //console.log("Inserting: " + newTrades.length + " new trades");
        //console.log("Total trades: " + allTrades.length);
      }
      
    });
  },
  effects: function () {
    //this.es.close();
    this.stream = this.server.effects()
    .cursor('now')
    .stream({
      onmessage: function (message) {
        console.log(message);
       //console.log("effects stream");
        if(!app.accountView && $("#effects_stream").hasClass("selected") && activeWindow) {
          tripManager.addTrip(new Trip(centerNode.position));
        }
      }
    });
  }

}