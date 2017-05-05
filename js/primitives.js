Triangle = function(val) {
	var geometry = new THREE.Geometry();
	geometry.vertices= [new THREE.Vector3(-100, 10,0), 
						new THREE.Vector3(100, 10, 0), 
						new THREE.Vector3(0, 110,0)]; 
	geometry.faces = [new THREE.Face3(1,0,2)];
	this.mesh= new THREE.Mesh( geometry, new THREE.MeshBasicMaterial({ color: val,  wireframe:false , side: THREE.DoubleSide}) );
	
}

Wall = function(l, b, h) {
	var geometry = new THREE.CubeGeometry(l,b,h);
	var mat = new THREE.MeshLambertMaterial({ color:ObstaclesColor[1],  wireframe:false }) ;
	this.mesh = new THREE.Mesh(geometry,mat );
}

Floor = function(l,b) {
	var FloorGeom = new THREE.BoxGeometry(l,b,10,1,1,1);
	FloorGeom.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI/2));
	var FloorMat = new THREE.MeshPhongMaterial(
		{
			color: 0x606060, 
			shading: THREE.FlatShading,
			// wireframe:true
		}
	);
	this.mesh = new THREE.Mesh(FloorGeom, FloorMat);
	this.mesh.receiveShadow = true;
}

Pyramid = function(val) {
	var pyramidGeom = new THREE.CylinderGeometry(0, 1.5, 1.5, 4, false);
	var pyramidMat = new THREE.MeshLambertMaterial({
		color: 0x303030,
		side: THREE.DoubleSide,
		wireframe: false
	});
	this.mesh = new THREE.Mesh(pyramidGeom, pyramidMat);
}

Sphere = function(rad) {
	var sphereMat = new THREE.MeshLambertMaterial( { color:ObstaclesColor[3], wireframe: showWireFrame } );
	var	sphereGeom = new THREE.SphereGeometry( rad, 16, 8 );
	this.mesh = new THREE.Mesh(sphereGeom, sphereMat);
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
	pyramid.mesh.scale.set(50,50,50);
	pyramid.mesh.position.y = 70;
	pyramid.mesh.position.z = -250;
	scene.add(pyramid.mesh);
}

function drawLines(p) {
	var material = new THREE.LineBasicMaterial({
		color: 0x0000ff
	});

	var geometry = new THREE.Geometry();
	geometry.vertices.push(
		p[0],
		p[1],
		p[2],
		p[3],
		p[0],
		p[4],
		p[5],
		p[6],
		p[7],
		p[4],
		p[3],
		p[7],
		p[2],
		p[6],
		p[1],
		p[5],
		p[0]
	);

	var line = new THREE.Line( geometry, material );
	scene.add( line );
}

