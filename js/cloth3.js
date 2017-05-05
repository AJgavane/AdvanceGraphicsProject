var MASS = 3;
var naturalLength = 10;
var naturalLength2 = naturalLength*2	;
var diagNaturalLength = Math.sqrt(2*naturalLength * naturalLength);
var diagNaturalLength2 = Math.sqrt(2*naturalLength2 * naturalLength2);
var DAMPING = 0.05;
var DRAG = 1 - DAMPING;
var GRAVITY = 1600 ;
var gravity = new THREE.Vector3(0, -GRAVITY, 0);
var t = 0.018;
var tsq = t*t;
var width = 25;
var height = 25;
var particleSeparation = 1;
var ballPosition = new THREE.Vector3(70, -265, 300);
var ballSize = 100;
var hinge = true;

var clothFunction = plane(naturalLength * width, naturalLength * height);
function plane(w, h)  {
	return function (u,v) {
		var x = (u - 0.5) * w;
		var y = 0;
		var z = (v + 0.5) * h;;
		return new THREE.Vector3(x, y, z);
	}
}

var cloth = new Cloth(width, height);
var lastTime;

function Cloth(width, height) {
	this.width = width;
	this.height = height;

	var particles = [];
	var constraints = [];

	// create particles
	var h,w;
	for( h = 0;  h <height + 1; h++) {
		for( w = 0; w < width + 1; w++){
			particles.push( new Particle(w/width, h/height, 0, MASS) );
		}
	}
	// structural constraints
	for(h = 0; h < height; h++){
		for(w = 0; w < width; w++) {
			constraints.push([particles[index(w,h)],particles[index(w+1,h)], naturalLength]);
			constraints.push([particles[index(w,h)],particles[index(w,h+1)], naturalLength]);
			constraints.push([particles[index(w+1,h)],particles[index(w,h+1)], diagNaturalLength]);
			constraints.push([particles[index(w,h)],particles[index(w+1,h+1)], diagNaturalLength]);
		}
	}
	// for(w = width, h = 0; h < height; h++){
	// 	constraints.push([particles[index(w,h)],particles[index(w,h+1)], naturalLength]);
	// }
	// for(h = height, w = 0; w < width; w++){
	// 	constraints.push([particles[index(w,h)],particles[index(w+1,h)], naturalLength]);
	// }

	for(h = 0; h < height-1; h++){
		for(w = 0; w < width-1; w++) {
			constraints.push([particles[index(w,h)],particles[index(w+2,h)], naturalLength2]);
			constraints.push([particles[index(w,h)],particles[index(w,h+2)], naturalLength2]);

		}
	}
	for(w = width, h = 0; h < height-1; h++){
		constraints.push([particles[index(w,h)],particles[index(w,h+2)], naturalLength2]);
	}
	for(h = height, w = 0; w < width-1; w++){
		constraints.push([particles[index(w,h)],particles[index(w+2,h)], naturalLength2]);
	}

	this.particles = particles;
	this.constraints = constraints;

	
	function index(w,h){
		return w + h*(width+1);
	}
	this.index = index;
}

function Particle(x, y, z, mass){
	this.currentPosition = clothFunction(x,y);
	this.oldPosition = clothFunction(x,y);
	this.original = clothFunction(x,y); 
	this.acceleration = new THREE.Vector3(0,0,0);
	this.mass = mass;
	// this.invMass = 1/mass;
	this.temp = new THREE.Vector3();
	this.radius = particleSeparation;
	// this.temp2 = new THREE.Vector3();
}

Particle.prototype.addForce = function(force) {
	var f = new THREE.Vector3;
	f.copy(force);
	// console.log(f);
	this.acceleration.add(f.multiplyScalar(1/this.mass));
};

Particle.prototype.timeStep = function(tsq) {
	var p = this.temp.subVectors(this.currentPosition, this.oldPosition);
	p.multiplyScalar(1 - DAMPING).add(this.currentPosition);
	p.add(this.acceleration.multiplyScalar(tsq));

	this.temp = this.oldPosition;
	this.oldPosition = this.currentPosition;
	this.currentPosition = p;
	this.acceleration.set(0,0,0);
};

function satisfyConstraints(p1, p2, distance){
	var p1p2 = new THREE.Vector3();
	p1p2.subVectors(p2.currentPosition, p1.currentPosition);
	var currDist = p1p2.length();
	if(currDist == 0)  return;
	var correctionVector = p1p2.multiplyScalar(1 - distance/currDist);
	var halfVector = correctionVector.multiplyScalar(0.5);
	p1.currentPosition.add(halfVector);
	p2.currentPosition.sub(halfVector);
}

function clothSimulation(time) {
	if(!lastTime) {
		lastTime = time;
		return;
	}

	var particles = cloth.particles;
	var particle;
	 var plen = particles.length;

	for(var p = 0; p < plen ; p++ ){
		particle = particles[p];
		particle.addForce( gravity);
		particle.timeStep(tsq);
	}

	// self collision detection
	for (var i = 0; i < 1; i++) {
		for(var p1 = 0; p1 < plen; p1++){
			var particle1 = particles[p1];
			for( var p2 = 0; p2 < plen && p2 != p1; p2++){	
				var particle2 = particles[p2];
				var p1p2 = new THREE.Vector3();
				p1p2.subVectors(particle2.currentPosition, particle1.currentPosition);
				var currDist = p1p2.length();
				if(currDist < 2*particleSeparation){
					// console.log("collide :" + currDist );
					p1p2.normalize();
					p1p2.multiplyScalar(2*particleSeparation);
					var halfVector = p1p2.multiplyScalar(0.5);
					particle1.currentPosition.add(halfVector);
					particle2.currentPosition.sub(halfVector);
				}
			}
		}
	}

	var constraints = cloth.constraints;
	var clen = constraints.length;
	var constraint;
	// run this for multiple times for more accuracy
	for(var i = 0; i < 15; i++){
		for(var c = 0 ; c < clen; c++) {
			constraint = constraints[c];
			// console.log(constraint[0]);
			satisfyConstraints(constraint[0], constraint[1], constraint[2]);
		}
	}
	if(hinge){
		for(var i = 0; i < 2; i++){
			var p1 = particles[index(0+i,height)];
			p1.currentPosition.copy(p1.original);
			p1.oldPosition.copy(p1.original);
			var p2 = particles[index(width-i, height)];
			p2.currentPosition.copy(p2.original);
			p2.oldPosition.copy(p2.original);
		}
	}
	
	for( var p = 0; p < plen; p++){
		particle = particles[p];
		var pos = particle.currentPosition;
		var pr = new THREE.Vector3();
		pr.subVectors(pos, ballPosition);
		if(pr.length() < ballSize+particle.radius ){
			pr.normalize();
			pr.multiplyScalar(ballSize+particle.radius);
			pos.copy(ballPosition).add(pr);
		}
	}


	// floor constraints
	
	// console.log(check);
	for(var p = 0; p < plen; p++) {
		particle = particles[p];	
		if(particle.currentPosition.y < -500) {
			particle.currentPosition.y = -500;
		}

	}
}

function index(w,h){
	return w + h*(width+1);
}