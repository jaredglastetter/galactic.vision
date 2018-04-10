var scene = new THREE.Scene();
var frustumSize = 15;
var aspect = window.innerWidth / window.innerHeight;
var camera = new THREE.OrthographicCamera( frustumSize * aspect / - 2, frustumSize * aspect / 2, frustumSize / 2, frustumSize / - 2, 1, 2000 );

var renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );


var geometry = new THREE.SphereGeometry(0.5, 8, 8);
var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
var material2 = new THREE.MeshBasicMaterial( { color: 0xff0000 } );


//var node = new THREE.Mesh( geometry, material );
var node2 = new THREE.Mesh( geometry, material );
//var node3 = new THREE.Mesh( geometry, material );

var edges = new THREE.EdgesGeometry( geometry );
var line = new THREE.LineSegments( edges, new THREE.LineBasicMaterial( { color: 0x000000 } ) );

var edges2 = new THREE.EdgesGeometry( geometry );
var line2 = new THREE.LineSegments( edges, new THREE.LineBasicMaterial( { color: 0x000000 } ) );

var edges3 = new THREE.EdgesGeometry( geometry );
var line3 = new THREE.LineSegments( edges, new THREE.LineBasicMaterial( { color: 0x000000 } ) );

var pGeometry = new THREE.BufferGeometry();
var color = new THREE.Color();
var pMaterial = new THREE.PointsMaterial( { size: 0.05, vertexColors: THREE.VertexColors } );
var particles, particle, particleCount = 0;
var points;
var point2;


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
  this.startNode = new THREE.Mesh( geometry, material );
  this.endNode = new THREE.Mesh( geometry, material2 );

  this.edges = new THREE.EdgesGeometry( geometry );
  this.line = new THREE.LineSegments( edges, new THREE.LineBasicMaterial( { color: 0x000000 } ) );
  this.edges2 = new THREE.EdgesGeometry( geometry );
  this.line2 = new THREE.LineSegments( edges, new THREE.LineBasicMaterial( { color: 0x000000 } ) );

  this.payload = new THREE.Points(pGeometry, pMaterial);

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
  this.rate = Math.random() / 100;
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
      }
	}

pGeometry.addAttribute( 'position', new THREE.Float32BufferAttribute( [-1,0,0], 3 ) );
pGeometry.addAttribute( 'color', new THREE.Float32BufferAttribute( [0,1,0], 3 ) );

pGeometry.computeBoundingSphere();

point2 = new THREE.Points(pGeometry, pMaterial);

scene.add( line2 );

node2.position.set(0,0,0);
line2.position.set(0,0,0);

scene.add(node2);


camera.position.x = -2.5;
camera.position.y = 7.5;
camera.position.z = 5;

camera.lookAt( scene.position );

//create trip
//var testTrip = new Trip(node2.position);

var tripManager = new TripManager();

for(var i = 0; i < 5; i++) {
  tripManager.addTrip(new Trip(node2.position));
}
//tripManager.addTrip(testTrip2);

function animate() {
	requestAnimationFrame( animate );
  
  if(tripManager.hasTrips()) {
    tripManager.travel();
  }
  
  node2.rotation.y += 0.01;
  line2.rotation.y += 0.01;
  
	renderer.render( scene, camera );
}

animate();