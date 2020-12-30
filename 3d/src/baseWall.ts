import * as THREE from 'three';
import WindowWall from './windowWall';

class BaseWall {
  material: THREE.MeshBasicMaterial;
  mesh: THREE.Mesh;

  height = 126; // cm
  depth = 30; // cm
  distanceFromPlayer: number;

  restitution = 0.3;

  wallBody: THREE.Plane;
  baseBody: THREE.Plane;

  constructor(windowWall: WindowWall) {
    this.distanceFromPlayer = windowWall.distanceFromPlayer - this.depth;

    this.wallBody = new THREE.Plane(new THREE.Vector3(0, 0, -1), this.distanceFromPlayer);
    this.baseBody = new THREE.Plane(new THREE.Vector3(0, -1, 0), this.height);

    const geometry = new THREE.BoxGeometry(windowWall.width, this.height, this.depth);

    this.material = new THREE.MeshPhongMaterial({
      color: '#dddddd',
    });

    this.mesh = new THREE.Mesh(geometry, this.material);
    this.mesh.position.z = windowWall.distanceFromPlayer - this.depth / 2;
    this.mesh.position.y = this.height / 2;
  }

  addToScene(scene: THREE.Scene) {
    scene.add(this.mesh);
  }

  getCollisionWallBody() {
    return this.wallBody;
  }

  getCollisionBaseBody() {
    return this.baseBody;
  }
}

export default BaseWall;
