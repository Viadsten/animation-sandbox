import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// scene
const scene = new THREE.Scene();

// camera
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0,6,10);

// renderer
const renderer = new THREE.WebGLRenderer();

// enabling shadows
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.BasicShadowMap;

document.body.appendChild(renderer.domElement);
renderer.setSize(window.innerWidth, window.innerHeight);

// orbit controls
const controls = new OrbitControls(camera, renderer.domElement);

// plane geometry
const geometryP = new THREE.PlaneGeometry(10, 10);
const materialP = new THREE.MeshStandardMaterial({color:0xffffff})
const plane = new THREE.Mesh(geometryP, materialP);

plane.castShadow = false;
plane.receiveShadow = true;
plane.rotation.x = -Math.PI / 2;
scene.add(plane);

// sphere geometry
const geometryS = new THREE.SphereGeometry(2, 32, 32);
const materialS = new THREE.MeshStandardMaterial({
  color:0xffffff,
  wireframe: true,
});

const sphere = new THREE.Mesh(geometryS, materialS);
sphere.position.set(0,3,0);
sphere.castShadow = true;
scene.add(sphere);

// light
let light = new THREE.DirectionalLight(0xFFFFFF, 1.0);
light.position.set(20, 100, 10);
light.target.position.set(0, 0, 0);
light.castShadow = true;
scene.add(light);

// rendering function
function animate() {	
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
};

animate();