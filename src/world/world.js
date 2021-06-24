import * as THREE from 'three';
// import gsap from 'gsap';
import * as dat from 'dat.gui';
import { camera, scene, renderer, orbit, loadingManager, clock, scrinit, resize } from './utilities/scr';


let cursor, galaxy;

// let textureLoader = new THREE.TextureLoader();


init();
animate();

function init() {
	//Init Scene Camera Renderer with orbit controls.
	scrinit("controls");

	//Cursor
	cursor = { x: 0, y: 0 }

	//GUI
	const gui = new dat.GUI();

	/**
	 * Galaxy
	 */
	
	let galaxyGeometry = null;
	let galaxyMaterial = null;
	galaxy = null;

	const parameters = {};
	parameters.count = 100000;
	parameters.size = 0.01;
	parameters.radius = 5;
	parameters.branches = 3;
	parameters.spin = 1;
	parameters.randomness = 0.2;
	parameters.randomnessPower = 3;
	parameters.insideColor = '#ff5588';
	parameters.outsideColor = '#1b2984';

	const generateGalaxy = () => {

		if(galaxy !== null){
			galaxyGeometry.dispose();
			galaxyMaterial.dispose();
			scene.remove(galaxy);
		}

		galaxyGeometry = new THREE.BufferGeometry();
		galaxyMaterial = new THREE.PointsMaterial({
			size: parameters.size,
			sizeAttenuation: true,
			depthWrite: false,
			blending: THREE.AdditiveBlending,
			vertexColors:true,
		});
		let positions = new Float32Array(parameters.count * 3);
		let colors = new Float32Array(parameters.count * 3);

		for (let i = 0; i < parameters.count; i++) {
			//Position
			let vertex = i*3;
			let radius = Math.random()*parameters.radius;
			let theta = i%parameters.branches *(Math.PI*2/parameters.branches);
			let spin = radius*parameters.spin;

			let randomX =  Math.pow(Math.random(),parameters.randomnessPower)*(Math.random()<0.5?1:-1);
			let randomY =  Math.pow(Math.random(),parameters.randomnessPower)*(Math.random()<0.5?1:-1);
			let randomZ =  Math.pow(Math.random(),parameters.randomnessPower)*(Math.random()<0.5?1:-1);

			positions[vertex   ] = Math.cos(theta + spin)*radius + randomX;
			positions[vertex +1] = randomY;
			positions[vertex +2] = Math.sin(theta + spin)*radius +randomZ;

			//Color
			let colorInside = new THREE.Color(parameters.insideColor)
			let colorOutside = new THREE.Color(parameters.outsideColor)
			const mixedColor = colorInside.clone()
			mixedColor.lerp(colorOutside,radius/parameters.radius)

			colors[vertex   ] = mixedColor.r
			colors[vertex +1] = mixedColor.g
			colors[vertex +2] = mixedColor.b
		}

		galaxyGeometry.setAttribute('position', new THREE.BufferAttribute(positions,3));
		galaxyGeometry.setAttribute('color', new THREE.BufferAttribute(colors,3));
		galaxy = new THREE.Points(galaxyGeometry, galaxyMaterial);

		scene.add(galaxy);
		galaxy.rotation.x = Math.PI/4;
	};

	generateGalaxy(parameters);
	gui.add(parameters,'count').min(100).max(1000000).step(200).onFinishChange(generateGalaxy).name('particles');
	gui.add(parameters,'size').min(0.001).max(0.1).step(0.001).onFinishChange(generateGalaxy).name('particle size');
	gui.add(parameters,'radius').min(1).max(20).step(0.01).onFinishChange(generateGalaxy);
	gui.add(parameters,'branches').min(2).max(20).step(1).onFinishChange(generateGalaxy);
	gui.add(parameters,'spin').min(-5).max(5).step(0.001).onFinishChange(generateGalaxy);
	gui.add(parameters,'randomness').min(0).max(2).step(0.001).onFinishChange(generateGalaxy);
	gui.add(parameters,'randomnessPower').min(1).max(10).step(0.001).onFinishChange(generateGalaxy);
	gui.addColor(parameters,'insideColor').onFinishChange(generateGalaxy);
	gui.addColor(parameters,'outsideColor').onFinishChange(generateGalaxy);
	/**
	 * Galaxy
	 */

}

function animate() {
	const elapsedTime = clock.getElapsedTime();
	orbit.update();
	galaxy.rotation.y = elapsedTime/6

	//All Logic above this
	renderer.render(scene, camera);
	requestAnimationFrame(animate);
}

function handleMousemove(e) {
	cursor.x = e.clientX / window.innerWidth - 0.5;
	cursor.y = -(e.clientY / window.innerHeight - 0.5);
}

function fullScreenhandler() {
	if (document.fullscreenElement) {
		document.exitFullscreen();
	} else {
		document.body.requestFullscreen();
	}
}

//Event Listeners
window.addEventListener('resize', resize);
window.addEventListener('mousemove', handleMousemove);
window.addEventListener('dblclick', fullScreenhandler);
