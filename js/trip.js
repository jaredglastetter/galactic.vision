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
      }
  }

//Trip javascript object function


function Trip(ledger, request, message) {
  this.startNode = new THREE.Mesh( geometry2, material );
  this.endNode = new THREE.Mesh( geometry2, material2 );

  //initParticle(this.payload, 0);

  var rList = $('#request-list');

  if(message) {
    this.message = message;
    console.log(message);
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

    //2nd asset console.log(this.startNode);
    this.payload2 = new THREE.Points(pGeometry, pMaterial);

  }*/

  //randomize initial pos

  var angle = Math.random() * Math.PI*2;
  var radius = Math.random() * 15 + 20;

  var x1 = Math.abs(Math.cos(angle) * radius) * -1;
  var y1 = Math.random() * 20 - 10;
  var z1 = Math.sin(angle) * radius;

  var angle2 = Math.random() * Math.PI*2;
  var radius2 = Math.random() * 10 + 20;

  var x2 = Math.abs(Math.cos(angle2) * radius2);
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

  
  if(message.from) {
    //assign object ids to acconut ids
    var account1 = new Object();
    var account2 = new Object();

    account1.id = this.startNode.id;
    account2.id = this.endNode.id;
    account1.account = message.from;
    account2.account = message.to;

    //console.log(account1);
    //console.log(account2);

    accountList.push(account1);
    accountList.push(account2);
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
      }
  }