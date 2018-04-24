



var asset_colours = {
  "native": "#0eb9e9", //#0eb9e9
  "XLM": "#0FF",
  "BTC": "#FF9900", //orangish
  "ETH": "#ecf0f1", //light gray
  "XRP": "#178bc2", //middle of logo blue
  "LTC": "#d3d3d3", //lighter gray
  "USDT": "#22a079", //some kind of green
  "ADA": "#2a71d0", // blue
  "NEO":"#58bf00", //green
  "IOTA": "#a3a3a3", //light gray?
  "XMR": "#f26822", //orange
  "OTHER": "#FF0" //red for now
}

var messageList = []; //list of all requests



/* raycaster */
var light = new THREE.DirectionalLight( 0xffffff, 1 );
light.position.set( 1, 1, 1 ).normalize();
scene.add( light );

document.addEventListener( 'mousemove', onDocumentMouseMove, false );
document.addEventListener( 'mousedown', onDocumentMouseDown, false);
window.addEventListener( 'resize', onWindowResize, false );

function onWindowResize() 
{
        var aspect = window.innerWidth / window.innerHeight;
        camera.left   = - frustumSize * aspect / 2;
        camera.right  =   frustumSize * aspect / 2;
        camera.top    =   frustumSize / 2;
        camera.bottom = - frustumSize / 2;
        camera.updateProjectionMatrix();
        renderer.setSize( window.innerWidth, window.innerHeight );
}
function onDocumentMouseMove( event ) 
{
        event.preventDefault();
        mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
        mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
}
function onDocumentMouseDown(event)
{
  raycaster.setFromCamera( mouse, camera );
      var intersects = raycaster.intersectObjects( scene.children );
      if ( intersects.length > 0 ) 
      {
        if ( INTERSECTED != intersects[ 0 ].object ) 
        {
          if ( INTERSECTED ) INTERSECTED.material.color.setHex( INTERSECTED.currentHex );
          INTERSECTED = intersects[ 0 ].object;
          INTERSECTED.currentHex = INTERSECTED.material.color.getHex();
          INTERSECTED.material.color.setHex( 0xff0000 );
          console.log(intersects.length);

         


           var length= 0;
           var dir = camera.position.clone().sub(intersects[0].point).normalize();
           camera.position = intersects[0].point.clone().add(dir);
           camera.lookAt(intersects[0].point);

           // will add if for if ledger
           var message = tripManager.trips.find( t => t.line.id === INTERSECTED.id || t.line2.id === INTERSECTED.id).message;

           
           if(message) {
            showRequest(message);
           }

            

// envelope_xdr
// fee_meta_xdr
// hash
//    id         
// ledger_attr
// paging_token
            //S$("#description").append();



            //var result = _.findWhere(tripManager.trips, {line.id: INTERSECTED.id});


        }
      } 
      else 
      {
        if ( INTERSECTED ) INTERSECTED.material.color.setHex( INTERSECTED.currentHex );
        INTERSECTED = null;
            //maybe only hide on button click?
            //$("#description").hide();
           
      }
}

function showRequest(message) {
// var desc = document.getElementById("description");
  // desc.style.display == "block";
  var elem = document.getElementById("description_lines");
  elem.innerHTML = "";

  $("#description").show();
  var info = "";
  /*
  info += "<h3>Source</h3><p>" + message.source_account + "</p>";
  info += "<h3>Date</h3><p>" + message.created_at + "</p>";
  info += "<h3>Ledger</h3><p>" + message.ledger_attr + "</p>";
  info += "<h3>envelope_xdr</h3><p>" + "blah blah blah these are too long" +"</p>";
  info += "<h3>fee_meta_xdr</h3><p>" + "blah blah blah these are too long" + "</p>"
  info += "<h3>hash</h3><p>" + message.hash +"</p>";
  info += "<h3>ledger_attr</h3><p>" + message.ledger_attr+ "</p>";
  info += "<h3>paging_token</h3><p>" + message.paging_token +"</p>";*/
  info += "<h3>Request Type</h3><p>" + message.type + "</p>";

  info += "<h3>Source Wallet</h3><p>" + message.source_account + "</p>";

  if(message.type == "payment") {
    info += "<h3>Destination Wallet</h3><p>" + message.to + "</p>";
    info += "<h3>Date</h3><p>" + message.created_at + "</p>";
    if(message.asset_code) {
      info += "<h3>Amount</h3><p>" + message.amount + " " + message.asset_code + "</p>";
    } else {
      info += "<h3>Amount</h3><p>" + message.amount + " " + message.asset_type + "</p>";
    }
  }

  if(message.type == "manage_offer") {

    var buying;
    var selling;

    if(message.buying_asset_code) {
      buying = message.buying_asset_code; 
    } else {
      buying = message.buying_asset_type; 
    }
    if(message.selling_asset_code) {
      selling = message.selling_asset_code; 
    } else {
      selling = message.selling_asset_type; 
    }

    if(buying == "native") {
      buying = "XLM";
    }

    if(selling == "native") {
      selling = "XLM";
    }

    var buying_amount = message.amount * message.price;
    buying_amount = Math.round(buying_amount * 100) / 100;

    var selling_amount = Math.round(message.amount * 100) / 100;
    

    
    info += "<h3>Buying Asset</h3><p>" + buying + "</p>";
    info += "<h3>Selling Asset</h3><p>" + selling + "</p>";


    if(message.amount) {
      info += "<h3>Offer Details</h3><p>" + "Buying " + buying_amount + " " + buying + " with " + selling_amount + " " + selling + "<br> at 1 " + selling + " = " + message.price + " " + buying + "</p>";
    }
  }

  info += "<h3>Transaction Hash ID</h3><p>" + message.transaction_hash +"</p>";

  $("#description_lines").append(info);
}






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
    this.stream = this.server.trades()
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


   function loadJSON(callback) {   

    var xobj = new XMLHttpRequest();
        xobj.overrideMimeType("application/json");
    xobj.open('GET', 'operations.json', true); // Replace 'my_data' with the path to your file
    xobj.onreadystatechange = function () {
          if (xobj.readyState == 4 && xobj.status == "200") {
            // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
            callback(xobj.responseText);
          }
    };
    xobj.send(null);  
 }
 

pGeometry.addAttribute( 'position', new THREE.Float32BufferAttribute( [-1,0,0], 3 ) );
pGeometry.addAttribute( 'color', new THREE.Float32BufferAttribute( [0,1,0], 3 ) );

pGeometry.computeBoundingSphere();

point2 = new THREE.Points(pGeometry, pMaterial);

scene.add( line2 );

node2.position.set(0,0,0);
line2.position.set(0,0,0);

scene.add(node2);

//perspective new pos
camera.position.x = -2.5;
camera.position.y = 50;
camera.position.z = 40;

camera.lookAt( scene.position );

var tripManager = new TripManager();

var liveMode = new RequestStream();

$(document).ready(function() {
  $("#transactions").click(function setLiveTransactions() {
    //console.log(liveMode);
    liveMode.transactions();
    $("#transactions").toggleClass('selected');
  });

  $("#payments").click(function setLivePayments() {
    liveMode.payments();
    $("#payments").toggleClass('selected');
  });

  $("#operations").click(function setLiveOperations() {
    liveMode.operations();
    $("#operations").toggleClass('selected');
  });

  $("#trades").click(function setLiveTrades() {
    liveMode.trades();
    $("#trades").toggleClass('selected');
  });

  $("#effects").click(function setLiveEffects() {
    liveMode.effects();
    $("#effects").toggleClass('selected');
  });


  var aList = $('#asset-list');
  $.each(asset_colours, function(asset, colour)
  {
      var li = $('<li/>').text(asset)
          .appendTo(aList);
      var aaa = $('<span/>')
          .css('background-color', colour)
          .appendTo(li);
  });

  $('#request-list').on('click','li',function (){
    console.log($(this).html());
    var msgID = $(this).html();

    var request = findReq(msgID);

    showRequest(request);
  });

});

function findReq(msgID) {
  for (var i = 0, len = messageList.length; i < len; i++) {
    if (messageList[i].id === msgID)
      return messageList[i]; // Return as soon as the object is found
    }
  return null; // The object was not found
}

function animate() {
  requestAnimationFrame( animate );

    


  if(tripManager) {
    if(tripManager.hasTrips()) {
      tripManager.travel();
    }
  }

  node2.rotation.y += 0.01;
  line2.rotation.y += 0.01;
  //render();
  renderer.render( scene, camera );
  
  //renderer.render( scene, camera );
}

animate();



$(document).ready(function() {
  var shootingStarObj = new ShootingStar("body");
  shootingStarObj.launch();
});