
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

	var geometry = new THREE.SphereGeometry(2, 8, 8);
	var geometry2 = new THREE.SphereGeometry(0.75, 8, 8);
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