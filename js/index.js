var scene;
var frustumSize = 15;
var aspect = window.innerWidth / window.innerHeight;

var camera;
var renderer;

// for interactive
var mouse = new THREE.Vector2(), INTERSECTED;
var raycaster = new THREE.Raycaster();
var radius = 500;
var theta = 0;

// create an AudioListener and add it to the camera
var listener;
// create a global audio source
var sound;
// load a sound and set it as the Audio object's buffer
var audioLoader;
var controls;
var effect

var reflectionCube = new THREE.CubeTextureLoader()
    .setPath( 'images/ss_skybox/' )
    .load( [ 'px.jpg', 'nx.jpg', 'py.jpg', 'ny.jpg', 'pz.jpg', 'nz.jpg' ] );
  reflectionCube.format = THREE.RGBFormat;

var tripManager = new TripManager();
var liveMode = new RequestStream();

var globalView = true;
var accountView = false;

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
var accountList = []; //list that links all 3d object ids to account ids

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
var specularShininess = Math.pow( 2, alpha * 10 );
//var specularColor = new THREE.Color( beta * 0.2, beta * 0.2, beta * 0.2 );
var specularColor = new THREE.Color(rR, rG, rB );
  //var diffuseColor = new THREE.Color().setHSL( alpha, 0.5, gamma * 0.5 + 0.1 ).multiplyScalar( 1 - beta * 0.2 );
  var diffuseColor = new THREE.Color(rR, rG, rB).setHSL( rR, saturation, lightness );
  var material = new THREE.MeshToonMaterial( {
    map: imgTexture,
    color: diffuseColor,
    specular: specularColor,
    reflectivity: beta,
    shininess: 0.75, 
    envMap: alphaIndex % 2 === 0 ? null : reflectionCube
  } );

var specularShininess = Math.pow( 2, alpha * 10 );
var specularColor2 = new THREE.Color(rR2, rG2, rB2 );
//var diffuseColor = new THREE.Color().setHSL( alpha, 0.5, gamma * 0.5 + 0.1 ).multiplyScalar( 1 - beta * 0.2 );
var diffuseColor2 = new THREE.Color(rR2, rG2, rB2).setHSL( rR2, saturation, lightness );
var material2 = new THREE.MeshToonMaterial( {
  map: imgTexture2,
  color: diffuseColor2,
  specular: specularColor2,
  reflectivity: beta,
  shininess: 0.75, //was 0.75
  envMap: alphaIndex % 2 === 0 ? null : reflectionCube
});

var centerNode = new THREE.Mesh( geometry, material );

var pGeometry = new THREE.BufferGeometry();
var color = new THREE.Color();

//var pMaterial = new THREE.PointsMaterial( { size: 0.05, vertexColors: THREE.VertexColors } );
//
var spriteMap = new THREE.TextureLoader().load( 'https://threejs.org/examples/textures/lensflare/lensflare0_alpha.png' ); // new THREE.CanvasTexture( generateSprite() )
var pMaterial = new THREE.SpriteMaterial( {
          map: spriteMap,
          blending: THREE.AdditiveBlending
        } );

init();

function init() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 1000 );
  renderer = new THREE.WebGLRenderer( { alpha: true } );
  renderer.setSize( window.innerWidth, window.innerHeight );
  document.body.appendChild( renderer.domElement );

  controls = new THREE.OrbitControls( camera );

  controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
  controls.dampingFactor = 0.25;
  controls.panningMode = THREE.HorizontalPanning; // default is THREE.ScreenSpacePanning
  controls.minDistance = 0;
  controls.maxDistance = 500
  controls.maxPolarAngle = Math.PI / 2;

  camera.position.x = -2.5;
  camera.position.y = 50;
  camera.position.z = 40;

  camera.lookAt( scene.position );

  var light = new THREE.AmbientLight( 0xffffff, 1 );
  light.position.set( 1, 1, 1 ).normalize();
  scene.add( light );

  scene.background = reflectionCube;

  effect = new THREE.OutlineEffect( renderer );

  listener = new THREE.AudioListener();
  camera.add( listener );

  sound = new THREE.Audio( listener );
  audioLoader = new THREE.AudioLoader();
  audioLoader.load( '25 Mass Effect-Uncharted Worlds.mp3', function( buffer ) {
  sound.setBuffer( buffer );
  sound.setLoop( true );
  sound.setVolume( 0.5 );
  sound.play();

  pGeometry.addAttribute( 'position', new THREE.Float32BufferAttribute( [-1,0,0], 3 ) );
  pGeometry.addAttribute( 'color', new THREE.Float32BufferAttribute( [0,1,0], 3 ) );

  pGeometry.computeBoundingSphere();

  point2 = new THREE.Points(pGeometry, pMaterial);

  centerNode.position.set(0,0,0);

  scene.add(centerNode);

  console.log(centerNode);

  var account = "GBX6DXELQKLHMKVX2G24E3TPQV6APUAQECIC3XUJJ77Y2NYDM66TDTVY";
  var server = new StellarSdk.Server('https://horizon.stellar.org');
  //console.log(account);
  //console.log(server.operations().forAccount(account).call().then(function(r){ console.log(r); }));
  //assets("GDDMFUC6BPAKNFAKQ2GRJHNQIWQIQBWMF3FEFIBHH532UNKHYIEPDM7M");
});

}

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
           
           var objID = INTERSECTED.id;

           var account = findAccount(objID);

           console.log("Printing intersection information");
           console.log(INTERSECTED);

           var account = findAccount(INTERSECTED.id);

           if(account) {
            console.log("found matching account for object");
            console.log(account.account);
            assets(account.account);
           }



           var message = tripManager.trips.find( t => t.line.id === INTERSECTED.id || t.line2.id === INTERSECTED.id).message;
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

function showAccount(account) {
// var desc = document.getElementById("description");
  // desc.style.display == "block";
  var elem = document.getElementById("description_lines");
  elem.innerHTML = "";

  $("#description").show();
  var info = "";

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

function zoomToTarget(pos) {
  
  var position = { x : camera.position.x, y: camera.position.y, z: camera.position.z };
  var target = { x : pos.x, y: pos.y, z: pos.z };

  target.z = target.z - 10;

  //console.log(target);

  var tween = new TWEEN.Tween(position).to(target, 3000);

  tween.onUpdate(function(){
    camera.lookAt( pos );
    camera.position.x = position.x;
    camera.position.y = position.y;
    camera.position.z = position.z
  });

  tween.easing(TWEEN.Easing.Circular.InOut);

  tween.start();

}

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

function findAccount(objID) {
  for (var i = 0, len = accountList.length; i < len; i++) {
    if (accountList[i].id === objID)
      return accountList[i]; // Return as soon as the object is found
    }
  return null; // The object was not found
}

function getAccountInfo(id){
  var server = new StellarSdk.Server('https://horizon.stellar.org');
  //get account info
  console.log(id);
  console.log(this.server.accounts(account));
}

function animate() {
  requestAnimationFrame( animate );

  if(accountView) {
    //do something to setup new view
  }

  TWEEN.update();

  if(tripManager) {
    if(tripManager.hasTrips()) {
      tripManager.travel();
    }
  }

  centerNode.rotation.y += 0.01;
  effect.render( scene, camera );
}

animate();