import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';

export default function renderMaze(mazeMatrix) {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true; // Enable shadow mapping
    document.body.appendChild(renderer.domElement);

    // Floor
    const floorGeometry = new THREE.PlaneGeometry(100, 100);
    const floorMaterial = new THREE.MeshPhongMaterial({ color: 0xffffff });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2; // Rotate the floor 90 degrees
    floor.receiveShadow = true; // Floor can receive shadows
    scene.add(floor);

    // Lighting
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(10, 10, 10);
    light.castShadow = true; // Enable casting shadows
    scene.add(light);

    // Helper function to create walls
    const buildWall = (x, z) => {
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const material = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
        const wall = new THREE.Mesh(geometry, material);
        wall.position.set(x, 0.5, z);
        wall.castShadow = true; // The wall can cast shadows
        scene.add(wall);
    };

    // Loop through the matrix and build walls
    for (let i = 0; i < mazeMatrix.length; i++) {
        for (let j = 0; j < mazeMatrix[i].length; j++) {
            if (mazeMatrix[i][j] === 1) {
                buildWall(i, j);
            }
        }
    }

    // Camera controls for walking through the maze
    const controls = new PointerLockControls(camera, renderer.domElement);
    document.addEventListener('click', () => controls.lock(), false);
    // Set the camera position
    camera.position.set(0, 0.5, 5);

    // Movement controls
    const velocity = new THREE.Vector3();
    const direction = new THREE.Vector3();
    let moveForward = false;
    let moveBackward = false;
    let moveLeft = false;
    let moveRight = false;

    const onKeyDown = function (event) {
        switch (event.code) {
            case 'ArrowUp':
            case 'KeyW':
                moveForward = true;
                break;
            case 'ArrowLeft':
            case 'KeyA':
                moveLeft = true;
                break;
            case 'ArrowDown':
            case 'KeyS':
                moveBackward = true;
                break;
            case 'ArrowRight':
            case 'KeyD':
                moveRight = true;
                break;
        }
    };

    const onKeyUp = function (event) {
        switch (event.code) {
            case 'ArrowUp':
            case 'KeyW':
                moveForward = false;
                break;
            case 'ArrowLeft':
            case 'KeyA':
                moveLeft = false;
                break;
            case 'ArrowDown':
            case 'KeyS':
                moveBackward = false;
                break;
            case 'ArrowRight':
            case 'KeyD':
                moveRight = false;
                break;
        }
    };

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);

    // Animation loop
    const animate = () => {
      const delta = clock.getDelta(); // Define delta at the start of animate function

      if (controls.isLocked === true) {
          velocity.x -= velocity.x * 10.0 * delta;
          velocity.z -= velocity.z * 10.0 * delta;

          direction.z = Number(moveForward) - Number(moveBackward);
          direction.x = Number(moveRight) - Number(moveLeft);
          direction.normalize(); // this ensures consistent movements in all directions

          if (moveForward || moveBackward) velocity.z -= direction.z * 400.0 * delta;
          if (moveLeft || moveRight) velocity.x -= direction.x * 400.0 * delta;

          controls.moveRight(-velocity.x * delta);
          controls.moveForward(-velocity.z * delta);
      }

      renderer.render(scene, camera);

      requestAnimationFrame(animate);
    };

    const clock = new THREE.Clock(); // Create a clock outside of animate function

    animate();

}