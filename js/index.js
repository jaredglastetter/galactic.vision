//sounds  [seperate js]
//var Button_Click_Sound = new Audio();//"sounds/button_click.mp3");
//var Button_Hover_Sound = new Audio();//"sounds/button_hover.mp3");
//Button_Hover_Sound.src = "sounds/button_hover.mp3";
//utton_Click_Sound.src = "sounds/button_click.mp3";

//var Opening_Sound = new Audio("sounds/loading_sound.mp3");

//var Focus_Planet_sound = new Audio("sounds/focus_planet.mp3");

//var Focus_Station_Sound = new Audio("sounds/focus_station.mp3");




var tutpage = 1;



var scene;
var frustumSize = 15;
var aspect = window.innerWidth / window.innerHeight;
var dragCheck = false;

var camera;
var renderer;
var stats;

var SCREEN_HEIGHT;
var SCREEN_WIDTH;

// for interactive
var mouse = new THREE.Vector2(), INTERSECTED;
var raycaster = new THREE.Raycaster();
var radius = 500;
var theta = 0;

var is_loading = false;



//Window Focus
var activeWindow = true;
window.onfocus = function(){
  activeWindow = true;
}
window.onblur = function(){
  activeWindow = false;
}

// create an AudioListener and add it to the camera
var listener;
// create a global audio source
var sound;
// load a sound and set it as the Audio object's buffer
var audioLoader;
var controls;
var effect

var reflectionCube = new THREE.CubeTextureLoader()
    .setPath( 'images/quorum_skybox/' )
    .load( [ 'px.png', 'nx.png', 'py.png', 'ny.png', 'pz.png', 'nz.png' ] );
  reflectionCube.format = THREE.RGBFormat;

var tripManager = new TripManager();
var liveMode = new RequestStream();

var globalView = true;

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

var rR2 = Math.random();
var rG2 = Math.random();
var rB2 = Math.random();

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


var centerNode;
//var centerNode = new THREE.Mesh( geometry, material );

var pGeometry = new THREE.BufferGeometry();
var color = new THREE.Color();

//var pMaterial = new THREE.PointsMaterial( { size: 0.05, vertexColors: THREE.VertexColors } );
//
var spriteMap = new THREE.TextureLoader().load( 'https://threejs.org/examples/textures/lensflare/lensflare0_alpha.png' ); // new THREE.CanvasTexture( generateSprite() )
var pMaterial = new THREE.SpriteMaterial( {
  map: spriteMap,
  blending: THREE.AdditiveBlending
} );


function start_app() {
      show_loading(true);
      init();
      animate();

}

function init() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera( 60, window.innerWidth / window.innerHeight, 1, 1000 );
  renderer = new THREE.WebGLRenderer( { alpha: true } );
  renderer.setClearColor( 0x000000, 0.0 );
  renderer.setSize( window.innerWidth, window.innerHeight );
  document.body.appendChild( renderer.domElement );

  controls = new THREE.OrbitControls( camera, renderer.domElement ); // added renderer.domElement make sure there are no side effects

  controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
  controls.dampingFactor = 0.25;
  controls.panningMode = THREE.HorizontalPanning; // default is THREE.ScreenSpacePanning
  controls.minDistance = 0;
  controls.maxDistance = 500;
  controls.maxPolarAngle = Math.PI / 2;

  camera.position.x = -2.5;
  camera.position.y = 50;
  camera.position.z = 40;


  camera.lookAt( scene.position );

  var light = new THREE.AmbientLight( 0xffffff, 2 );
  light.position.set( 1, 1, 1 ).normalize();
  scene.add( light );

  scene.background = reflectionCube;

  //effect = new THREE.OutlineEffect( renderer );
  //effect = renderer;

  listener = new THREE.AudioListener();
  camera.add( listener );

  sound = new THREE.Audio( listener );
  audioLoader = new THREE.AudioLoader();
  // audioLoader.load( '25 Mass Effect-Uncharted Worlds.mp3', function( buffer ) {
  // sound.setBuffer( buffer );
  // sound.setLoop( true );
  // sound.setVolume( 0.5 );
  // sound.play();

  // });

  pGeometry.addAttribute( 'position', new THREE.Float32BufferAttribute( [-1,0,0], 3 ) );
  pGeometry.addAttribute( 'color', new THREE.Float32BufferAttribute( [0,1,0], 3 ) );

  pGeometry.computeBoundingSphere();

  point2 = new THREE.Points(pGeometry, pMaterial);


  var fbx;

  // model
  var loader = new THREE.FBXLoader();
  loader.load( 'stellar 4.fbx', function ( object ) {

    centerNode = object;

    scene.add(centerNode);

     centerNode.scale.x = 0.1;
     centerNode.scale.y = 0.1;
     centerNode.scale.z = 0.1;

     centerNode.name = "Center Node";

     show_loading(false);
    //scene.add(centerNode);
    
    // THREE.Line ( WireframeGeometry, LineBasicMaterial ) - rendered with gl.LINE

    /*
    geo = new THREE.WireframeGeometry( geo );
    matLineBasic = new THREE.LineBasicMaterial( { color: 0x4080ff } );
    matLineDashed = new THREE.LineDashedMaterial( { scale: 0.1, dashSize: 1, gapSize: 1 } );
    wireframe1 = new THREE.LineSegments( geo, matLineBasic );
    wireframe1.computeLineDistances();
    wireframe1.visible = false;
    wireframe1.position = {x:0, y:0, z:0};
    //scene.add( wireframe1 );*/


    //wireframe1.position = {x:0, y:0, z:0};
    //scene.add( wireframe1 );
    //console.log(centerNode);
    /*
    object.traverse( function ( child ) {

      console.log(child);
      fbx = child;

      scene.add(fbx);

      if ( child.isMesh ) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    } );*/

  } );

  //centerNode = new THREE.Mesh( geometry2 );

  var account = "GBX6DXELQKLHMKVX2G24E3TPQV6APUAQECIC3XUJJ77Y2NYDM66TDTVY";
  var server = new StellarSdk.Server('https://horizon.stellar.org');
  /*
  stats = new Stats();
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.top = '0px';
  document.body.appendChild(stats.domElement);
  */


}

function show_loading(visible) {
    if (visible) {
        is_loading = true;
        document.getElementById("loading_overlay").className = "show";
        document.getElementById("loading_overlay").style.pointerEvents = "all";
    } else {
        is_loading = false;
        document.getElementById("loading_overlay").className = "hide";
        document.getElementById("loading_overlay").style.pointerEvents = "none";
    }
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

document.addEventListener( 'pointermove', onDocumentMouseMove, false );
document.addEventListener( 'pointerdown', onDocumentMouseDown, false);
document.addEventListener( 'pointerup', onDocumentMouseUp, false);
window.addEventListener( 'resize', onWindowResize, false );

window.addEventListener('load', function(){
  var load_screen = document.getElementById("load_screen");
  document.body.removeChild(load_screen);
});

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

        // might need to find a better place for this
        raycaster.setFromCamera( mouse, camera );
        var intersects = raycaster.intersectObjects( scene.children );

    // INTERSECTED = the object in the scene currently closest to the camera 
    //      and intersected by the Ray projected from the mouse position    

    // if there is one (or more) intersections
    if ( intersects.length > 0 )
    {
        // if the closest object intersected is not the currently stored intersection object
        if ( intersects[ 0 ].object != INTERSECTED )
        {
            // restore previous intersection object (if it exists) to its original color
            if ( INTERSECTED )
              INTERSECTED.material.color.setHex( INTERSECTED.currentHex );

            // store reference to closest object as current intersection object
            INTERSECTED = intersects[ 0 ].object;

            
            // store color of closest object (for later restoration)
            INTERSECTED.currentHex = INTERSECTED.material.color.getHex();
            var account = findAccount(INTERSECTED.id);
            if(account){
            // set a new color for closest object
            INTERSECTED.material.color.setHex( 0xffff00 ); 
            //Button_Hover_Sound.play();
          }
            
        }
    }
    else // there are no intersections
    {
        // restore previous intersection object (if it exists) to its original color
        if ( INTERSECTED )
            INTERSECTED.material.color.setHex( INTERSECTED.currentHex );
        // remove previous intersection object reference
        //     by setting current intersection object to "nothing"
        INTERSECTED = null;
    }
}

function onDocumentMouseDown(event)
{
  var x = event.screenX;
  var y = event.screenY;
  dragCheck = false;
  $("body").on("mousemove", function(event){
    if(Math.abs(x - event.screenX) > 15 || Math.abs(y - event.screenY) > 15){
      dragCheck = true;
    }
  })


}
function onDocumentMouseUp(event)
{
  //console.log(dragCheck ? "dragging" : "Not Dragging");
  //
  
  if ( INTERSECTED )
            INTERSECTED.material.color.setHex( INTERSECTED.currentHex );
  INTERSECTED = null;
  if(!dragCheck)
  {
      raycaster.setFromCamera( mouse, camera );
      var intersects = raycaster.intersectObjects( scene.children , true);
      if ( intersects.length > 0 ) 
      {

        if ( INTERSECTED != intersects[ 0 ].object ) 
        {
          if ( INTERSECTED ) INTERSECTED.material.color.setHex( INTERSECTED.currentHex );
          INTERSECTED = intersects[ 0 ].object;
          INTERSECTED.currentHex = INTERSECTED.material.color.getHex();

           var length= 0;
           var dir = camera.position.clone().sub(intersects[0].point).normalize();
           camera.position = intersects[0].point.clone().add(dir);
           camera.lookAt(intersects[0].point);
           
           var objID = INTERSECTED.id;
           var account = findAccount(objID); 

           if(account){
           
           var account = findAccount(INTERSECTED.id);

           var sceneObj;
           var accountObj;

           if(account && !app.accountView) {
            app.accountViewID = account.account;
            zoomToTarget(INTERSECTED.position);
            app.showAccountWindow();
            assets(account.account);
            sceneObj = scene.getObjectById( objID, true );
            accountObj = sceneObj.clone();

            accountObj.material.transparent = true;
            accountObj.material.opacity = 1;

            app.accountViewObj = accountObj;

            //add wireframe

            /*
            var geo = new THREE.IcosahedronBufferGeometry( 18, 1 );
            var wire = new THREE.WireframeGeometry2( geo );
            matLine = new THREE.LineMaterial( {
              color: 0x00ffff,
              linewidth: 0.002, // in pixels
              transparent: true,
              //resolution:  // to be set by renderer, eventually
              dashed: false
            } );
            wireframe = new THREE.Wireframe( wire, matLine );
            wireframe.computeLineDistances();
            wireframe.scale.set( 0.075, 0.075, 0.075);
            wireframe.position.x = accountObj.position.x;
            wireframe.position.y = accountObj.position.y;
            wireframe.position.z = accountObj.position.z;

            wireframe.material.transparent = true;
            wireframe.material.opacity = 0.75;

            app.wireframe = wireframe;

            console.log(accountObj.position);
            console.log(wireframe.position);

            scene.add(wireframe);
            */

            scene.add(accountObj);
            SCREEN_WIDTH = window.innerWidth;
            SCREEN_HEIGHT = window.innerHeight;
            var aspect = SCREEN_WIDTH / 2 / SCREEN_HEIGHT;

            camera.aspect = aspect;
            camera.updateProjectionMatrix();
            app.accountView = true;

            //Focus_Planet_sound.play();
           }



           var message = tripManager.trips.find( t => t.line.id === INTERSECTED.id || t.line2.id === INTERSECTED.id).message;
            //S$("#description").append();
            //var result = _.findWhere(tripManager.trips, {line.id: INTERSECTED.id});

           }
           else if(INTERSECTED.parent.parent.parent.name == "Center Node"){
             //console.log("You have clicked the center node");
             //console.log("Printing intersection information");
             zoomToTarget(INTERSECTED.position);

             //Focus_Station_Sound.play();

           }
           
           
        }
      } 
      else 
      {
        if ( INTERSECTED ) {
          INTERSECTED.material.color.setHex( INTERSECTED.currentHex );
          INTERSECTED = null;
        }

        //hide window
        //app.showAccountWindow = false;
            //maybe only hide on button click?
            //$("#description").hide();
          
      }
  }
  
}


function showRequest(message) {
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

  target.z = target.z - 3;
  target.x = target.x - 3;

  var tween = new TWEEN.Tween(position).to(target, 3000);

  tween.onUpdate(function(){
    camera.lookAt( pos );
    controls.update();
    camera.position.x = position.x;
    camera.position.y = position.y;
    camera.position.z = position.z
  });


  tween.easing(TWEEN.Easing.Circular.InOut);

  tween.start();

}

function globalView() {
  controls.target = scene.position;
  renderer.setViewport( 0, 0, SCREEN_WIDTH, SCREEN_HEIGHT );
}

$(document).ready(function() {

  //init payment stream on startup
  $("#payments_stream").toggleClass('selected');
  $("#payments_stream").toggleClass('toggle-on');
  liveMode.payments();

  $("#transactions_stream").click(function setLiveTransactions() {
    liveMode.transactions();
    $("#transactions_stream").toggleClass('selected');
  });

  $("#payments_stream").click(function setLivePayments() {
    liveMode.payments();
    $("#payments_stream").toggleClass('selected');
  });

  $("#operations_stream").click(function setLiveOperations() {
    liveMode.operations();
    $("#operations_stream").toggleClass('selected');
  });

  $("#trades_stream").click(function setLiveTrades() {
    liveMode.trades();
    $("#trades_stream").toggleClass('selected');
  });

  $("#effects_stream").click(function setLiveEffects() {
    liveMode.effects();
    $("#effects_stream").toggleClass('selected');
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
    var msgID = $(this).html();

    var request = findReq(msgID);

    showRequest(request);
  });


  //tutorial navigation
  //
  
  var hasVisited = JSON.parse(localStorage.getItem('hasVisited'));

  if(hasVisited == null){
    $("#tutorial_window").toggleClass('tutorial_window_off');
    localStorage.setItem('hasVisited', true);
  }

  $("#tutorial_window_button").click(function toggleTutorial(){
    tutpage = 1;
    $("#tutorial_window").toggleClass('tutorial_window_off');
  });

  $("#tutorial_next_button").click(function nextTutorial(){

    if(tutpage == 2) {
      //hide next button
      $("#tutorial_next_button").hide();
      $("#tutorial_close_button").show();
    } else if (tutpage == 1) {
      $("#tutorial_back_button").show();
    }

    if(tutpage < 3){
      $("#page" + tutpage).addClass("off");
      tutpage ++;
      $("#page" + tutpage).removeClass("off");
    } 
  });

  $("#tutorial_back_button").click(function backTutorial(){

    if(tutpage == 3) {
      //hide next button
      $("#tutorial_next_button").show();
      $("#tutorial_close_button").hide();
    } else if (tutpage == 2) {
      $("#tutorial_back_button").hide();
    }

    if(tutpage > 1){
      $("#page" + tutpage).addClass("off");
      tutpage --;
      $("#page" + tutpage).removeClass("off");
    }
  });

  $("#tutorial_close_button").click(function closeTutorial(){
    $("#tutorial_window").toggleClass('tutorial_window_off');
    $("#tutorial_next_button").show();
    $("#tutorial_close_button").hide();
    $("#page" + 3).addClass("off");
    $("#page" + 1).removeClass("off");
  });


  $('.toggle').click(function(e){
    e.preventDefault(); // The flicker is a codepen thing
    $(this).toggleClass('toggle-on');
  });


  // search
  
  $('#search_button').click(function searchAccount(){
    var accountText =  document.getElementById('search_input').value;

    var ranindex = Math.floor(Math.random() * app.accountList.length);
    var account = app.accountList[ranindex];
    
    if(accountText.length != 56){
      return;
    }

    var planet;
    var t = Math.floor(Math.random() * app.generated_textures.length);
    var t2 = Math.floor(Math.random() * app.generated_textures.length);

    var material = app.generated_textures[t];

    var material2 = app.generated_textures[t2];

    planet = new THREE.Mesh( geometry2, material );

    var angle = Math.random() * Math.PI*2;
    var radius = Math.random() * 15 + 20;

    var x1 = (Math.abs(Math.cos(angle) * radius) * -1) -3;
    var y1 = Math.random() * 20 - 10;
    var z1 = Math.sin(angle) * radius;

    planet.position.set(x1,y1,z1);

    scene.add(planet);

    objID = planet.id;

     var sceneObj;
     var accountObj;

     if(account && !app.accountView) {
      app.accountViewID = accountText;
      zoomToTarget(planet.position);
      app.showAccountWindow();
      assets(accountText);
      sceneObj = scene.getObjectById( objID, true );
      accountObj = sceneObj.clone();

      accountObj.material.transparent = true;
      accountObj.material.opacity = 1;

      app.accountViewObj = planet;

      SCREEN_WIDTH = window.innerWidth;
      SCREEN_HEIGHT = window.innerHeight;
      var aspect = SCREEN_WIDTH / 2 / SCREEN_HEIGHT;

      camera.aspect = aspect;
      camera.updateProjectionMatrix();
      app.accountView = true;
      app.showSearch = false;


      //Focus_Planet_sound.play();
     }
  })
  

});

function toggleSearchWindow(){
  $('#search_window').toggleClass('off');

}


function findReq(msgID) {
  for (var i = 0, len = app.messageList.length; i < len; i++) {
    if (app.messageList[i].id === msgID)
      return app.messageList[i]; // Return as soon as the object is found
    }
  return null; // The object was not found
}

function findAccount(objID) {
  for (var i = 0, len = app.accountList.length; i < len; i++) {
    if (app.accountList[i].id === objID)
      return app.accountList[i]; // Return as soon as the object is found
    }
  return null; // The object was not found
}

function getAccountInfo(id){
  var server = new StellarSdk.Server('https://horizon.stellar.org');
}

function humanizeString(str) {
  str = str.toLowerCase().replace(/[_-]+/g, ' ').replace(/\s{2,}/g, ' ').trim();
  str = str.charAt(0).toUpperCase() + str.slice(1);

  return str;
};


function animate() {

  requestAnimationFrame( animate );
  render();

  /*
  if(stats) {
    stats.update();
  }*/
  
  controls.update();
}

function render() {
  TWEEN.update();

  if(tripManager && !app.accountView) {
    if(tripManager.hasTrips()) {
      tripManager.travel();
    }
  } else {
    //hide all activity
    tripManager.removeAll();
  }

  if(centerNode) {
    centerNode.rotation.y += 0.01;
  }

  if(app.wireframe) {
    app.wireframe.rotation.y += 0.002;
    app.wireframe.rotation.x += 0.001;
  }

  if(app.accountView) {
    controls.target = app.accountViewObj.position;
    camera.lookAt(app.accountViewObj.position);
    renderer.setViewport( SCREEN_WIDTH/2, 0, SCREEN_WIDTH/2, SCREEN_HEIGHT );
  }

  if(app.switchToGlobalView) {
    controls.target = centerNode.position;
    renderer.setViewport( 0, 0, SCREEN_WIDTH, SCREEN_HEIGHT );
    camera.aspect = aspect;
    camera.updateProjectionMatrix();
    app.switchToGlobalView = false;
  }

  renderer.render( scene, camera );
}