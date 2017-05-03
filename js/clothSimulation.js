var Colors = {
	red:0xf25346,
	white:0xd8d0d1,
	wallColor:0x59332e,
	sphereColor:0xdddddd,
	modelColor:0x23190f,
	triColor:0x68c3c0,
};

var ObstaclesColor = {
	0: 0x505050,
	1: 0x59332e,
	2: 0x23500f,
	3: 0xdddddd,
}
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
	var showWireFrame = false;
	var floor;
	var triangle;
	var pyramid;
	var count = 0;
	var monster = new THREE.Geometry();
/**/

function handleWindowResize() {
	HEIGHT = window.innerHeight;
	WIDTH = window.innerWidth;
	camera.asp = WIDTH/HEIGHT;
	camera.updateProjectionMatrix();
	renderer.setSize(WIDTH/HEIGHT);
}

window.addEventListener('load', init, false);
var cloth_exp;
function init() {
	// setting up scene, camera nd the rendere
	createScene();
	// add lights
	createLights();

	// add objects
	createPyramid();
	// createTriangle();
	createFloor(700,700);
	createObstacles();
	// createBall();
	// debugParticleClass();
	console.log(ObstaclesColor);
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
	camera.position.z = -900;
	camera.position.y = 500;
	scene.add(camera);

	renderer = new THREE.WebGLRenderer({alpha: true, antialias:true});
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(WIDTH, HEIGHT);
	renderer.setClearColor(scene.fog.color);
	// console.log(WIDTH + " " + HEIGHT)
	renderer.shadowMap.enabled = true;
	container  = document.getElementById('cloth');
	container.appendChild(renderer.domElement);
	window.addEventListener('resize', handleWindowResize, false);
	// controls
	var controls = new THREE.OrbitControls(camera, renderer.domElement);
	controls.maxPolarAngle = Math.PI/2;
	document.addEventListener("keydown", handleKey, false);
	
}

function createLights() {
	// scene.add( new THREE.AmbientLight( 0x666666 ) );
	hemisphereLight = new THREE.HemisphereLight(0xaaaaaa, 0x000000, 0.9);
	shadowLight = new THREE.DirectionalLight(0xffffff, 0.9);
	shadowLight.castShadow = true;
	shadowLight.position.set(400, 500, -500);
	// shadowLight.castShadow = true;
	shadowLight.shadow.camera.left = -400;
	shadowLight.shadow.camera.right = 400;
	shadowLight.shadow.camera.top = 400;
	shadowLight.shadow.camera.bottom = -400;
	shadowLight.shadow.camera.near = 1;
	shadowLight.shadow.camera.far = 10000;

	shadowLight.shadow.mapSize.width = 2048;
	shadowLight.shadow.mapSize.height = 2048;

	scene.add(hemisphereLight);  
	scene.add(shadowLight);
}

function loop() {
	requestAnimationFrame(loop);
	// sea.mesh.position.y = 150;
	// sea.mesh.rotation.z += .005;
	// triangle.mesh.rotation.x += 0.005;
	render();
}

function render() {
	for(var ob = 0; ob < obstacles.length; ob++){
		// var collide = checkObstacleCollision(triangle, obstacles[ob]);
		var collide = checkObstacleCollision(pyramid, obstacles[ob]);
		// console.log(collide);
		if(collide) {
			console.log(ob);
			obstacles[ob].mesh.material.color.setHex(Colors.red);
		} else {
			obstacles[ob].mesh.material.color.setHex(ObstaclesColor[ob]);
		}
		obstacles[ob].mesh.material.wireframe = showWireFrame;
	}

	renderer.render(scene, camera);
}

function checkObstacleCollision(pid, object){
	update(pid);
	update(object);
	var p1 = pid.mesh.position;
	var p2 = object.mesh.position;
	// var t1 = pid.mesh.geometry.vertices;
	var result = false;
	var objGeom = object.mesh.geometry;
	var pidGeom = pid.mesh.geometry;
	for (var pf = 0; pf < pidGeom.faces.length; pf++){
		var pFace = pidGeom.faces[pf];
		var t1 = [pidGeom.vertices[pFace.a],pidGeom.vertices[pFace.b],pidGeom.vertices[pFace.c]];
		for (var f = 0; f < objGeom.faces.length; f++){
			var face = objGeom.faces[f];
			var t2 = [objGeom.vertices[face.a], objGeom.vertices[face.b], objGeom.vertices[face.c] ];
			// console.log(t2);
			result =  triangle_triangle_overlap(t1[0], t1[1], t1[2], t2[0], t2[1], t2[2]);
			if(result)
				break;
		}
		if(result)
			break;
	}
	reset(pid, p1);
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



function createFloor(l,b) {
	floor = new Floor(l,b);
	floor.mesh.receiveShadow = true;
	scene.add(floor.mesh);
}

function createTriangle() {
	triangle = new Triangle(0x303030);
	scene.add(triangle.mesh);
	triangle.mesh.geometry.verticesNeedUpdate = true;
}

function createPyramid() {
	pyramid = new Pyramid(0x303030);
	pyramid.mesh.scale.set(70,70,70);
	pyramid.mesh.position.y = 70;
	console.log(pyramid.mesh);
	scene.add(pyramid.mesh);
}

function createObstacles() {
	// triangle
	var ob = new Triangle(ObstaclesColor[0]);
	ob.mesh.castShadow = true;
	ob.mesh.position.x = -250;
	ob.mesh.position.z = -250;
	obstacles.push(ob);
	scene.add(obstacles[count].mesh);
	count++;
	// wall
	ob = new Wall(100, 200, 10);
	ob.mesh.position.z = 200;
	ob.mesh.position.y = 110;
	ob.mesh.castShadow = true;
	ob.mesh.receiveShadow = true;
	obstacles.push(ob);
	console.log(obstacles[count]);
	scene.add(obstacles[count].mesh);
	count++;
	// model
	var loader = new THREE.JSONLoader(); 
	console.log(showWireFrame);
	loader.load( 'models/monster.js', function ( geometry ) {	
		// var material = materials[ 0 ];
		monster.mesh = new THREE.Mesh( geometry, new THREE.MeshLambertMaterial({ color: Colors.brown,  wireframe:false }) );
		monster.mesh.position.set( 200, 20, 0 );
		monster.mesh.rotation.y = Math.PI/2	;
		monster.mesh.castShadow = true;
		var s = 0.15;
		
		monster.mesh.scale.set( s, s, s );
		scene.add( monster.mesh );

	} );
	console.log(monster);
	obstacles.push(monster);
	count++;
	//
	ob = new Sphere(50);
	ob.mesh.position.x = -250;
	ob.mesh.position.y = 60;
	ob.mesh.castShadow = true;
	obstacles.push(ob);
	scene.add(obstacles[count].mesh);	
	count++;
	// obstacles.push();
}


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

