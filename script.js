"use strict";
// Three.js Scene Setup
const container = document.getElementById('canvas-container');
const width = container.clientWidth;
const height = container.clientHeight;
const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x000000, 15, 60);
const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
camera.position.set(0, 0, 20);
const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
renderer.setSize(width, height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
container.appendChild(renderer.domElement);
// Mouse tracking
const mouse = { x: 0, y: 0 };
const targetMouse = { x: 0, y: 0 };
// Matrix Rain Particles
const particleCount = window.innerWidth < 768 ? 1000 : window.innerWidth < 1024 ? 1500 : 2000;
const geometry = new THREE.BufferGeometry();
const positions = new Float32Array(particleCount * 3);
const velocities = new Float32Array(particleCount);
const sizes = new Float32Array(particleCount);
const colors = new Float32Array(particleCount * 3);
for (let i = 0; i < particleCount; i++) {
    const i3 = i * 3;
    positions[i3] = (Math.random() - 0.5) * 80;
    positions[i3 + 1] = (Math.random() - 0.5) * 80;
    positions[i3 + 2] = (Math.random() - 0.5) * 50;
    velocities[i] = Math.random() * 0.08 + 0.02;
    sizes[i] = Math.random() * 0.3 + 0.1;
    const brightness = Math.random() * 0.6 + 0.4;
    colors[i3] = 0;
    colors[i3 + 1] = brightness;
    colors[i3 + 2] = brightness * 0.2;
}
geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
const particleMaterial = new THREE.PointsMaterial({
    size: 0.2,
    sizeAttenuation: true,
    vertexColors: true,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending,
    depthWrite: false
});
const particleSystem = new THREE.Points(geometry, particleMaterial);
scene.add(particleSystem);
// Grid
const gridSize = 50;
const gridDivisions = 50;
const gridHelper = new THREE.GridHelper(gridSize, gridDivisions, 0x00ff00, 0x003300);
gridHelper.position.y = -15;
gridHelper.rotation.x = Math.PI / 6;
gridHelper.material.transparent = true;
gridHelper.material.opacity = 0.3;
scene.add(gridHelper);
const verticalGrid = new THREE.GridHelper(gridSize, gridDivisions, 0x00ff00, 0x002200);
verticalGrid.rotation.x = Math.PI / 2;
verticalGrid.position.z = -20;
verticalGrid.material.transparent = true;
verticalGrid.material.opacity = 0.15;
scene.add(verticalGrid);
// Floating Shapes
const shapeGeometries = [
];
const shapeCount = window.innerWidth < 768 ? 4 : window.innerWidth < 1024 ? 6 : 8;
const shapes = [];
for (let i = 0; i < shapeCount; i++) {
    const geom = shapeGeometries[Math.floor(Math.random() * shapeGeometries.length)];
    const material = new THREE.MeshBasicMaterial({
        color: 0x00ff00,
        wireframe: true,
        transparent: true,
        opacity: Math.random() * 0.2 + 0.15
    });
    const mesh = new THREE.Mesh(geom, material);
    mesh.position.set((Math.random() - 0.5) * 30, (Math.random() - 0.5) * 20, (Math.random() - 0.5) * 20);
    mesh.rotation.set(Math.random() * Math.PI * 2, Math.random() * Math.PI * 2, Math.random() * Math.PI * 2);
    shapes.push({
        mesh,
        rotationSpeed: {
            x: (Math.random() - 0.5) * 0.02,
            y: (Math.random() - 0.5) * 0.02,
            z: (Math.random() - 0.5) * 0.02
        },
        floatSpeed: Math.random() * 0.5 + 0.3,
        floatOffset: Math.random() * Math.PI * 2
    });
    scene.add(mesh);
}
// Lights
const ambientLight = new THREE.AmbientLight(0x00ff00, 0.3);
scene.add(ambientLight);
const pointLight1 = new THREE.PointLight(0x00ff00, 1, 50);
pointLight1.position.set(10, 10, 10);
scene.add(pointLight1);
const pointLight2 = new THREE.PointLight(0x00ff00, 0.5, 50);
pointLight2.position.set(-10, -10, -10);
scene.add(pointLight2);
// Animation
let time = 0;
function animate() {
    requestAnimationFrame(animate);
    time += 0.01;
    mouse.x += (targetMouse.x - mouse.x) * 0.05;
    mouse.y += (targetMouse.y - mouse.y) * 0.05;
    // Update particles
    const positions = particleSystem.geometry.attributes.position.array;
    for (let i = 0; i < particleCount; i++) {
        const i3 = i * 3;
        positions[i3 + 1] -= velocities[i];
        if (positions[i3 + 1] < -40) {
            positions[i3 + 1] = 40;
            positions[i3] = (Math.random() - 0.5) * 80;
            positions[i3 + 2] = (Math.random() - 0.5) * 50;
        }
    }
    particleSystem.geometry.attributes.position.needsUpdate = true;
    particleSystem.rotation.y += 0.0001;
    // Update shapes
    shapes.forEach((shape) => {
        shape.mesh.rotation.x += shape.rotationSpeed.x;
        shape.mesh.rotation.y += shape.rotationSpeed.y;
        shape.mesh.rotation.z += shape.rotationSpeed.z;
        shape.mesh.position.y += Math.sin(time * shape.floatSpeed + shape.floatOffset) * 0.01;
    });
    // Camera movement
    camera.position.x += (mouse.x * 5 - camera.position.x) * 0.03;
    camera.position.y += (-mouse.y * 3 - camera.position.y) * 0.03;
    camera.lookAt(0, 0, 0);
    renderer.render(scene, camera);
}
animate();
// Event Handlers
function handleResize() {
    const newWidth = container.clientWidth;
    const newHeight = container.clientHeight;
    camera.aspect = newWidth / newHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(newWidth, newHeight);
}
function handleMouseMove(e) {
    const rect = container.getBoundingClientRect();
    targetMouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    targetMouse.y = ((e.clientY - rect.top) / rect.height) * 2 - 1;
}
function handleTouchMove(e) {
    if (e.touches.length > 0) {
        const rect = container.getBoundingClientRect();
        targetMouse.x = ((e.touches[0].clientX - rect.left) / rect.width) * 2 - 1;
        targetMouse.y = ((e.touches[0].clientY - rect.top) / rect.height) * 2 - 1;
    }
}
window.addEventListener('resize', handleResize);
container.addEventListener('mousemove', handleMouseMove);
container.addEventListener('touchmove', handleTouchMove, { passive: true });