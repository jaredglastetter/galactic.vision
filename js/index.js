var scene = new THREE.Scene();
var frustumSize = 15;
var aspect = window.innerWidth / window.innerHeight;

//var camera = new THREE.OrthographicCamera( frustumSize * aspect / - 2, frustumSize * aspect / 2, frustumSize / 2, frustumSize / - 2, 1, 2000 );
var camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 1000 );

var renderer = new THREE.WebGLRenderer( { alpha: true } );
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

// for interactive
var mouse = new THREE.Vector2(), INTERSECTED;
var raycaster = new THREE.Raycaster();
var radius = 500;
var theta = 0;

// create an AudioListener and add it to the camera
var listener = new THREE.AudioListener();
camera.add( listener );

// create a global audio source
var sound = new THREE.Audio( listener );

// load a sound and set it as the Audio object's buffer
var audioLoader = new THREE.AudioLoader();
audioLoader.load( '25 Mass Effect-Uncharted Worlds.mp3', function( buffer ) {
  sound.setBuffer( buffer );
  sound.setLoop( true );
  sound.setVolume( 0.5 );
  sound.play();
});

var controls = new THREE.OrbitControls( camera );

controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
controls.dampingFactor = 0.25;
controls.panningMode = THREE.HorizontalPanning; // default is THREE.ScreenSpacePanning
controls.minDistance = 0;
controls.maxDistance = 500
controls.maxPolarAngle = Math.PI / 2;

//var geometry = new THREE.SphereGeometry(2, 8, 8);
//var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
//var material2 = new THREE.MeshBasicMaterial( { color: 0xff0000 } );


var imgTexture = new THREE.TextureLoader().load( "images/moon_1024.jpg" );
var imgTexture2 = new THREE.TextureLoader().load( "images/2k_jupiter.jpg" );

var rR = Math.random();
var rG = Math.random();
var rB = Math.random();

var rR2 = Math.random();
var rG2 = Math.random();
var rB2 = Math.random();


  imgTexture.wrapS = imgTexture.wrapT = THREE.RepeatWrapping;
  imgTexture.anisotropy = 16;
  //imgTexture = null;
  var shininess = 50, specular = 0x333333, bumpScale = 1;
  var materials = [];
  var cubeWidth = 400;
  var numberOfSphersPerSide = 5;
  var sphereRadius = 2;
  var sphereRadius2 = 1;
  var stepSize = 1.0 / numberOfSphersPerSide;
  var geometry = new THREE.SphereBufferGeometry( sphereRadius, 32, 16 );
  var geometry2 = new THREE.SphereBufferGeometry( sphereRadius2, 32, 16 );
  var alpha = 0.5;
  var beta = 0.5;
  var gamma = 0.5;
  var alphaIndex = 1;
  var saturation = Math.random() / 2 + 0.5;
  var lightness = Math.random() / 2 + 0.4;
  var hue = Math.random();
  var planetMaterial;

  console.log("Red: " + rR);
  console.log("Green: " + rG);
  console.log("Blue: " + rB);

  console.log("Hue: " + hue);
  console.log("Saturation: " + saturation);
  console.log("Lightness: " + lightness);
 // for ( var alpha = 0, alphaIndex = 0; alpha <= 1.0; alpha += stepSize, alphaIndex ++ ) {
  var specularShininess = Math.pow( 2, alpha * 10 );
 // for ( var beta = 0; beta <= 1.0; beta += stepSize ) {
  //var specularColor = new THREE.Color( beta * 0.2, beta * 0.2, beta * 0.2 );
  var specularColor = new THREE.Color(rR, rG, rB );
  //for ( var gamma = 0; gamma <= 1.0; gamma += stepSize ) {
    // basic monochromatic energy preservation
    //var diffuseColor = new THREE.Color().setHSL( alpha, 0.5, gamma * 0.5 + 0.1 ).multiplyScalar( 1 - beta * 0.2 );
    var diffuseColor = new THREE.Color(rR, rG, rB).setHSL( rR, saturation, lightness );
    var material = new THREE.MeshToonMaterial( {
      map: imgTexture,
      color: diffuseColor,
      specular: specularColor,
      reflectivity: beta,
      shininess: 0.75, //was 0.75
      envMap: alphaIndex % 2 === 0 ? null : reflectionCube
    } );

  var specularShininess = Math.pow( 2, alpha * 10 );
 // for ( var beta = 0; beta <= 1.0; beta += stepSize ) {
  //var specularColor = new THREE.Color( beta * 0.2, beta * 0.2, beta * 0.2 );
  var specularColor2 = new THREE.Color(rR2, rG2, rB2 );
  //for ( var gamma = 0; gamma <= 1.0; gamma += stepSize ) {
    // basic monochromatic energy preservation
    //var diffuseColor = new THREE.Color().setHSL( alpha, 0.5, gamma * 0.5 + 0.1 ).multiplyScalar( 1 - beta * 0.2 );
    var diffuseColor2 = new THREE.Color(rR2, rG2, rB2).setHSL( rR2, saturation, lightness );
    var material2 = new THREE.MeshToonMaterial( {
      map: imgTexture2,
      color: diffuseColor2,
      specular: specularColor2,
      reflectivity: beta,
      shininess: 0.75, //was 0.75
      envMap: alphaIndex % 2 === 0 ? null : reflectionCube
    } );

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

/* raycaster */
var light = new THREE.DirectionalLight( 0xffffff, 1 );
light.position.set( 1, 1, 1 ).normalize();
scene.add( light );

var reflectionCube = new THREE.CubeTextureLoader()
    .setPath( 'images/ss_skybox/' )
    .load( [ 'px.jpg', 'nx.jpg', 'py.jpg', 'ny.jpg', 'pz.jpg', 'nz.jpg' ] );
  reflectionCube.format = THREE.RGBFormat;
  scene.background = reflectionCube;

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
          //INTERSECTED.material.color.setHex( 0xff0000 );
          console.log(intersects.length);

          //setupTween(INTERSECTED.position);
          zoomToTarget(INTERSECTED.position);


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

function setupTween(pos)
{
  TWEEN.removeAll();

  
  var tweenObject = new TWEEN.Tween(camera.position).to(pos, 2000);
  //tweenObject.easing(TWEEN.Easing.Elastic.InOut);

  tweenObject.start();

}
//////////

function zoomToTarget(pos) {
  
var position = { x : camera.position.x, y: camera.position.y, z: camera.position.z };
var target = pos;

var tween = new TWEEN.Tween(position).to(pos, 3000);

tween.onUpdate(function(){
  camera.lookAt( pos );
  camera.position.x = position.x;
  camera.position.y = position.y;
});

tween.easing(TWEEN.Easing.Circular.InOut);

tween.start();

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


function Trip(ledger, request, message) {
  //Three js objects
  this.startNode = new THREE.Mesh( geometry2, material );
  this.endNode = new THREE.Mesh( geometry2, material2 );

  this.edges = new THREE.EdgesGeometry( geometry2 );
  this.line = new THREE.LineSegments( this.edges, new THREE.LineBasicMaterial( { color: 0x000000 } ) );
  this.edges2 = new THREE.EdgesGeometry( geometry2 );
  this.line2 = new THREE.LineSegments( this.edges, new THREE.LineBasicMaterial( { color: 0x000000 } ) );

  //initParticle(this.payload, 0);

  var rList = $('#request-list');

  //API INFO
  if(message) {
    this.message = message;

    messageList.push(message);

    $(document).ready(function() {
      var li = $('<li/>').text(message.id);
      li.appendTo(rList);
    });
  }

  var colour;

  if(request) {
    if(asset_colours.hasOwnProperty(request.asset)) {
      colour = asset_colours[request.asset];

      this.aMaterial = new THREE.SpriteMaterial( {
        map: spriteMap,
        blending: THREE.AdditiveBlending,
        color: colour
      } );

      //planet material

        specularColor = new THREE.Color(1,1,1);
        diffuseColor = new THREE.Color(colour);
        planetMaterial = new THREE.MeshToonMaterial( {
          map: imgTexture,
          color: diffuseColor,
          specular: specularColor,
          reflectivity: beta,
          shininess: 0.75, //was 0.75
          envMap: alphaIndex % 2 === 0 ? null : reflectionCube
        } );

        this.startNode = new THREE.Mesh( geometry2, planetMaterial );
        
    } else {
      this.aMaterial = new THREE.SpriteMaterial( {
          map: spriteMap,
          blending: THREE.AdditiveBlending
        } );
    }
    this.payload = new THREE.Sprite(this.aMaterial);
  } else {
    this.payload = new THREE.Sprite(pMaterial);
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
  var radius = Math.random() * 10 + 20;

  var x1 = Math.cos(angle) * radius;
  var y1 = Math.random() * 5 - 2.5;
  var z1 = Math.sin(angle) * radius;

  var angle2 = Math.random() * Math.PI*2;
  var radius2 = Math.random() * 10 + 20;

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
  //scene.add( this.line );
  //scene.add( this.line2 );  
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

//scene.add( line2 );

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

  //Operations filters
  $("#create_account").click(function setCreateAccount() {
    liveMode.operations();
    $("#create_account").toggleClass('selected');
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

    
  TWEEN.update();

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