var scene = new THREE.Scene();
var frustumSize = 15;
var aspect = window.innerWidth / window.innerHeight;


//var camera = new THREE.OrthographicCamera( frustumSize * aspect / - 2, frustumSize * aspect / 2, frustumSize / 2, frustumSize / - 2, 1, 2000 );
var camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 1000 );

var renderer = new THREE.WebGLRenderer( { alpha: true } );
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

var controls = new THREE.OrbitControls( camera );

controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
controls.dampingFactor = 0.25;
controls.panningMode = THREE.HorizontalPanning; // default is THREE.ScreenSpacePanning
controls.minDistance = 0;
controls.maxDistance = 500
controls.maxPolarAngle = Math.PI / 2;

var geometry = new THREE.SphereGeometry(0.5, 8, 8);
var geometry2 = new THREE.SphereGeometry(0.25, 8, 8);
var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
var material2 = new THREE.MeshBasicMaterial( { color: 0xff0000 } );


//var node = new THREE.Mesh( geometry, material );
var node2 = new THREE.Mesh( geometry, material );
//var node3 = new THREE.Mesh( geometry, material );

var edges = new THREE.EdgesGeometry( geometry2 );
var line = new THREE.LineSegments( edges, new THREE.LineBasicMaterial( { color: 0x000000 } ) );

var edges2 = new THREE.EdgesGeometry( geometry );
var line2 = new THREE.LineSegments( edges2, new THREE.LineBasicMaterial( { color: 0x000000 } ) );

var edges3 = new THREE.EdgesGeometry( geometry );
var line3 = new THREE.LineSegments( edges, new THREE.LineBasicMaterial( { color: 0x000000 } ) );

var pGeometry = new THREE.BufferGeometry();
var color = new THREE.Color();
var pMaterial = new THREE.PointsMaterial( { size: 0.05, vertexColors: THREE.VertexColors } );
var particles, particle, particleCount = 0;
var points;
var point2;

var asset_colours = {
  "native": "#0eb9e9",
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


//Trip manager object to manage trips and remove trips when lerp is complete -> controls animation
function TripManager() {
  this.trips = []; //array of trips
}

TripManager.prototype = {
	    constructor: TripManager,
	    travel:function ()  {
        var newTrips = this.trips; //will replace trips copy at end of function

          this.trips.forEach(function(trip) {
            var index;
            trip.travel();
            if(trip.alpha >= 1 && trip.processed) {
              trip.remove();
              newTrips = _.without(newTrips, trip);
            }
          });

          this.trips = newTrips;
	    },
      addTrip: function (trip) {
        this.trips.push(trip);
      },
      hasTrips: function () {
        if(this.trips) {
          return true;
        } else {
          return false;
        }
      }
	}

//Trip javascript object function

function Trip(ledger, request) {
  //Three js objects
  this.startNode = new THREE.Mesh( geometry2, material );
  this.endNode = new THREE.Mesh( geometry2, material2 );

  this.edges = new THREE.EdgesGeometry( geometry2 );
  this.line = new THREE.LineSegments( this.edges, new THREE.LineBasicMaterial( { color: 0x000000 } ) );
  this.edges2 = new THREE.EdgesGeometry( geometry2 );
  this.line2 = new THREE.LineSegments( this.edges, new THREE.LineBasicMaterial( { color: 0x000000 } ) );

  var colour;

  if(request) {
    
    console.log(asset_colours);
    console.log(request.asset);


    if(asset_colours.hasOwnProperty(request.asset)) {
      console.log(request.asset);
      console.log(asset_colours[request.asset]);
      colour = asset_colours[request.asset];

      this.aMaterial = new THREE.PointsMaterial( { size: 0.05, color: colour } );
    } else {
      this.aMaterial = new THREE.PointsMaterial( { size: 0.05, color: 0x00FF00 } );
    }
    this.payload = new THREE.Points(pGeometry, this.aMaterial);
  } else {
    this.payload = new THREE.Points(pGeometry, pMaterial);
  }

  /*
  if(request.name == "operation") {
    //1st asset
    this.payload = new THREE.Points(pGeometry, pMaterial);


    //assign asset color to point

    //2nd asset
    this.payload2 = new THREE.Points(pGeometry, pMaterial);

  }*/

  //randomize initial pos

  var angle = Math.random() * Math.PI*2;
  var radius = Math.random() * 5 + 4;

  var x1 = Math.cos(angle) * radius;
  var y1 = Math.random() * 5 - 2.5;
  var z1 = Math.sin(angle) * radius;

  var angle2 = Math.random() * Math.PI*2;
  var radius2 = Math.random() * 5 + 4;

  var x2 = Math.cos(angle2) * radius2;
  var y2 = Math.random() * 5 - 2.5;
  var z2 = Math.sin(angle2) * radius2;

  this.startNode.position.set(x1,y1,z1);
  this.line.position.set(x1,y1,z1);

  this.endNode.position.set(x2,y2,z2);
  this.line2.position.set(x2,y2,z2);

  this.payload.position.set(-1,0,0);

  scene.add( this.startNode );
  scene.add( this.endNode);
  scene.add( this.line );
  scene.add( this.line2 );  
  scene.add( this.payload );

  //data
  //this.startPos = this.startNode.position;
  //this.endPos = this.endNode.position;
  this.payloadPos = this.payload.position;
 // if(this.payload2) {
    //this.payloadPos2 = this.payload2.position;
  //}
  this.ledger = ledger;
  this.alpha = 0;
  this.alpha2 = 0; //2nd asset
  this.rate = Math.random() / 25;
  this.processed = false; //keeps track of status of trip false -> going to ledger true -> traveling to destination 
  this.processed2 = false;

  //inner trip management -> swap with ledger -> endPos once first trip complete
  this.v1 = this.startNode.position;
  this.v2 = this.ledger;
  this.v3 = this.endNode.position;
  this.v4 = this.ledger;
}

Trip.prototype = {
	    constructor: Trip,
	    travel:function ()  {
          this.alpha += this.rate;
	        this.payloadPos.lerpVectors(this.v1, this.v2, this.alpha);
          if(this.alpha >= 1 && !this.processed) {
            //switch trip to endpoint
            this.alpha = 0;
            this.v1 = this.ledger;
            this.v2 = this.endNode.position;
            this.processed = true;
          }
          /*
          if(this.payload2) {
            this.payloadPos2.lerpVectors(this.v3, this.v4, this.alpha);
            if(this.alpha2 >= 1 && !this.processed) {
              //switch trip to endpoint
              this.alpha2 = 0;
              this.v3 = this.ledger;
              this.v4 = this.startNode.position;
              this.processed2 = true;
            }
          }*/
	    },
      remove:function () {
        scene.remove(this.startNode);
        scene.remove(this.endNode);
        scene.remove(this.payload);
        scene.remove(this.line);
        scene.remove(this.line2);
      }
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
        tripManager.addTrip(new Trip(node2.position));
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
        console.log(message);
        console.log("transactions stream");
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
        console.log(message);

        var payment = new Object();
        payment.name = "payment";
        if(message.asset_code) {
          payment.asset = message.asset_code; 
        } else if(message.asset_type) {
          payment.asset = message.asset_type; 
        }

        console.log("payments stream");
        tripManager.addTrip(new Trip(node2.position, payment));
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
        console.log(trade);
        tripManager.addTrip(new Trip(node2.position, trade));
      }
    });
  },
  trades: function () {
    //this.es.close();
    this.stream = this.server.trades()
    .stream({
      onmessage: function (message) {
        console.log(message);
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
        console.log(trade);
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
        console.log(message);
       console.log("effects stream");
        tripManager.addTrip(new Trip(node2.position));
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

//ortho
camera.position.x = -2.5;
camera.position.y = 7.5;
camera.position.z = 5;

//perspective
/*
camera.position.x = 0;
camera.position.y = 20;
camera.position.z = 20;*/

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
    //console.log(liveMode);
    liveMode.payments();
    $("#payments").toggleClass('selected');
  });

  $("#operations").click(function setLiveOperations() {
    //console.log(liveMode);
    liveMode.operations();
    $("#operations").toggleClass('selected');
  });

  $("#trades").click(function setLiveTrades() {
    //console.log(liveMode);
    liveMode.trades();
    $("#trades").toggleClass('selected');
  });

  $("#effects").click(function setLiveEffects() {
   // console.log(liveMode);
    liveMode.effects();
    $("#effects").toggleClass('selected');
  });

});



function animate() {
	requestAnimationFrame( animate );
  
  if(tripManager) {
    if(tripManager.hasTrips()) {
      tripManager.travel();
    }
  }

  node2.rotation.y += 0.01;
  line2.rotation.y += 0.01;
  
	renderer.render( scene, camera );
}

animate();

(function() {

  ShootingStar = function(id) {
      this.n = 0;
      this.m = 0;
      this.defaultOptions = {
        velocity: 8,
        starSize: 10,
        life: 300,
        beamSize: 400,
        dir: -1
      };
      this.options = {};
      id = (typeof id != "undefined") ? id : "";
      this.capa = ($(id).lenght > 0) ? "body" : id;
      this.wW = $(this.capa).innerWidth();
      this.hW = $(this.capa).innerHeight();
    };

    ShootingStar.prototype.addBeamPart = function(x, y) {
      this.n++;
      var name = this.getRandom(100, 1);
      $("#star" + name).remove();
      $(this.capa).append("<div id='star" + name + "'></div>");
      $("#star" + name).append("<div id='haz" + this.n + "' class='haz' style='position:absolute; color:#FF0; width:10px; height:10px; font-weight:bold; font-size:" + this.options.starSize + "px'>·</div>");
      if (this.n > 1) $("#haz" + (this.n - 1)).css({
        color: "rgba(255,255,255,0.5)"
      });
      $("#haz" + this.n).css({
        top: y + this.n,
        left: x + (this.n * this.options.dir)
      });
    }

    ShootingStar.prototype.delTrozoHaz = function() {
      this.m++;
      $("#haz" + this.m).animate({
        opacity: 0
      }, 75);
      if (this.m >= this.options.beamSize) {
        $("#ShootingStarParams").fadeOut("slow");
      }
    }

    ShootingStar.prototype.getRandom = function(max, min) {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    ShootingStar.prototype.toType = function(obj) {
      if (typeof obj === "undefined") {
        return "undefined"; /* consider: typeof null === object */
      }
      if (obj === null) {
        return "null";
      }
      var type = Object.prototype.toString.call(obj).match(/^\[object\s(.*)\]$/)[1] || '';
      switch (type) {
        case 'Number':
          if (isNaN(obj)) {
            return "nan";
          } else {
            return "number";
          }
        case 'String':
        case 'Boolean':
        case 'Array':
        case 'Date':
        case 'RegExp':
        case 'Function':
          return type.toLowerCase();
      }
      if (typeof obj === "object") {
        return "object";
      }
      return undefined;
    }

    ShootingStar.prototype.launchStar = function(options) {
      if (this.toType(options) != "object") {
        options = {};
      }
      this.options = $.extend({}, this.defaultOptions, options);
      this.n = 0;
      this.m = 0;
      var i = 0,
        l = this.options.beamSize,
        x = this.getRandom(this.wW - this.options.beamSize - 100, 100),
        y = this.getRandom(this.hW - this.options.beamSize - 100, 100),
        self = this;
      for (; i < l; i++) {
        setTimeout(function() {
          self.addBeamPart(x, y);
        }, self.options.life + (i * self.options.velocity));
      }
      for (i = 0; i < l; i++) {
        setTimeout(function() {
          self.delTrozoHaz()
        }, self.options.beamSize + (i * self.options.velocity));
      }
      $("#ShootingStarParams").html("Launching shooting star. PARAMS: wW: " + this.wW + " - hW: " + this.hW + " - life: " + this.options.life + " - beamSize: " + this.options.beamSize + " - velocity: " + this.options.velocity);
      $("#ShootingStarParams").fadeIn("slow");
    }

    ShootingStar.prototype.launch = function(everyTime) {
      if (this.toType(everyTime) != "number") {
        everyTime = 10;
      }
      everyTime = everyTime * 1000;
      this.launchStar();
      var self = this;
      setInterval(function() {
        var options = {
          dir: (self.getRandom(1, 0)) ? 1 : -1,
          life: self.getRandom(400, 100),
          beamSize: self.getRandom(700, 400),
          velocity: self.getRandom(10, 4)
        }
        self.launchStar(options);
      }, everyTime);
    }

})();

$(document).ready(function() {
  var shootingStarObj = new ShootingStar("body");
  shootingStarObj.launch();
});