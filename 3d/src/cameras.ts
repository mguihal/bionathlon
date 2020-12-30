import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

class Cameras {
  playerCamera: THREE.PerspectiveCamera;
  bottlesCamera: THREE.PerspectiveCamera;

  currentCamera = 0;

  infoElement: HTMLDivElement;

  constructor(canvas: HTMLCanvasElement) {
    this.initPlayerCamera(canvas);
    this.initBottlesCamera(canvas);

    this.infoElement = document.querySelector('#cameraName');
    this.updateCameraInfo();

    document.addEventListener('keyup', e => {
      if (e.code === 'Space') {
        this.toggleCamera();
      }
    });
  }

  initPlayerCamera(canvas: HTMLCanvasElement) {
    this.playerCamera = new THREE.PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    this.playerCamera.position.set(0, 170, -20);
    this.playerCamera.lookAt(0, 100, 250);
    this.playerCamera.zoom = 30;
    this.playerCamera.name = 'Player camera';
  }

  initBottlesCamera(canvas: HTMLCanvasElement) {
    this.bottlesCamera = new THREE.PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
    this.bottlesCamera.position.set(0, 220, 200);
    this.bottlesCamera.lookAt(0, 136, 280);
    this.bottlesCamera.zoom = 30;
    this.bottlesCamera.name = 'Bottles camera';

    const controls = new OrbitControls(this.bottlesCamera, canvas);
    controls.target.set(0, 120, 270);
    controls.maxPolarAngle = Math.PI / 2.1;
    controls.update();
  }

  updateAspect(canvas: HTMLCanvasElement) {
    this.playerCamera.aspect = canvas.clientWidth / canvas.clientHeight;
    this.playerCamera.updateProjectionMatrix();

    this.bottlesCamera.aspect = canvas.clientWidth / canvas.clientHeight;
    this.bottlesCamera.updateProjectionMatrix();
  }

  private updateCameraInfo() {
    this.infoElement.innerHTML = this.getCurrentCamera().name;
  }

  toggleCamera() {
    this.currentCamera += 1;
    this.currentCamera %= 2; // nb of cameras
    this.updateCameraInfo();
  }

  getCurrentCamera() {
    switch (this.currentCamera) {
      case 0:
        return this.playerCamera;
      case 1:
        return this.bottlesCamera;
    }
  }
}

export default Cameras;
