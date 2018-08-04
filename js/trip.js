//Trip manager object to manage trips and remove trips when lerp is complete -> controls animation
function TripManager() {
  this.trips = [];
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
      },
      removeAll: function() {
        this.trips.forEach(function(trip) { 
          trip.remove();
        });
        this.trips = [];
      }
  }

//Trip javascript object function


function Trip(ledger, request, message) {

  
  var t = Math.floor(Math.random() * app.textures.length);
  var t2 = Math.floor(Math.random() * app.textures.length);

  console.log(t);
  console.log(t2);

  //var imgTexture = new THREE.TextureLoader().load(app.imgArray[app.imgArray.length * Math.random()]); 
  var imgTexture = app.textures[t];

  //var imgTexture = new THREE.TextureLoader().load( "images/Ice-EQUIRECTANGULAR-1-1024x512.png" );
  var imgTexture2 = app.textures[t2];


  //imgTexture = null;

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


  this.startNode = new THREE.Mesh( geometry2, material );
  this.endNode = new THREE.Mesh( geometry2, material2 );

  //initParticle(this.payload, 0);

  var rList = $('#request-body');
  var excludeRequest = false;

  if(message) {
    this.message = message;
    //console.log(message);
    //console.log(Object.assign({}, message));
    app.messageList.push(message);

    /*
    $(document).ready(function() {
      var li = $('<li/>').text(message.type);
      li.appendTo(rList);
    });*/

    $(document).ready(function() {
      //exclude certain conditions
      if(message.type == "manage_offer") {
        if(message.amount == 0) {
          excludeRequest = true;
        }
      }

      if(!excludeRequest) {
        var row = '<tr><td class="text-center"><b>' + message.type + '</b></td><td class="text-center"><b>' + app.operationMessage(message) + '</b></td><td class="text-center"><b>' + message.id.substring(0,12) + '</b></tr>';
        $('#request-body').after(row);
        
        app.requestCount++;

        if(app.requestCount > 100) {
           $('#request-table tr:last').remove();
        }
      }
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

    //2nd asset console.log(this.startNode);
    this.payload2 = new THREE.Points(pGeometry, pMaterial);

  }*/

  //randomize initial pos

  var angle = Math.random() * Math.PI*2;
  var radius = Math.random() * 15 + 20;

  var x1 = (Math.abs(Math.cos(angle) * radius) * -1) -3;
  var y1 = Math.random() * 20 - 10;
  var z1 = Math.sin(angle) * radius;

  var angle2 = Math.random() * Math.PI*2;
  var radius2 = Math.random() * 10 + 20;

  var x2 = Math.abs(Math.cos(angle2) * radius2) + 3;
  var y2 = Math.random() * 20 - 10;
  var z2 = Math.sin(angle2) * radius2;

  this.startNode.position.set(x1,y1,z1);
  //this.line.position.set(x1,y1,z1);

  this.endNode.position.set(x2,y2,z2);
  //this.line2.position.set(x2,y2,z2);

  this.payload.position.set(-1,0,0);

  scene.add( this.startNode );
  scene.add( this.endNode);
  scene.add( this.payload );

  //console.log(message.type);

  var account1;
  var account2;

  if(message.source_account) {
    account1 = new Object();

    account1.id = this.startNode.id;
    account1.account = message.source_account;

    //console.log("assigning an account from type: " + message.type);
    //console.log(account1);

    app.accountList.push(account1);
  }

  if(message.from) {
    //assign object ids to acconut ids
    account1 = new Object();
    account2 = new Object();

    account1.id = this.startNode.id;
    account2.id = this.endNode.id;
    account1.account = message.from;
    account2.account = message.to;

    //console.log(account1);
    //console.log(account2);

    app.accountList.push(account1);
    app.accountList.push(account2);
  }

  //console.log(this.startNode);
  //console.log(this.endNode);

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
  this.rate = Math.random() % 0.025 + 0.0025;
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
      }
  }