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
/**/

var cloth_exp;
function init(event) {
	// setting up scene, camera nd the rendere
	createScene();
	// add lights
	createLights();

	// add objects
	// createSea();
	// createTriangle();
	createCloth();
	createBall(ballSize);
	
	// debugParticleClass();
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
	camera.position.z = -250;
	camera.position.y = 100;
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
	controls.minDistance = 1000;
	controls.maxDistance = 7500;
	document.addEventListener("keydown", handleKey, false);
	window.addEventListener('resize', handleWindowResize, false);
}

function createLights() {
	// scene.add( new THREE.AmbientLight( 0x666666 ) );
	hemisphereLight = new THREE.HemisphereLight(0xaaaaaa, 0x000000, 0.9);
	shadowLight = new THREE.DirectionalLight(0xffffff, 0.9);
	shadowLight.position.set(50, 200,100);
	// shadowLight.castShadow = true;
	shadowLight.shadow.camera.left = -300;
	shadowLight.shadow.camera.right = 300;
	shadowLight.shadow.camera.top = 300;
	shadowLight.shadow.camera.bottom = -300;
	shadowLight.shadow.camera.near = 1;
	shadowLight.shadow.camera.far = 1000;

	shadowLight.shadow.mapSize.width = 2048;
	shadowLight.shadow.mapSize.height = 2048;

	scene.add(hemisphereLight);  
	scene.add(shadowLight);
}
var smooth;
function createCloth() {
	// material
	var loader = new THREE.TextureLoader();
	loader.crossOrigin = '';
	var clothTex = loader.load('https://ajgavane.github.io/AdvanceGraphicsProject/models/cloth.jpg');
	clothTex.wrapS = clothTex.wrapT = THREE.RepeatWrapping;
	// clothTex.anisotropy = 16;

	var clothMaterial = new THREE.MeshPhongMaterial(
		{
			specular: 0x040404,
			map     : clothTex,
			side	: THREE.DoubleSide,
			alphaTest: 0.5
		}
	);

	// geometry
	console.log(clothFunction);
	console.log(cloth.width + " " + cloth.height);
	clothGeom = new THREE.ParametricGeometry(clothFunction, cloth.width, cloth.height);
	clothGeom.dynamic = true;
	
	var uniforms = {
		texture: 
			{value: clothTex}
		};
	var vertexShader = `
		#include <packing>
		unifrom sampler2D texure;
		varying vec2 v_UV;
		void main() {
			vec4 pixel = texture2D(texure, v_UV);
			if(pixel.a < 0.5) discard;
			gl_FragData[0] = packDepthToTGBA(gl_FragCoord.z);
		}
	`;
	var fragmentShader = `
		varying v_UV;
		void main() {
			v_UV = 0.65*uv;
			vec4 mvPosition = modelViewMatirx * vec4(position, 1.0);
			gl_Position = projectionMatrix * mvPosition;
		}
	`;

	// create cloth mesh
	clothObject = new THREE.Mesh(clothGeom, clothMaterial);
	clothObject.position.set(0,0,0);
	clothObject.castShadow = true;
	clothObject.material.side = THREE.DoubleSide;
	scene.add(clothObject);
	clothObject.customDepthMaterial = new THREE.ShaderMaterial(
		{
			uniforms		: uniforms,
			vertexShader 	: vertexShader,
			fragmentShader 	: fragmentShader,
			side 			: THREE.DoubleSide
		}
	);
	
}

function createBall(ballSize) {
	 var ballGeo = new THREE.SphereGeometry( ballSize, 20, 20 );
    var ballMaterial = new THREE.MeshPhongMaterial( { color: 0xaaaaaa } );

    sphere = new THREE.Mesh( ballGeo, ballMaterial );
    sphere.castShadow = true;
    sphere.receiveShadow = true;
    scene.add( sphere );
}

function loop() {
	requestAnimationFrame(loop);
	var time = Date.now();
	clothSimulation(time);
	render();
}

function render() {
	var particles = cloth.particles;
	// console.log(particles[0]);
	for(var p = 0; p < particles.length; p++){
		// console.log(clothGeom);
		clothGeom.vertices[p].copy(particles[p].currentPosition);
	}
	// clothGeom.applyMatrix(new THREE.Matrix4().makeRotationY(Math.PI/2));
	clothGeom.computeFaceNormals;
	clothGeom.computeVertexNormals;
	clothGeom.normalsNeedUpdate = true;
	clothGeom.verticesNeedUpdate = true;

	sphere.position.copy(ballPosition);
	// clothGeom.makeRotationY(Math.PI/2);
	// camera.lookAt(scene.position);

	renderer.render(scene, camera);
}

function handleKey(event) {
	var keyCode = event.which;

	if(keyCode == 87){
		ballPosition.z += 5;
	}
	if(keyCode == 83	){
		ballPosition.z -= 5;
	}
	if(keyCode == 65){
		ballPosition.x += 5;
	}
	if(keyCode == 68){
		ballPosition.x -= 5;
	}
	if(keyCode == 81){
		ballPosition.y += 5;
	}
	if(keyCode == 69){
		ballPosition.y -= 5;
	}
}


function debugParticleClass() {
	var position = new THREE.Vector3(1,2,1);
	var position2 = new THREE.Vector3(2,3,4);

	var p1 = new Particle(position);
	var p2 = new Particle(position2);
	var c = new Constraint(p1,p2);
	console.log("p1 "); console.log(p1.currentPosition);
	console.log("p2 "); console.log(p2.currentPosition);

	p1.update(new THREE.Vector3(1,1,1));
	console.log("p1 "); console.log(p1.currentPosition);
	c.satisfyConstraint();
	// console.log(cloth_exp);
	
	var force = new THREE.Vector3(0.0, -2.0, 0.0)
	console.log("force added");
	cloth_exp.addForce(force);

	console.log(cloth_exp.particles[5].currentPosition);
	console.log("Xloth update");
	cloth_exp.update();
	console.log(cloth_exp.particles[5].currentPosition);
	// cloth_exp.addForce(force);
	// cloth_exp.update();
	// console.log(cloth_exp);
	// cloth_exp.addForce(new THREE.Vector3(0.0, -2.0, 0.0));
	// cloth_exp.update();
	// var temp = cloth_exp.getParticle(2,2);
	// console.log(temp);
	// console.log(cloth_exp.particles);
}


function handleWindowResize() {
	HEIGHT = window.innerHeight;
	WIDTH = window.innerWidth;
	renderer.setSize(WIDTH,HEIGHT);
	camera.asp = WIDTH/HEIGHT;
	camera.updateProjectionMatrix();
}

window.addEventListener('load', init, false);