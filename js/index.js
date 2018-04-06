var scene = new THREE.Scene();
var frustumSize = 10;
var aspect = window.innerWidth / window.innerHeight;
var camera = new THREE.OrthographicCamera( frustumSize * aspect / - 2, frustumSize * aspect / 2, frustumSize / 2, frustumSize / - 2, 1, 2000 );

var renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );


var geometry = new THREE.SphereGeometry(1, 8, 8);
var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );

var node = new THREE.Mesh( geometry, material );
var node2 = new THREE.Mesh( geometry, material );
var node3 = new THREE.Mesh( geometry, material );

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
          this.trips.forEach(function(trip) {
            var index;
            trip.travel();
            if(trip.alpha >= 1 && trip.processed) {
              //remove trip
              index = this.trips.indexOf(trip);
              if (index > -1) {
                this.trips.splice(index, 1);
              }
            }
          });
	    },
      addTrip: function (trip) {
        this.trips.push(trip);
      },
      hasTrips: function () {
        console.log(this.trips);
        if(this.trips) {
          return true;
        } else {
          return false;
        }
      }
	}

//Trip javascript object function

function Trip(startPos, endPos, payload, ledger) {
  this.startPos = startPos;
  this.endPos = endPos;
  this.payload = payload;
  this.ledger = ledger;
  this.alpha = 0;
  this.rate = 0.0025;
  this.processed = false; //keeps track of status of trip false -> going to ledger true -> traveling to destination 
  //inner trip management -> swap with ledger -> endPos once first trip complete
  this.v1 = this.startPos;
  this.v2 = this.ledger;
}

Trip.prototype = {
	    constructor: Trip,
	    travel:function ()  {
          this.alpha += this.rate;
	        this.payload.lerpVectors(this.v1, this.v2, this.alpha);
          if(this.alpha >= 1 && !this.processed) {
            //switch trip to endpoint
            this.alpha = 0;
            this.v1 = this.ledger;
            this.v2 = this.endPos;
            this.processed = true;
          }
	    }
	}

pGeometry.addAttribute( 'position', new THREE.Float32BufferAttribute( [-1,0,0], 3 ) );
pGeometry.addAttribute( 'color', new THREE.Float32BufferAttribute( [0,1,0], 3 ) );

pGeometry.computeBoundingSphere();

points = new THREE.Points(pGeometry, pMaterial);
point2 = new THREE.Points(pGeometry, pMaterial);

scene.add(points);
scene.add(point2);

scene.add( line );
scene.add( line2 );
scene.add(line3);

points.position.set(-1,0,0);
point2.position.set(-3,0,0);

node.position.set(-5,0,0);
line.position.set(-5,0,0);

node2.position.set(5,0,-2);
line2.position.set(5,0,-2);

node3.position.set(10,0,5);
line3.position.set(10,0,5);

// create trip and test
scene.add( node );
scene.add(node2);
scene.add(node3);

camera.position.x = -2.5;
camera.position.y = 7.5;
camera.position.z = 5;

camera.lookAt( scene.position );

var t = 0;
var forward = true;

points.position = node.position;

//create trip
var testTrip = new Trip(node.position, node3.position, points.position, node2.position);

//connection trip
var testTrip2 = new Trip(node3.position, node.position, point2.position, node2.position);

var tripManager = new TripManager();

tripManager.addTrip(testTrip);
tripManager.addTrip(testTrip2);

function animate() {
	requestAnimationFrame( animate );
  
  if(tripManager.hasTrips()) {
    tripManager.travel();
  }
  
  node.rotation.y += 0.01;
  line.rotation.y += 0.01;
  
  node2.rotation.y += 0.01;
  line2.rotation.y += 0.01;
  
	renderer.render( scene, camera );
}

animate();