import * as THREE from 'three';

const points = [
  new THREE.Vector2(0, 0),
  new THREE.Vector2(2.3, 0),
  new THREE.Vector2(2.6, 0.3),
  new THREE.Vector2(2.6, 8),
  new THREE.Vector2(2.0, 12),
  new THREE.Vector2(1.2, 14.2),
  new THREE.Vector2(1.2, 17.9),
  new THREE.Vector2(1.4, 17.9),
  new THREE.Vector2(1.4, 18.2),
  new THREE.Vector2(0.9, 18.2),
];

const geometry = new THREE.LatheBufferGeometry(points);
geometry.translate(0, -18.2 / 2, 0);

const geometry2 = new THREE.CylinderGeometry(2.6, 2.6, 18.2, 20);

const bottleInnerMat = new THREE.MeshBasicMaterial({
  color: '#FFFFFF',
  transparent: true,
  opacity: 0.7,
  side: THREE.BackSide,
});
const bottleOuterMat = new THREE.MeshBasicMaterial({
  color: '#FFFFFF',
  transparent: true,
  opacity: 0.7,
  side: THREE.FrontSide,
});

class Bottle {
  object: THREE.Object3D;
  helper: THREE.Object3D;

  height = 18.2; // cm
  maxRadius = 2.6; // cm
  position: THREE.Vector3;

  constructor(position: THREE.Vector3) {
    this.position = position;

    const bottleInnerSide = new THREE.Mesh(geometry, bottleInnerMat);
    const bottleOuterSide = new THREE.Mesh(geometry, bottleOuterMat);
    this.object = new THREE.Object3D();

    this.object.add(bottleInnerSide);
    this.object.add(bottleOuterSide);

    this.object.position.set(position.x, this.height / 2 + position.y, position.z);

    this.helper = new THREE.Mesh(geometry2, bottleOuterMat);
    this.helper.position.set(position.x, this.height / 2 + position.y, position.z);
  }

  addToScene(scene: THREE.Scene) {
    scene.add(this.object);
    //scene.add(this.helper);
  }

  getRadius(height: number) {
    if (height <= 8) return 2.6;
    else if (height > 8 && height <= 12) return 2.3;
    else if (height > 12 && height <= 14.2) return 1.6;
    else if (height <= 18.2) return 1.2;
    else return 0;
  }
}

export default Bottle;
