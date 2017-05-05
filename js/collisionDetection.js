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
	var obbs = [];
	var showWireFrame = false;
	var floor;
	var triangle;
	var pyramid;
	var count = 0;
	var monster = new THREE.Geometry();
	var obbPyramid;
	var showOBB = false;
/**/

function handleWindowResize() {
	HEIGHT = window.innerHeight;
	WIDTH = window.innerWidth;
	camera.asp = WIDTH/HEIGHT;
	camera.updateProjectionMatrix();
	renderer.setSize(WIDTH, HEIGHT);
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
	createFloor(800,800);
	createObstacles();
	var callback = function() {
		obbPyramid = OBBFromTriangle(pyramid.mesh); 
		addOBBs();
		loop();
	}
	setTimeout(callback, 1000);
}

function createScene() {
	WIDTH = window.innerWidth;
	HEIGHT = window.innerHeight;
	scene = new THREE.Scene();
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
	scene.add( new THREE.AmbientLight( 0x666666 ) );
	hemisphereLight = new THREE.HemisphereLight(0xaaaaaa, 0x000000, 0.9);
	shadowLight = new THREE.DirectionalLight(0xffffff, 0.9);
	shadowLight.castShadow = true;

	shadowLight.position.set(400, 500, -500);
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
	render();
}

function render() {
	if(showOBB == true)
		addBBForObstacles();
	for(var ob = 0; ob < obstacles.length; ob++){
		update(pyramid);
		var intersectsOBB = checkCollisionWithOBB(pyramid, obbs[ob]);
		reset(pyramid);
		if(intersectsOBB ){
			obstacles[ob].mesh.material.transparent = true;
			obstacles[ob].mesh.material.opacity = 0.7;
			console.log("entered obstacle: " + ob);
			var collide = checkObstacleCollision(pyramid, obstacles[ob]);
			if(collide) {
				obstacles[ob].mesh.material.color.setHex(Colors.red);
			} else {
				obstacles[ob].mesh.material.color.setHex(ObstaclesColor[ob]);
			}
		} else {
			obstacles[ob].mesh.material.opacity = 1;
			obstacles[ob].mesh.material.transparent = false;
			obstacles[ob].mesh.material.color.setHex(ObstaclesColor[ob]);
			if(ob == 0){
				var collide = checkObstacleCollision(pyramid, obstacles[ob]);
				if(collide) {
					obstacles[ob].mesh.material.color.setHex(Colors.red);
				} else {
					obstacles[ob].mesh.material.color.setHex(ObstaclesColor[ob]);
				}
			}
		}
		obstacles[ob].mesh.material.wireframe = showWireFrame;
	}
	renderer.render(scene, camera);
}

function checkCollisionWithOBB(pyramid, obb) {
	var points = pyramid.mesh.geometry.vertices;
	for(var p = 0; p < points.length; p++){
		if( pointObbIntersects(points[p], obb)){
			return true;
		}
	}
	return false;
}

function pointObbIntersects(point, obb) {
	var displacement = new THREE.Vector3();
	displacement.subVectors(point, obb.position);
	var x, y, z;
	x = Math.abs(displacement.dot(obb.r));
	y = Math.abs(displacement.dot(obb.u));
	z = Math.abs(displacement.dot(obb.f));
	// console.log(x + "<=" + obb.radius.x + "  " + y + "<=" + obb.radius.y + " " + z + "<=" + obb.radius.z);
	return (x <= obb.radius.x && y <= obb.radius.y && z <= obb.radius.z);
}

function checkObstacleCollision(pid, object){
	var p1 = pid.mesh.position;
	var p2 = object.mesh.position;
	update(pid);
	update(object);
	
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


function update(triangle) {
	triangle.mesh.updateMatrix();
	triangle.mesh.geometry.applyMatrix(triangle.mesh.matrix);
	triangle.mesh.matrix.identity();
	triangle.mesh.geometry.verticesNeedUpdate = true;
}

function reset(tri, pos) {
	// console.log(pos);
	tri.mesh.position.set(0, 0, 0);
	// tri.mesh.rotation.set(0,0,0);
	tri.mesh.scale.set(1,1,1);
}


function createObstacles() {
	// Triangle
	var ob = new Triangle(ObstaclesColor[0]);
	ob.mesh.castShadow = true;
	ob.mesh.geometry.applyMatrix( new THREE.Matrix4().makeTranslation( -250,100,-200 ) );
	obstacles.push(ob);
	scene.add(obstacles[count].mesh);
	obstacles[count].mesh.geometry.verticesNeedUpdate = true;
	// obstacles[count].mesh.position.z = -250;
	count++;

	// wall
	ob = new Wall(100, 200, 30);
	ob.mesh.castShadow = true;
	ob.mesh.receiveShadow = true;
	ob.mesh.geometry.applyMatrix( new THREE.Matrix4().makeRotationZ ( 01 ) );
	ob.mesh.geometry.applyMatrix( new THREE.Matrix4().makeTranslation( 300, 300, 100 ) );
	obstacles.push(ob);
	scene.add(obstacles[count].mesh);
	obstacles[count].mesh.geometry.verticesNeedUpdate = true;
	count++;

	// model
	var loader = new THREE.JSONLoader(); 
	loader.load( 'https://ajgavane.github.io/AdvanceGraphicsProject/models/monster.js', function ( geometry ) {	
		// var material = materials[ 0 ];
		monster.mesh = new THREE.Mesh( geometry, new THREE.MeshLambertMaterial({ color:ObstaclesColor[2],  wireframe:false }) );
		monster.mesh.castShadow = true;
		var s = 0.15;
		monster.mesh.scale.set(s, s, s);
		monster.mesh.geometry.applyMatrix( new THREE.Matrix4().makeTranslation( -350, 300, 10 ) );
		scene.add( monster.mesh );
	} );
	obstacles.push(monster);	
	sleep(2000);
	count++;

	// Spehere
	ob = new Sphere(50);
	ob.mesh.castShadow = true;
	ob.mesh.geometry.applyMatrix( new THREE.Matrix4().makeTranslation( -300, 200, 10 ) );
	// ob.mesh.position.set(-300,60,0);
	obstacles.push(ob);
	scene.add(obstacles[count].mesh);
	obstacles[count].mesh.geometry.verticesNeedUpdate = true;
	count++;
}

function sleep (time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

function addBBForObstacles(){
	// var aabb;
	for( var ob = 0; ob < obstacles.length; ob++){
		update(obstacles[ob]);
		var pos = obstacles[ob].mesh.position;
		var mesh = obstacles[ob].mesh;
		var temp = OBBFromPoints(mesh);
		var p = getBoundingBox(temp);
		drawLines(p);
		reset(obstacles[ob], pos);
	}
}

function addOBBs(){
	// var aabb;
	for( var ob = 0; ob < obstacles.length; ob++){
		update(obstacles[ob]);
		var pos = obstacles[ob].mesh.position;
		var mesh = obstacles[ob].mesh;
		var temp = OBBFromPoints(mesh);
		obbs[ob] = temp;
		reset(obstacles[ob], pos);
	}
	console.log(obbs);
}

