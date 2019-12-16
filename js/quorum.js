var camera, scene, renderer, controls, stats;
var positions, colors, sizes;
var line_positions;
var manager = new THREE.LoadingManager();
var loader = new THREE.TextureLoader(manager);
var radius = 0.5;
var is_loading = false;
var track_point_size = settings.default_track_point_size;
var track_point_opacity = settings.default_track_point_opacity;
var track_line_opacity = settings.default_track_line_opacity;
var track_point_speed_scale = settings.default_track_point_speed_scale;
var track_lines_object;
var track_points_object;
var min_arc_distance_miles = +Infinity;
var max_arc_distance_miles = -Infinity;
var cur_arc_distance_miles = 0;
var changing_arc_distance_miles = 0;
var spline_point_cache = [];
var all_tracks = [];
var all_nodes = [];
var node_tracks = [];
var changing = false;
var globe;
var spriteMap;
var node;
var total_nodes;

// for interactive
var INTERSECTED;
var INTERSECTED_CLICK;
var mouse;
var raycaster; 
var theta = 0;

function reqListener () {
  console.log(this.responseText);
  console.log(JSON.parse(this.responseText));
  data = JSON.parse(this.responseText);
  $('#output').html(data);
  nodes = data;
  total_nodes = nodes.length;
  init();
  animate();
}

async function start_app() {

    //  await $.getJSON('http://www.alloworigin.com/get?url=' + encodeURIComponent('https://api.stellarbeat.io/v1/nodes'), function(data){
    //   console.log("received stellarbeat node data");
    //   $('#output').html(data.contents);
    //   nodes = data.contents;
    //   total_nodes = nodes.length;
    //   init();
    //   animate();
    // });

    var oReq = new XMLHttpRequest();
    oReq.addEventListener("load", reqListener);
    oReq.open("GET", "https://api.stellarbeat.io/v1/nodes");
    oReq.send();


     /*$.getJSON('http://www.whateverorigin.org/get?url=https%3A//stellarbeat.io/v1/nodes/', function(data){
      $('#output').html(data.contents);
      nodes = data.contents;
      total_nodes = nodes.length;
      init();
      animate();
    });*/

    //console.log(data);

    //$('#output').html(data);

    /*nodes = []

    for(var i = 0; i < nodes_data.length; i++) {
        node = nodes_data[i].node;
        nodes.push(node);
    }*/
      // nodes = data;
      // total_nodes = nodes.length;
      // init();
      // animate();


    // init();
    // animate();
    // //console.log(nodes);
    all_nodes = all_tracks;
    app.all_tracks = all_tracks;
}

function init() {

    if (!Detector.webgl) {

        Detector.addGetWebGLMessage();
    }

    show_loading(true);

    mouse = new THREE.Vector2();
    raycaster = new THREE.Raycaster();

    spriteMap = new THREE.TextureLoader().load( 'https://threejs.org/examples/textures/lensflare/lensflare0_alpha.png' );

    renderer = new THREE.WebGLRenderer({
        antialias: true
    });
    renderer.setClearColor(0x000000, 1.0);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth - 260, window.innerHeight);
    document.body.appendChild(renderer.domElement);


    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.01, 100);
    camera.position.x = -0.3;
    camera.position.y = 0.8;
    camera.position.z = 1.4;

    scene.add(new THREE.AmbientLight(0x777777));

    var light1 = new THREE.DirectionalLight(0xffffff, 0.2);
    light1.position.set(5, 3, 5);
    scene.add(light1);

    var light2 = new THREE.DirectionalLight(0xffffff, 0.2);
    light2.position.set(5, 3, -5);
    scene.add(light2);

    var segments = 64;

    globe = new THREE.Object3D();

    loader.load(
        'images/earth.jpg',
        function(earth_texture) {

            loader.load(
                'images/water.png',
                function(water_texture) {
           
                     earth_texture.image.crossOrigin = "";
                     water_texture.image.crossOrigin = "";
                     console.log(water_texture);
                     console.log(earth_texture);

                    globe.add(new THREE.Mesh(
                        new THREE.SphereGeometry(radius, segments, segments),
                        new THREE.MeshPhongMaterial({
                            map: earth_texture,
                            specularMap: water_texture,
                            specular: new THREE.Color(0x999999)
                        })
                    ));

                    //scene.add(globe);

                    generateControlPoints(radius);

                    track_lines_object = generate_track_lines();
                    scene.add(track_lines_object);

                    track_points_object = generate_track_point_cloud();
                    scene.add(track_points_object);

                    track_lines_object.material.opacity = 0.25;

                    /*
                    var gui = new dat.GUI();

                    gui.add(this, 'changing_arc_distance_miles', min_arc_distance_miles, max_arc_distance_miles).name("Max Distance Miles").onFinishChange(function(value) {
                        cur_arc_distance_miles = value;
                        update_track_lines();
                    });

                    gui.add(this, 'track_line_opacity', 0, 0.25).name("Line Opacity").onChange(function(value) {
                        track_lines_object.material.opacity = value;
                    });

                    gui.add(this, 'track_point_opacity', 0, 1.0).name("Points Opacity").onChange(function(value) {
                        track_points_object.material.uniforms.opacity.value = value;
                    });

                    gui.add(this, 'track_point_size', 0, 0.1).name("Point Size").onChange(function(value) {
                        var index = 0;
                        for (var i = 0; i < all_tracks.length; ++i) {

                            for (var j = 0; j < all_tracks[i].point_positions.length; ++j) {
                                sizes[index] = value;
                                ++index;
                            }
                        }
                        track_points_object.geometry.attributes.size.needsUpdate = true;
                    });
                    gui.add(this, "handle_about").name("About & Credits");*/

                    show_loading(false);
                });
        });


    controls = new THREE.TrackballControls(camera, renderer.domElement);
    controls.rotateSpeed = 0.4;
    controls.noZoom = false;
    controls.noPan = true;
    controls.staticMoving = false;
    controls.minDistance = 0.75;
    controls.maxDistance = 4.0;

    stats = new Stats();
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.top = '0px';
    document.body.appendChild(stats.domElement);

    window.addEventListener('resize', onWindowResize, false);

    scene.add(globe);
}

function zoomToLocation(pos) {
    var position = { x : camera.position.x, y: camera.position.y, z: camera.position.z };
    var target = { x : pos.x, y: pos.y, z: pos.z };

    target.z = target.z;
    target.x = target.x;

    //console.log(target);

    var tween = new TWEEN.Tween(position).to(target, 1500);

    tween.onUpdate(function(){
        camera.lookAt( pos );
        controls.update();
        camera.position.x = position.x;
        camera.position.y = position.y;
        camera.position.z = position.z
    });


    tween.easing(TWEEN.Easing.Quadratic.InOut);

    tween.start();
}


$(document).ready(function() {

 
  $( "#node_list a" ).click(function() {
    $( this ).toggleClass( "selected" );
  });

});

function setupTween(node) {
    clearTag();
    app.curr_node = node;
    addValidators();
    //changeTags();
    changePins();
    highlightLines(node);
    //toggle left window if mobile
    toggleIfMobile(true);
    zoomToLocation(xyz_from_lat_lng(node.geoData.latitude, node.geoData.longitude, 1.3));
}

function toggleIfMobile(listView) {
  if($(window).width() <= 768) {
    if(listView) {
      $('#node_list').hide();
      $('.validators').show();
      $('.validator-back').show();
    } else {
      $('#node_list').show();
      $('.validators').hide();
      $('.validator-back').hide();
    }

  }
}

function viewAll() {
    clearTag();
    app.curr_node = {};
    addAllPins();
    scene.remove(track_lines_object);
    scene.remove(track_points_object);
    spline_point_cache = [];

    all_tracks = all_nodes;
    all_tracks = clearConnectionType(all_tracks);
    app.curr_nodes = all_tracks;
    app.curr_tracks = all_tracks;

    track_lines_object = generate_track_lines();
    track_lines_object.material.opacity = 0.25;
    scene.add(track_lines_object);

    track_points_object = generate_track_point_cloud();
    scene.add(track_points_object);
    toggleIfMobile(false);
}

function highlightLines(node) {
    var outgoing_connections;
    var incoming_connections;

    scene.remove(track_lines_object);
    scene.remove(track_points_object);
    spline_point_cache = [];

    outgoing_connections = addOutgoingTag(node.connections);
    incoming_connections = addIncomingTag(node.trusted_connections)

    all_tracks = outgoing_connections.concat(incoming_connections);
    app.curr_nodes = all_tracks;
    app.curr_tracks = all_tracks;

    track_lines_object = generate_track_lines();
    track_lines_object.material.opacity = 0.5;
    scene.add(track_lines_object);

    track_points_object = generate_track_point_cloud();
    scene.add(track_points_object);
}

function clearConnectionType(tracks) {
    for(var i = 0; i < tracks.length; i++) {
        tracks[i].connection_type = "";
    }

    return tracks
}

function changeTags() {
    var tags = app.curr_node.quorumArr.concat(app.curr_node.trusted_by);

    nodes.forEach(function(node) {
        if(node.tag) {
            scene.remove(node.tag);
        }
    });

    //add tags for each node in the scene
    scene.add(app.curr_node.tag);

    tags.forEach(function(node) {
        if(node.tag) {
            scene.add(node.tag);
        }
    });
}

function clearTag() {
    if(app.curr_node.tag) {
        app.curr_node.tag.visible = false;
    }
}

function addAllPins() {
    nodes.forEach(function(node) {
        if(node.pin) {
            node.pin.line.visible = true;
            node.pin.top.visible = true;
        }
    });
}

function changePins() {
    var tags = app.curr_node.quorumArr.concat(app.curr_node.trusted_by);

    nodes.forEach(function(node) {
        if(node.pin) {
            node.pin.line.visible = false;
            node.pin.top.visible = false;
        }
    });

    //add tags for each node in the scene
    app.curr_node.pin.line.visible = true;
    app.curr_node.pin.top.visible = true;
    app.curr_node.tag.visible = true;


    tags.forEach(function(node) {
        if(node.pin) {
            node.pin.line.visible = true;
            node.pin.top.visible = true;
        }
    });
}

function addValidators() {
    var validator_node;
    var validator;
    quorumArr = app.curr_node.quorumArr;
    var trusted_by = app.curr_node.trusted_by;
    var curr_node = app.curr_node;
    var trust_index = Math.round((curr_node.trusted_by.length / total_nodes) * 100);

    $('#node_header').empty();
    $('#node_location').empty();
    $('#rating').empty();
    $('#trust_index').empty();
    $('#validator_type').empty();
    $('#core_version').empty();
    $('#validator_list').empty();
    $('#trusted_by_list').empty();
    $('#is_validating').empty();
    $('#overloaded').empty();

    $('#node_header').append(getNodeName(curr_node)); 
    $('#node_location').append(getNodeLocation(curr_node)); 
    $('#rating').append(curr_node.statistics.active24HoursPercentage + "%");
    $('#trust_index').append(curr_node.index * 100 + "%");
    $('#validator_type').append(curr_node.isFullValidator ? "Full Validator" : "Validator");
    $('#core_version').append(curr_node.versionStr.substring(0,curr_node.versionStr.indexOf("(")));
    $('#is_validating').append(curr_node.isValidating ? "Validating" : "Not Validating");
    $('#overloaded').append(curr_node.statistics.overLoaded24HoursPercentage.toString() + "%");

    for(var node in quorumArr) {
        //nodes it trusted
        validator = quorumArr[node];
        validator_node = '<a onclick="setupTween(nodes[' + validator.listPos + '])" href="#" class="list-group-item list-group-item-dark">' + getNodeName(validator) + '</a>';
        $('#validator_list').append(validator_node); 
    }

    for(var node in trusted_by) {
        validator = trusted_by[node];
        validator_node = '<a onclick="setupTween(nodes[' + validator.listPos + '])" href="#" class="list-group-item list-group-item-dark">' + getNodeName(validator) + '</a>';
        $('#trusted_by_list').append(validator_node); 
    }
}

function addOutgoingTag(tracks) {
    for(var i = 0; i < tracks.length; i++) {
        tracks[i].connection_type = "outgoing";
    }

    return tracks;
}

function addIncomingTag(tracks) {

    for(var i = 0; i < tracks.length; i++) {
        tracks[i].connection_type = "incoming";
    }

    return tracks;
}

function addToTrusted(track, nodePos) {
    nodes[nodePos].trusted_connections.push(track);
}

function getNodeName(node) {
    var name;

    name = node.name ? node.name : node.publicKey.substring(0,16);

    return name
}

function getNodeLocation(node) {
    var location;
    var geoData = node.geoData;

    if(geoData) {
      location = geoData.city ? geoData.city + ", " + geoData.countryName : geoData.countryName;     
    }


    return location
}

function populateNodeList() {

    //sort list by # trusted_by

    //TO DO: fix node links when sorting by trusted by. Sorting by trusted nodes messes up the linked node

    //nodes = _.sortBy(nodes, "trusted_by");

   // nodes = nodes.reverse();

    for(var f = 0; f < nodes.length; f++) {
        if(nodes[f].connections) {
            if(nodes[f].name) { // optional condition: nodes[f].connections.length > 0 && -> only nodes that have a node that trust it
                menu_node = '<a onclick="setupTween(nodes[' + f + '])" href="#" class="list-group-item list-group-item-dark">' + nodes[f].name + '</a>';
                $('#node_list').append(menu_node); 
                app.nodes.push(nodes[f]);
            }
        }
    }
}

function generateControlPoints(radius) {
    var v_index;

    for (var i = 0; i < nodes.length; ++i) {
        nodes[i].listPos = i;
        nodes[i].trusted_by = [];
        nodes[i].trusted_connections = [];
    }


    for (var f = 0; f < nodes.length; ++f) {

        //grab 
        node = new Object();

        var start_lat = nodes[f].geoData.latitude;
        var start_lng = nodes[f].geoData.longitude;

        nodes[f].connections = [];


        if(nodes[f].quorumSet) {
            var quorumSet = nodes[f].quorumSet.validators;

            nodes[f].quorumArr = [];
            
            var coords = xyz_from_lat_lng( start_lat, start_lng, 0.5);

            var node_coord = new THREE.Vector3( coords.x, coords.y, coords.z );

            var label_coord = node_coord.clone();

            label_coord.multiplyScalar(1.1);

            if(nodes[f].name) {
                /*
                var spritey = makeTextSprite( " " + nodes[f].name + " ", { fontsize: 32, backgroundColor: {r:255, g:100, b:100, a:1} } );

                spritey.position.x = node_coord.x;
                spritey.position.y = node_coord.y;
                spritey.position.z = node_coord.z;

                nodes[f].tag = spritey;
                //scene.add( spritey );
                */

                
                var labelCanvas;
                var labelTexture;
                var labelMaterial;
                var labelSprite;
                var altitude = 0.05;
                var text = nodes[f].name;
                var opts = {
                    lineColor: "#FFCC00",
                    lineWidth: 1,
                    markerColor: "#FFCC00",
                    labelColor: "#FFF",
                    font: "Segoe",
                    fontSize: 20,
                    drawTime: 2000,
                    lineSegments: 150
                }
                
                labelCanvas = createLabel(text.toUpperCase(), opts.fontSize, opts.labelColor, opts.font);
                labelTexture = new THREE.Texture(labelCanvas);
                labelTexture.minFilter = THREE.LinearFilter;
                labelTexture.needsUpdate = true;

                labelMaterial = new THREE.SpriteMaterial({
                    map : labelTexture,
                    opacity: 1,
                    depthTest: true,
                    fog: true
                });

                labelSprite = new THREE.Sprite(labelMaterial);
                labelSprite.position.x = label_coord.x * 1.1;
                labelSprite.position.y = label_coord.y * 1.1;
                labelSprite.position.z = label_coord.z * 1.1;
                labelSprite.scale.set(labelCanvas.width / 1500, labelCanvas.height / 1500);
                labelSprite.visible = false;
                scene.add(labelSprite);

                nodes[f].tag = labelSprite;
                

                var pinOpts = {
                    lineColor: "#8FD8D8",
                    lineWidth: 1,
                    topColor: "#8FD8D8",
                    smokeColor: "#FFF",
                    labelColor: "#FFF",
                    font: "Inconsolata",
                    showLabel: (text.length > 0),
                    showTop: (text.length > 0),
                    showSmoke: (text.length > 0)
                }

                var topTexture;
                var topMaterial;
                var topSprite;

                topTexture = new THREE.Texture(createTopCanvas(pinOpts.topColor));
                topTexture.minFilter = THREE.LinearFilter;
                topTexture.needsUpdate = true;
                topMaterial = new THREE.SpriteMaterial({map: topTexture, depthTest: true, fog: true, opacity: 1});
                topSprite = new THREE.Sprite(topMaterial);
                topSprite.scale.set(0.02, 0.02);
                topSprite.position.set(node_coord.x * 1.1, node_coord.y * 1.1, node_coord.z * 1.1);

                scene.add(topSprite);


                var lineGeometry;
                var lineMaterial;
                var line;

                lineGeometry = new THREE.Geometry();
                lineMaterial = new THREE.LineBasicMaterial({
                    color: pinOpts.lineColor,
                    linewidth: pinOpts.lineWidth
                });

                lineGeometry.vertices.push(new THREE.Vector3(node_coord.x, node_coord.y, node_coord.z));
                lineGeometry.vertices.push(new THREE.Vector3(node_coord.x * 1.1, node_coord.y * 1.1, node_coord.z * 1.1));
                line = new THREE.Line(lineGeometry, lineMaterial);

                scene.add(line);

                var pinObj = new Object();

                pinObj.line = line;
                pinObj.top = topSprite;

                nodes[f].pin = pinObj;

                //add node to nodeList to assign pin to node label
                var nodePin = new Object();

                nodePin.id = topSprite.id;
                nodePin.node = nodes[f];

                app.node_list.push(nodePin);

            }

            //enter quorum set array loop and execute the next code per found quorum
            for(var j = 0; j < quorumSet.length; j++) {

                var validator = quorumSet[j];

                //find validator key in nodes array
                validatorMatch = _.where(nodes, {publicKey: validator});

                //console.log(validatorMatch);

                if(validatorMatch.length > 0) {

                    //add current node to validator nodes trusted nodes array
                    v_index = validatorMatch[0].listPos;

                    //console.log("validator index: " + v_index);

                    nodes[v_index].trusted_by.push(nodes[f]);
                    
                    //add validator node object to array
                    nodes[f].quorumArr.push(validatorMatch[0]);

                    var end_lat = validatorMatch[0].geoData.latitude;
                    var end_lng = validatorMatch[0].geoData.longitude;

                    var material = new THREE.ShaderMaterial( {
                        uniforms: {
                            color:   { value: new THREE.Color( 0xffffff ) },
                            texture: { value: spriteMap }
                        }
                    } );

                    /*
                    track_point_cloud_geom.addAttribute('position', new THREE.BufferAttribute(positions, 3));
    track_point_cloud_geom.addAttribute('customColor', new THREE.BufferAttribute(colors, 3));
    track_point_cloud_geom.addAttribute('size', new THREE.BufferAttribute(sizes, 1));
    track_point_cloud_geom.computeBoundingBox();*/

            

                    if (start_lat === end_lat && start_lng === end_lng) {
                        continue;
                    }

                    var max_height = Math.random() * 0.1 + 0.05;

                    var points = [];
                    var spline_control_points = 8;
                    for (var i = 0; i < spline_control_points + 1; i++) {
                        var arc_angle = i * 180.0 / spline_control_points;
                        var arc_radius = radius + (Math.sin(arc_angle * Math.PI / 180.0)) * max_height;
                        var latlng = lat_lng_inter_point(start_lat, start_lng, end_lat, end_lng, i / spline_control_points);

                        var pos = xyz_from_lat_lng(latlng.lat, latlng.lng, arc_radius);

                        points.push(new THREE.Vector3(pos.x, pos.y, pos.z));
                    }

                    var spline = new THREE.CatmullRomCurve3(points);
                    var arc_distance = lat_lng_distance(start_lat, start_lng, end_lat, end_lng);

                    var point_positions = [];

                    for (var t = 0; t < arc_distance; t += settings.track_point_spacing) {

                        var offset = t / arc_distance;

                        point_positions.push(spline.getPoint(offset));
                    }

                    var arc_distance_miles = (arc_distance / (2 * Math.PI)) * 24901;

                    if (arc_distance_miles < min_arc_distance_miles) {
                        min_arc_distance_miles = arc_distance_miles;
                    }

                    if (arc_distance_miles > max_arc_distance_miles) {
                        max_arc_distance_miles = parseInt(Math.ceil(arc_distance_miles / 1000.0) * 1000);
                        cur_arc_distance_miles = max_arc_distance_miles;
                        changing_arc_distance_miles = max_arc_distance_miles;
                    }

                    var speed = Math.random() * 600 + 400;

                    var track = {
                        spline: spline,
                        arc_distance: arc_distance,
                        arc_distance_miles: arc_distance_miles,
                        num_points: parseInt(arc_distance / settings.track_point_spacing) + 1,
                        point_positions: point_positions,
                        default_speed: speed,
                        speed: speed * track_point_speed_scale
                    };
                    addToTrusted(track, v_index);
                    nodes[f].connections.push(track);
                    all_tracks.push(track);
                }
            }
            //node_tracks.push(node);
        }
    }

    populateNodeList();
    app.all_nodes = nodes;
}

function xyz_from_lat_lng(lat, lng, radius) {

    var phi = (90 - lat) * Math.PI / 180;
    var theta = (360 - lng) * Math.PI / 180;

    return {
        x: radius * Math.sin(phi) * Math.cos(theta),
        y: radius * Math.cos(phi),
        z: radius * Math.sin(phi) * Math.sin(theta)
    };
}

function lat_lng_distance(lat1, lng1, lat2, lng2) {

    var a = Math.sin(((lat2 - lat1) * Math.PI / 180) / 2) *
        Math.sin(((lat2 - lat1) * Math.PI / 180) / 2) +
        Math.cos(lat1 * Math.PI / 180) *
        Math.cos(lat2 * Math.PI / 180) *
        Math.sin(((lng2 - lng1) * Math.PI / 180) / 2) *
        Math.sin(((lng2 - lng1) * Math.PI / 180) / 2);

    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return radius * c;
}

function lat_lng_inter_point(lat1, lng1, lat2, lng2, offset) {

    lat1 = lat1 * Math.PI / 180.0;
    lng1 = lng1 * Math.PI / 180.0;
    lat2 = lat2 * Math.PI / 180.0;
    lng2 = lng2 * Math.PI / 180.0;

    var d = 2 * Math.asin(Math.sqrt(Math.pow((Math.sin((lat1 - lat2) / 2)), 2) +
        Math.cos(lat1) * Math.cos(lat2) * Math.pow(Math.sin((lng1 - lng2) / 2), 2)));
    var A = Math.sin((1 - offset) * d) / Math.sin(d);
    var B = Math.sin(offset * d) / Math.sin(d);
    var x = A * Math.cos(lat1) * Math.cos(lng1) + B * Math.cos(lat2) * Math.cos(lng2);
    var y = A * Math.cos(lat1) * Math.sin(lng1) + B * Math.cos(lat2) * Math.sin(lng2);
    var z = A * Math.sin(lat1) + B * Math.sin(lat2);
    var lat = Math.atan2(z, Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2))) * 180 / Math.PI;
    var lng = Math.atan2(y, x) * 180 / Math.PI;

    return {
        lat: lat,
        lng: lng
    };
}

function generate_track_point_cloud() {
    var color;
    var num_points = 0;
    for (var i = 0; i < all_tracks.length; ++i) {
        num_points += all_tracks[i].num_points;
    }

    var track_point_cloud_geom = new THREE.BufferGeometry();

    positions = new Float32Array(num_points * 3);
    colors = new Float32Array(num_points * 3);
    sizes = new Float32Array(num_points);

    var index = 0;

    for (i = 0; i < all_tracks.length; ++i) {

        //var color = new THREE.Color(0xffffff).setHSL(i / all_tracks.length, 0.6, 0.6);
        if(all_tracks[i].connection_type) {
            if(all_tracks[i].connection_type == "outgoing") {
                color = new THREE.Color(0x00ff00);
            } else {
                color = new THREE.Color(0x00ffff);
            }
        } else {
            color = new THREE.Color(0xffffff).setHSL(i / all_tracks.length, 0.9, 0.8);
        }

        for (var j = 0; j < all_tracks[i].point_positions.length; ++j) {

            positions[3 * index + 0] = 0;
            positions[3 * index + 1] = 0;
            positions[3 * index + 2] = 0;

            colors[3 * index + 0] = color.r;
            colors[3 * index + 1] = color.g;
            colors[3 * index + 2] = color.b;

            sizes[index] = track_point_size;

            ++index;
        }
    }

    track_point_cloud_geom.addAttribute('position', new THREE.BufferAttribute(positions, 3));
    track_point_cloud_geom.addAttribute('customColor', new THREE.BufferAttribute(colors, 3));
    track_point_cloud_geom.addAttribute('size', new THREE.BufferAttribute(sizes, 1));
    track_point_cloud_geom.computeBoundingBox();

    var uniforms = {
        color: {
            type: "c",
            value: new THREE.Color(0xffffff)
        },
        texture: {
            type: "t",
            value: loader.load('images/point.png',
                function(point_texture) {
                    return point_texture;
                })
        },
        opacity: {
            type: "f",
            value: track_point_opacity
        }
    };

    var shaderMaterial = new THREE.ShaderMaterial({
        uniforms: uniforms,
        vertexShader: document.getElementById('vertexshader').textContent,
        fragmentShader: document.getElementById('fragmentshader').textContent,
        blending: THREE.AdditiveBlending,
        depthTest: true,
        depthWrite: false,
        transparent: true,
    });

    return new THREE.Points(track_point_cloud_geom, shaderMaterial);
}

function update_track_point_cloud() {

    var index = 0;

    for (var i = 0; i < all_tracks.length; ++i) {

        var time_scale = (Date.now() % all_tracks[i].speed) / (all_tracks[i].speed * all_tracks[i].num_points);
        var normalized_arc_dist = settings.track_point_spacing / all_tracks[i].arc_distance;

        for (var j = 0; j < all_tracks[i].num_points; j++) {

            if (all_tracks[i].arc_distance_miles <= cur_arc_distance_miles) {
                var offset_time = j * normalized_arc_dist + time_scale;

                var pos = fast_get_spline_point(i, offset_time);

                positions[3 * index + 0] = pos.x;
                positions[3 * index + 1] = pos.y;
                positions[3 * index + 2] = pos.z;

            } else {
                positions[3 * index + 0] = Infinity;
                positions[3 * index + 1] = Infinity;
                positions[3 * index + 2] = Infinity;
            }

            index++;
        }
    }

    track_points_object.geometry.attributes.position.needsUpdate = true;
}

function fast_get_spline_point(index, t) {

    var t_compare = parseInt(t * 1000);

    if (spline_point_cache[index] === undefined) {
        spline_point_cache[index] = [];
    }

    if (spline_point_cache[index][t_compare] !== undefined) {
        return spline_point_cache[index][t_compare];
    }

    var pos = all_tracks[index].spline.getPoint(t);

    spline_point_cache[index][t_compare] = pos;

    return pos;
}

function generate_track_lines() {

    var geometry = new THREE.BufferGeometry();
    var material = new THREE.LineBasicMaterial({
        color: 0xffffff,
        vertexColors: THREE.VertexColors,
        transparent: true,
        opacity: track_line_opacity,
        depthTest: true,
        depthWrite: false,
        linewidth: 0.2
    });
    line_positions = new Float32Array(all_tracks.length * 3 * 2 * settings.num_track_line_control_points);
    var colors = new Float32Array(all_tracks.length * 3 * 2 * settings.num_track_line_control_points);

    for (var i = 0; i < all_tracks.length; ++i) {
        var color
        //var color = new THREE.Color(0xffffff).setHSL(i / all_tracks.length, 0.9, 0.8);
        if(all_tracks[i].connection_type) {
            if(all_tracks[i].connection_type == "outgoing") {
                color = new THREE.Color(0x00ff00);
            } else {
                color = new THREE.Color(0x00ffff);
            }
        } else {
            color = new THREE.Color(0xffffff).setHSL(i / all_tracks.length, 0.9, 0.8);
        }

        for (var j = 0; j < settings.num_track_line_control_points - 1; ++j) {

            var start_pos = all_tracks[i].spline.getPoint(j / (settings.num_track_line_control_points - 1));
            var end_pos = all_tracks[i].spline.getPoint((j + 1) / (settings.num_track_line_control_points - 1));

            line_positions[(i * settings.num_track_line_control_points + j) * 6 + 0] = start_pos.x;
            line_positions[(i * settings.num_track_line_control_points + j) * 6 + 1] = start_pos.y;
            line_positions[(i * settings.num_track_line_control_points + j) * 6 + 2] = start_pos.z;
            line_positions[(i * settings.num_track_line_control_points + j) * 6 + 3] = end_pos.x;
            line_positions[(i * settings.num_track_line_control_points + j) * 6 + 4] = end_pos.y;
            line_positions[(i * settings.num_track_line_control_points + j) * 6 + 5] = end_pos.z;

            colors[(i * settings.num_track_line_control_points + j) * 6 + 0] = color.r;
            colors[(i * settings.num_track_line_control_points + j) * 6 + 1] = color.g;
            colors[(i * settings.num_track_line_control_points + j) * 6 + 2] = color.b;
            colors[(i * settings.num_track_line_control_points + j) * 6 + 3] = color.r;
            colors[(i * settings.num_track_line_control_points + j) * 6 + 4] = color.g;
            colors[(i * settings.num_track_line_control_points + j) * 6 + 5] = color.b;
        }
        //console.log(i);
    }

    geometry.addAttribute('position', new THREE.BufferAttribute(line_positions, 3));
    geometry.addAttribute('color', new THREE.BufferAttribute(colors, 3));

    geometry.computeBoundingSphere();

    return new THREE.Line(geometry, material, THREE.LineSegments);
}

function update_track_lines() {

    for (var i = 0; i < all_tracks.length; ++i) {

        for (var j = 0; j < settings.num_track_line_control_points - 1; ++j) {

            if (all_tracks[i].arc_distance_miles <= cur_arc_distance_miles) {

                var start_pos = all_tracks[i].spline.getPoint(j / (settings.num_track_line_control_points - 1));
                var end_pos = all_tracks[i].spline.getPoint((j + 1) / (settings.num_track_line_control_points - 1));

                line_positions[(i * settings.num_track_line_control_points + j) * 6 + 0] = start_pos.x;
                line_positions[(i * settings.num_track_line_control_points + j) * 6 + 1] = start_pos.y;
                line_positions[(i * settings.num_track_line_control_points + j) * 6 + 2] = start_pos.z;
                line_positions[(i * settings.num_track_line_control_points + j) * 6 + 3] = end_pos.x;
                line_positions[(i * settings.num_track_line_control_points + j) * 6 + 4] = end_pos.y;
                line_positions[(i * settings.num_track_line_control_points + j) * 6 + 5] = end_pos.z;
            } else {
                line_positions[(i * settings.num_track_line_control_points + j) * 6 + 0] = 0.0;
                line_positions[(i * settings.num_track_line_control_points + j) * 6 + 1] = 0.0;
                line_positions[(i * settings.num_track_line_control_points + j) * 6 + 2] = 0.0;
                line_positions[(i * settings.num_track_line_control_points + j) * 6 + 3] = 0.0;
                line_positions[(i * settings.num_track_line_control_points + j) * 6 + 4] = 0.0;
                line_positions[(i * settings.num_track_line_control_points + j) * 6 + 5] = 0.0;
            }
        }
    }

    track_lines_object.geometry.attributes.position.needsUpdate = true;
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function show_about(visible) {
    if (visible) {
        document.getElementById("about_box_bkg").className = "show";
        document.getElementById("about_box").className = "show";
        document.getElementById("about_box").style.pointerEvents = "all";
    } else {
        document.getElementById("about_box_bkg").className = "hide";
        document.getElementById("about_box").className = "hide";
        document.getElementById("about_box").style.pointerEvents = "none";
    }
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

function handle_about() {
    show_about(true);
}

function makeTextSprite( message, parameters ) {
    if ( parameters === undefined ) parameters = {};
    
    var fontface = parameters.hasOwnProperty("fontface") ? 
        parameters["fontface"] : "Arial";
    
    var fontsize = parameters.hasOwnProperty("fontsize") ? 
        parameters["fontsize"] : 18;
    
    var borderThickness = parameters.hasOwnProperty("borderThickness") ? 
        parameters["borderThickness"] : 4;
    
    var borderColor = parameters.hasOwnProperty("borderColor") ?
        parameters["borderColor"] : { r:0, g:0, b:0, a:1.0 };
    
    var backgroundColor = parameters.hasOwnProperty("backgroundColor") ?
        parameters["backgroundColor"] : { r:255, g:255, b:255, a:1.0 };
    //var spriteAlignment = parameters.hasOwnProperty("alignment") ?
    //  parameters["alignment"] : THREE.SpriteAlignment.topLeft;
    //var spriteAlignment = THREE.SpriteAlignment.topLeft;
        
    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');
    context.font = "Bold " + fontsize + "px " + fontface;
    
    // get size data (height depends only on font size)
    var metrics = context.measureText( message );
    var textWidth = metrics.width;
    
    // background color
    context.fillStyle   = "rgba(" + backgroundColor.r + "," + backgroundColor.g + ","
                                  + backgroundColor.b + "," + backgroundColor.a + ")";
    // border color
    context.strokeStyle = "rgba(" + borderColor.r + "," + borderColor.g + ","
                                  + borderColor.b + "," + borderColor.a + ")";
    context.lineWidth = borderThickness;
    roundRect(context, borderThickness/2, borderThickness/2, textWidth + borderThickness, fontsize * 1.4 + borderThickness, 6);
    // 1.4 is extra height factor for text below baseline: g,j,p,q.
    
    // text color
    context.fillStyle = "rgba(0, 0, 0, 1.0)";
    context.fillText( message, borderThickness, fontsize + borderThickness);
    
    // canvas contents will be used for a texture
    var texture = new THREE.Texture(canvas) 
    texture.needsUpdate = true;
    var spriteMaterial = new THREE.SpriteMaterial( 
        { map: texture } );
    var sprite = new THREE.Sprite( spriteMaterial );
    sprite.scale.set(0.14,0.07,1.0);
    //console.log(sprite);
    return sprite;  
}

function createLabel(text, size, color, font, underlineColor) {

      var canvas = document.createElement("canvas");
      var context = canvas.getContext("2d");
      context.font = size + "pt " + "Arial";

      var textWidth = context.measureText(text).width;

      canvas.width = textWidth;
      canvas.height = size + 10;

      // better if canvases have even heights
      if(canvas.width % 2){
          canvas.width++;
      }
      if(canvas.height % 2){
          canvas.height++;
      }

      if(underlineColor){
          canvas.height += 30;
      }
      context.font = size + "pt " + "Arial";;

      context.textAlign = "center";
      context.textBaseline = "middle";

      context.strokeStyle = 'black';

      context.miterLimit = 2;
      context.lineJoin = 'circle';
      context.lineWidth = 6;

      context.strokeText(text, canvas.width / 2, canvas.height / 2);

      context.lineWidth = 2;

      context.fillStyle = color;
      context.fillText(text, canvas.width / 2, canvas.height / 2);

      if(underlineColor){
          context.strokeStyle=underlineColor;
          context.lineWidth=4;
          context.beginPath();
          context.moveTo(0, canvas.height-10);
          context.lineTo(canvas.width-1, canvas.height-10);
          context.stroke();
      }

      return canvas;

}

function createTopCanvas(color) {
    var markerWidth = 20,
    markerHeight = 20;

    return renderToCanvas(markerWidth, markerHeight, function(ctx){
        ctx.fillStyle=color;
        ctx.beginPath();
        ctx.arc(markerWidth/2, markerHeight/2, markerWidth/4, 0, 2* Math.PI);
        ctx.fill();
    });

}

function renderToCanvas(width, height, renderFunction) {
    var buffer = document.createElement('canvas');
    buffer.width = width;
    buffer.height = height;
    renderFunction(buffer.getContext('2d'));

    return buffer;
}

function roundRect(ctx, x, y, w, h, r) 
{
    ctx.beginPath();
    ctx.moveTo(x+r, y);
    ctx.lineTo(x+w-r, y);
    ctx.quadraticCurveTo(x+w, y, x+w, y+r);
    ctx.lineTo(x+w, y+h-r);
    ctx.quadraticCurveTo(x+w, y+h, x+w-r, y+h);
    ctx.lineTo(x+r, y+h);
    ctx.quadraticCurveTo(x, y+h, x, y+h-r);
    ctx.lineTo(x, y+r);
    ctx.quadraticCurveTo(x, y, x+r, y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();   
}

document.addEventListener( 'mousemove', onDocumentMouseMove, false );
document.addEventListener('mouseup', onDocumentMouseup, false);

function onDocumentMouseup(event){
    var pin;
    
    raycaster.setFromCamera( mouse, camera );
    var intersects = raycaster.intersectObjects( scene.children );

    if ( intersects.length > 0 )
    {
        // if the closest object intersected is not the currently stored intersection object
        if ( intersects[ 0 ].object != INTERSECTED_CLICK )
        {   
            // restore previous intersection object (if it exists) to its original color
            if ( INTERSECTED_CLICK ) {
                pin = findNode(INTERSECTED_CLICK.id);
                if(pin){
                    // set a new color for closest object
                    //console.log(pin);
                    pin.node.tag.visible = false;
                } 
            }


            // store reference to closest object as current intersection object
            INTERSECTED_CLICK = intersects[ 0 ].object;
            // store color of closest object (for later restoration)

            pin = findNode(INTERSECTED_CLICK.id);
            if(pin){
                // set a new color for closest object
                setupTween(pin.node);
                app.cur_node_pin = pin.id;
                pin.node.tag.visible = true;
            } 
        }
    }
    else
    {
        // restore previous intersection object (if it exists) to its original color
        if ( INTERSECTED_CLICK )
        INTERSECTED_CLICK = null;
    }



}

function onDocumentMouseMove( event ) {
    event.preventDefault();
    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    var pin;
    // might need to find a better place for this
    raycaster.setFromCamera( mouse, camera );
    var intersects = raycaster.intersectObjects( scene.children );

    if ( intersects.length > 0 )
    {
        // if the closest object intersected is not the currently stored intersection object
        if ( intersects[ 0 ].object != INTERSECTED )
        {   
            // restore previous intersection object (if it exists) to its original color
            if ( INTERSECTED ) {
                pin = findNode(INTERSECTED.id);
                if(pin){
                    // set a new color for closest object
                    //console.log(pin);
                    if(app.cur_node_pin != pin.id){
                        pin.node.tag.visible = false;
                    }
                    
                } 
            }


            // store reference to closest object as current intersection object
            INTERSECTED = intersects[ 0 ].object;

            // store color of closest object (for later restoration)

            pin = findNode(INTERSECTED.id);
            if(pin){
                // set a new color for closest object
                //console.log(pin);
                pin.node.tag.visible = true;
                
            } 
        }
    }
    else
    {
        // restore previous intersection object (if it exists) to its original color
        if ( INTERSECTED )
            //INTERSECTED.material.color.setHex( INTERSECTED.currentHex );
        INTERSECTED = null;
    }

}

function findNode(objID) {
    for (var i = 0, len = app.node_list.length; i < len; i++) {
        if (app.node_list[i].id === objID)
            return app.node_list[i]; // Return as soon as the object is found
    }

    return null; // The object was not found
}

function animate(time) {
    requestAnimationFrame(animate);

    if (!is_loading) {
        controls.update();
        update_track_point_cloud();
        stats.update();
        TWEEN.update();
    }

    renderer.render(scene, camera);
}