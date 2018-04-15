var scene = new THREE.Scene();
var frustumSize = 15;
var aspect = window.innerWidth / window.innerHeight;


var camera = new THREE.OrthographicCamera( frustumSize * aspect / - 2, frustumSize * aspect / 2, frustumSize / 2, frustumSize / - 2, 1, 2000 );
//var camera = new THREE.PerspectiveCamera( 50, 0.5 * aspect, 1, 10000 );

var renderer = new THREE.WebGLRenderer( { alpha: true } );
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

var controls = new THREE.OrbitControls( camera );

controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
controls.dampingFactor = 0.25;
controls.panningMode = THREE.HorizontalPanning; // default is THREE.ScreenSpacePanning
controls.minDistance = 100;
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

//var pMaterial = new THREE.PointsMaterial( { size: 0.05, vertexColors: THREE.VertexColors } );
//
var spriteMap = new THREE.TextureLoader().load( 'https://threejs.org/examples/textures/lensflare/lensflare0_alpha.png' ); // new THREE.CanvasTexture( generateSprite() )
var pMaterial = new THREE.SpriteMaterial( {
          map: spriteMap,
          blending: THREE.AdditiveBlending
        } );


var particles, particle, particleCount = 0;
var points;
var point2;


/*  Sprites  */


function generateSprite() {
        var canvas = document.createElement( 'canvas' );
        canvas.width = 16;
        canvas.height = 16;
        var context = canvas.getContext( '2d' );
        var gradient = context.createRadialGradient( canvas.width / 2, canvas.height / 2, 0, canvas.width / 2, canvas.height / 2, canvas.width / 2 );
        gradient.addColorStop( 0, 'rgba(255,255,255,1)' );
        gradient.addColorStop( 0.2, 'rgba(0,255,255,1)' );
        gradient.addColorStop( 0.4, 'rgba(0,0,64,1)' );
        gradient.addColorStop( 1, 'rgba(0,0,0,1)' );
        context.fillStyle = gradient;
        context.fillRect( 0, 0, canvas.width, canvas.height );
        return canvas;
      }

function initParticle( particle, delay ) {
        var particle = this instanceof THREE.Sprite ? this : particle;
        var delay = delay !== undefined ? delay : 0;
        particle.position.set( 0, 0, 0 );
        //particle.scale.x = particle.scale.y = Math.random() * 32 + 16;
        new TWEEN.Tween( particle )
          .delay( delay )
          .to( {}, 10000 )
          .onComplete( initParticle )
          .start();
        new TWEEN.Tween( particle.position )
          .delay( delay )
          .to( { x: Math.random() * 4000 - 2000, y: Math.random() * 1000 - 500, z: Math.random() * 4000 - 2000 }, 10000 )
          .start();
        new TWEEN.Tween( particle.scale )
          .delay( delay )
          .to( { x: 0.01, y: 0.01 }, 10000 )
          .start();
      }

/*    END Sprites */


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

function Trip(ledger) {
  //Three js objects
  this.startNode = new THREE.Mesh( geometry2, material );
  this.endNode = new THREE.Mesh( geometry2, material2 );

  this.edges = new THREE.EdgesGeometry( geometry2 );
  this.line = new THREE.LineSegments( this.edges, new THREE.LineBasicMaterial( { color: 0x000000 } ) );
  this.edges2 = new THREE.EdgesGeometry( geometry2 );
  this.line2 = new THREE.LineSegments( this.edges, new THREE.LineBasicMaterial( { color: 0x000000 } ) );

  this.payload = new THREE.Sprite(pMaterial);
  initParticle(this.payload, 0);

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
  this.ledger = ledger;
  this.alpha = 0;
  this.rate = Math.random() / 25;
  this.processed = false; //keeps track of status of trip false -> going to ledger true -> traveling to destination 

  //inner trip management -> swap with ledger -> endPos once first trip complete
  this.v1 = this.startNode.position;
  this.v2 = this.ledger;
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

    this.stream = this.server.transactions()
    .cursor('now')
    .stream({
      onmessage: function (message) {
        //console.log(message);
        console.log("initial transactions stream");
        tripManager.addTrip(new Trip(node2.position));
      }
    });

    console.log(this.es);
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
        //console.log(message);
        console.log("payments stream");
        tripManager.addTrip(new Trip(node2.position));
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
        console.log("operations stream");
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
       // console.log(message);
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

//create trip
//var testTrip = new Trip(node2.position);

/*
(function addTrips (i) {
  setTimeout(function () {
    tripManager.addTrip(new Trip(node2.position));
    if (--i) {          // If i > 0, keep going
      addTrips(i);       // Call the loop again, and pass it the current value of i
    }
  }, 1000);
})(50);

var tripManager;

loadJSON(function(response) {
// Parse JSON string into object
  var actual_JSON = JSON.parse(response);
  //console.log(actual_JSON);
  var records = actual_JSON._embedded.records;
  //console.log(records);
  //console.log(records.length);

  tripManager = new TripManager();

  addTrips(records.length);
});

*/

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


  $("#effects").click(function setLiveEffects() {
   // console.log(liveMode);
    liveMode.effects();
    $("#effects").toggleClass('selected');
  });

});



function animate() {
  requestAnimationFrame( animate );
  TWEEN.update();
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