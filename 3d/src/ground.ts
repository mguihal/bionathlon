import * as THREE from 'three';

class Ground {
  material: THREE.MeshBasicMaterial;
  mesh: THREE.Mesh;

  widthX = 500; // cm
  widthZ = 600; // cm

  body: THREE.Plane;

  constructor(textureLoader: THREE.TextureLoader) {
    this.body = new THREE.Plane(new THREE.Vector3(0, -1, 0), 0);

    const geometry = new THREE.PlaneGeometry(this.widthX, this.widthZ);
    geometry.rotateX(-Math.PI / 2);

    const texture = textureLoader.load('./checker.png');
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.magFilter = THREE.NearestFilter;
    texture.repeat.set(5, 5);

    this.material = new THREE.MeshBasicMaterial({
      map: texture,
    });
    this.mesh = new THREE.Mesh(geometry, this.material);
  }

  addToScene(scene: THREE.Scene) {
    scene.add(this.mesh);
  }

  getCollisionBody() {
    return this.body;
  }
}

export default Ground;
