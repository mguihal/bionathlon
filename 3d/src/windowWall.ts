import * as THREE from 'three';

class WindowWall {
  material: THREE.MeshBasicMaterial;
  mesh: THREE.Mesh;

  width = 500; // cm
  height = 300; // cm
  distanceFromPlayer = 300; // cm

  restitution = 0.3;

  body: THREE.Plane;

  constructor() {
    this.body = new THREE.Plane(new THREE.Vector3(0, 0, -1), this.distanceFromPlayer);

    const geometry = new THREE.PlaneGeometry(this.width, this.height);
    geometry.rotateX(-Math.PI);

    const barGeometry = new THREE.PlaneGeometry(5, this.height);
    barGeometry.rotateX(-Math.PI);
    barGeometry.translate(0, 0, -1);

    this.material = new THREE.MeshBasicMaterial({ color: '#87CEFA' });
    this.mesh = new THREE.Mesh(geometry, this.material);

    const barMaterial = new THREE.MeshBasicMaterial({ color: '#aaa' });

    {
      const barMesh = new THREE.Mesh(barGeometry, barMaterial);
      barMesh.position.x = -225;
      this.mesh.add(barMesh);
    }

    {
      const barMesh = new THREE.Mesh(barGeometry, barMaterial);
      barMesh.position.x = -75;
      this.mesh.add(barMesh);
    }

    {
      const barMesh = new THREE.Mesh(barGeometry, barMaterial);
      barMesh.position.x = 75;
      this.mesh.add(barMesh);
    }

    {
      const barMesh = new THREE.Mesh(barGeometry, barMaterial);
      barMesh.position.x = 225;
      this.mesh.add(barMesh);
    }

    this.mesh.position.z = this.distanceFromPlayer;
    this.mesh.position.y = this.height / 2;
  }

  addToScene(scene: THREE.Scene) {
    scene.add(this.mesh);
  }

  getCollisionBody() {
    return this.body;
  }
}

export default WindowWall;
