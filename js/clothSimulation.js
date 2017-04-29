var Colors = {
	red:0xf25346,
	white:0xd8d0d1,
	brown:0x59332e,
	pink:0xF5986E,
	brownDark:0x23190f,
	blue:0x68c3c0,
};
/* GLobal variables*/
	var scene,
		camera, fov, asp, zNear, zFar,
		HEIGHT, WIDTH;
	var renderer, container;
	var hemisphereLight, shadowLight;
	var clothGeom, clothObject;
	var stats;
	var sphere;
	var ballPosition = new THREE.Vector3(0,-45,0);
	var obstacles = [];
/**/

var cloth_exp;
function init(event) {
	// setting up scene, camera nd the rendere
	createScene();
	// add lights
	createLights();

	// add objects
	// createSea();
	createTriangle();
	createFloor(700,700);
	createObstacles();
	// createBall();
	// debugParticleClass();
	debugTriangleClass();
	loop();
}

function createScene() {
	WIDTH = window.innerWidth;
	HEIGHT = window.innerHeight;

	scene = new THREE.Scene();
	// scene.fog = new THREE.Fog(0xcce0ff, 500, 10000 );

	// camera
	asp = WIDTH/HEIGHT;
	fov = 60;
	zNear = 1;
	zFar = 10000;
	camera = new THREE.PerspectiveCamera(fov, asp, zNear, zFar);
	scene.fog = new THREE.Fog(0xcce0ff, 500,9050);
	camera.position.x = 0;
	camera.position.z = -500;
	camera.position.y = 200;
	scene.add(camera);

	renderer = new THREE.WebGLRenderer({alpha: true, antialias:true});
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(WIDTH, HEIGHT);
	renderer.setClearColor(scene.fog.color);
	// console.log(WIDTH + " " + HEIGHT)
	renderer.shadowMap.enabled = true;
	container  = document.getElementById('cloth');
	container.appendChild(renderer.domElement);

	// controls
	var controls = new THREE.OrbitControls(camera, renderer.domElement);
	controls.maxPolarAngle = Math.PI/2;
	document.addEventListener("keydown", handleKey, false);
	window.addEventListener('resize', handleWindowResize, false);
}

function createLights() {
	// scene.add( new THREE.AmbientLight( 0x666666 ) );
	hemisphereLight = new THREE.HemisphereLight(0xaaaaaa, 0x000000, 0.9);
	shadowLight = new THREE.DirectionalLight(0xffffff, 0.9);
	shadowLight.position.set(150, 350, 350);
	// shadowLight.castShadow = true;
	shadowLight.shadow.camera.left = -400;
	shadowLight.shadow.camera.right = 400;
	shadowLight.shadow.camera.top = 400;
	shadowLight.shadow.camera.bottom = -400;
	shadowLight.shadow.camera.near = 1;
	shadowLight.shadow.camera.far = 1000;

	shadowLight.shadow.mapSize.width = 2048;
	shadowLight.shadow.mapSize.height = 2048;

	scene.add(hemisphereLight);  
	scene.add(shadowLight);
}

function createBall(ballSize) {
	var ballGeo = new THREE.SphereGeometry( ballSize, 20, 20 );
    var ballMaterial = new THREE.MeshPhongMaterial( { color: 0xaaaaaa , wireframe:true} );

    sphere = new THREE.Mesh( ballGeo, ballMaterial );
    sphere.castShadow = true;
    sphere.receiveShadow = true;
    scene.add( sphere );
}

function loop() {
	requestAnimationFrame(loop);
	// sea.mesh.position.y = 150;
	// sea.mesh.rotation.z += .005;
	// triangle.mesh.rotation.x += 0.005;
	render();
}

function render() {
	triangle2 = obstacles[0];
	for(var ob = 0; ob < obstacles.length; ob++){
		var collide = checkObstacleCollision(triangle, obstacles[ob]);
		if(collide) {
			obstacles[ob].mesh.material.color.setHex(Colors.red);
		} else {
			obstacles[ob].mesh.material.color.setHex(0x505050);
		}
	}
	// if (checkCollision(triangle, triangle2) == 1 ){
	// 	triangle2.mesh.material.color.setHex(Colors.red);
	// 	console.log("Collsion");
	// } else {
	// 	triangle2.mesh.material.color.setHex(0x505050);
	// }
	// sphere.position.copy(ballPosition);
	// camera.lookAt(scene.position);

	renderer.render(scene, camera);
}

function checkObstacleCollision(tri, object) {
	// for(object)
	update(tri);
	update(object);
	var p1 = tri.mesh.position;
	var p2 = object.mesh.position;
	var t1 = tri.mesh.geometry.vertices;
	var result = false;
	var objGeom = object.mesh.geometry;
	for (var f = 0; f < objGeom.faces.length; f++){
		var face = objGeom.faces[f];
		var t2 = [objGeom.vertices[face.a], objGeom.vertices[face.b], objGeom.vertices[face.c] ];
		// console.log(t2);
		result =  triangle_triangle_overlap(t1[0], t1[1], t1[2], t2[0], t2[1], t2[2]);
		if(result)
			return result;
	}
	reset(tri, p1);
	reset(object, p2);
	return result;
}

function checkCollision(tri1, tri2) {
	update(tri1);
	update(tri2);
	var p1 = tri1.mesh.position;
	var p2 = tri2.mesh.position;
	var t1 = tri1.mesh.geometry.vertices;
	var t2 = tri2.mesh.geometry.vertices;
	// console.log(t2);
	var result =  triangle_triangle_overlap(t1[0], t1[1], t1[2], t2[0], t2[1], t2[2]);
	// console.log(result);
	reset(tri1, p1);
	reset(tri2, p2);
	return result;
}




function update(triangle) {
	triangle.mesh.updateMatrix();
	triangle.mesh.geometry.applyMatrix(triangle.mesh.matrix);
	triangle.mesh.matrix.identity();
}

function reset(tri, pos) {
	tri.mesh.position.set(0,0,0);
	tri.mesh.rotation.set(0,0,0);
	tri.mesh.scale.set(1,1,1);
}

Floor = function(l,b) {
	var FloorGeom = new THREE.BoxGeometry(l,b,10,1,1,1);
	FloorGeom.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI/2));
	var FloorMat = new THREE.MeshPhongMaterial(
		{
			color: Colors.brown, 
			shading: THREE.FlatShading,
			// wireframe:true
		}
	);
	this.mesh = new THREE.Mesh(FloorGeom, FloorMat);
	this.mesh.receiveShadow = true;
}
var floor;
function createFloor(l,b) {
	floor = new Floor(l,b);
	scene.add(floor.mesh);
}

function handleWindowResize() {
	HEIGHT = window.innerHeight;
	WIDTH = window.innerWidth;
	renderer.setSize(WIDTH/HEIGHT);
	camera.asp = WIDTH/HEIGHT;
	camera.updateProjectionMatrix();
}
function handleKey(event) {
	var keyCode = event.which;

	if(keyCode == 87){
		triangle.mesh.position.z += 5;
		// update(triangle);		
	}
	if(keyCode == 83	){
		triangle.mesh.position.z -= 5;
		
	}
	if(keyCode == 65){
		triangle.mesh.position.x += 5;
		
	}
	if(keyCode == 68){
		triangle.mesh.position.x -= 5;
		
	}
	if(keyCode == 81){
		triangle.mesh.position.y += 5;
		
	}
	if(keyCode == 69){
		triangle.mesh.position.y -= 5;
		
	}
	if(keyCode == 67) {
		// console.log("rotate");
		triangle.mesh.rotateY(-0.05);
	}
}

Triangle = function(val) {
	var geometry = new THREE.Geometry();
	geometry.vertices= [new THREE.Vector3(-100, 0,0), 
						new THREE.Vector3(100, 0, 0), 
						new THREE.Vector3(0, 100,0)]; 
	geometry.faces = [new THREE.Face3(1,0,2)];
	console.log(geometry.vertices);
	console.log(geometry.faces);
	this.mesh= new THREE.Mesh( geometry, new THREE.MeshBasicMaterial({ color: val,  wireframe:false }) );
	
}

Wall = function(l, b, h) {
	var geometry = new THREE.CubeGeometry(l,b,h);
	this.mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ color: Colors.brown,  wireframe:false }) );
}

var triangle;
function createTriangle() {
	triangle = new Triangle(0x303030);
	scene.add(triangle.mesh);
	triangle.mesh.geometry.verticesNeedUpdate = true;
	// triangle2 = new Triangle(0x505050);
	// scene.add(triangle2.mesh);
}

var count = 0;
var monster = new THREE.Geometry();
function createObstacles() {
	// triangle
	var ob = new Triangle(0x505050);
	obstacles.push(ob);
	count++;
	scene.add(obstacles[0].mesh);
	// wall
	ob = new Wall(100, 200, 10);
	ob.mesh.position.z = 200;
	ob.mesh.position.y = 100;
	obstacles.push(ob);
	count++;
	console.log(obstacles[1]);
	scene.add(obstacles[1].mesh);
	// model
	var loader = new THREE.JSONLoader(); 
	
	loader.load( 'models/monster.js', function ( geometry ) {	
		// var material = materials[ 0 ];
		monster.mesh = new THREE.Mesh( geometry,  new THREE.MeshBasicMaterial({ color: Colors.brown,  wireframe:false }) );
		monster.mesh.position.set( 200, 0, 0 );
		monster.mesh.rotation.y = Math.PI/2	;
		var s = 0.15;
		
		monster.mesh.scale.set( s, s, s );
		scene.add( monster.mesh );

	} );
	console.log(monster);
	obstacles.push(monster);
	//
	// var FLOOR = -10;
	// var material_spheres = new THREE.MeshLambertMaterial( { color: 0xdddddd } ),
	// 	sphere = new THREE.SphereGeometry( 100, 16, 8 );

	// for ( var i = 0; i < 5; i ++ ) {

	// 	mesh = new THREE.Mesh( sphere, material_spheres );

	// 	mesh.position.x = 500 * ( Math.random() - 0.5 );
	// 	mesh.position.y = 300 * ( Math.random() - 0 ) + FLOOR;
	// 	mesh.position.z = 100 * ( Math.random() - 1 );

	// 	mesh.scale.x = mesh.scale.y = mesh.scale.z = 0.25 * ( Math.random() + 0.5 );

	// 	scene.add( mesh );

	// }

}

window.addEventListener('load', init, false);

function debugTriangleClass() {
	var p1 = new THREE.Vector3(-150,0,0);
	var q1 = new THREE.Vector3(150,0,0);
	var r1 = new THREE.Vector3(0,150,0);
	var p2 = new THREE.Vector3(-150,0,0);
	var q2 = new THREE.Vector3(150,3,0);
	var r2 = new THREE.Vector3(3,1,0);
	console.log(p1);
	var result = triangle_triangle_overlap(p1, q1, r1, p2, q2, r2);
	console.log(result);
}
