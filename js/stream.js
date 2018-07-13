function RequestStream() {

  this.server = new StellarSdk.Server('https://horizon.stellar.org');

  /*
  this.stream = this.server.transactions()
  .cursor('now')
  .stream({
    onmessage: function (message) {
      //console.log(message);
      console.log("initial transactions stream");
      tripManager.addTrip(new Trip(node2.position, message));
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
        //console.log(message);;
        var transaction = new Object();
        transaction.name = "transaction";
        tripManager.addTrip(new Trip(node2.position));
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
        var payment = new Object();
        payment.name = "payment";
        if(message.asset_code) {
          payment.asset = message.asset_code; 
        } else if(message.asset_type) {
          payment.asset = message.asset_type; 
        }

        tripManager.addTrip(new Trip(node2.position, payment,  message));
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
        var trade = new Object();
        trade.name = "trade";
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
        //console.log(trade);
        tripManager.addTrip(new Trip(node2.position, trade, message));
      }
    });
  },
  trades: function () {
    //this.es.close();
    this.stream = this.server.trades().cursor('now')
    .stream({
      onmessage: function (message) {
        //console.log(message);
        var trade = new Object();
        trade.name = "trade";
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
        //console.log(trade);
        tripManager.addTrip(new Trip(node2.position));
      }
    });
  },
  effects: function () {
    //this.es.close();
    this.stream = this.server.effects()
    .cursor('now')
    .stream({
      onmessage: function (message) {
        //console.log(message);
       //console.log("effects stream");
        tripManager.addTrip(new Trip(node2.position, message));
      }
    });
  }

}