import * as THREE from 'three';

const shape = new THREE.Shape();
shape.lineTo(-1, 0);
shape.lineTo(-1, 50);
shape.lineTo(-5, 50);
shape.lineTo(0, 60);
shape.lineTo(5, 50);
shape.lineTo(1, 50);
shape.lineTo(1, 0);
shape.closePath();

const geometry = new THREE.ShapeGeometry(shape);
geometry.rotateY(Math.PI);

const mouse = new THREE.Vector2();

document.addEventListener('mousemove', event => {
  event.preventDefault();
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
});

class Arrow {
  // angle vertical
  verticalAngle: number;

  // angle horizontal
  horizontalAngle: number;

  // force du lancer
  power: number;

  material: THREE.MeshBasicMaterial;
  mesh: THREE.Mesh;

  // Arrow avec angle horizontal
  horizontalAngleObject: THREE.Object3D;

  constructor(initialPosition: THREE.Vector3) {
    this.verticalAngle = 0;
    this.horizontalAngle = 0;
    this.power = 0;

    this.material = new THREE.MeshBasicMaterial({ color: '#ffffff' });
    this.mesh = new THREE.Mesh(geometry, this.material);
    this.mesh.rotation.x = Math.PI / 2;
    this.mesh.position.copy(initialPosition);

    this.horizontalAngleObject = new THREE.Object3D();
    this.horizontalAngleObject.add(this.mesh);
  }

  addToScene(scene: THREE.Scene) {
    scene.add(this.horizontalAngleObject);
  }

  getHorizontalAngle() {
    return this.horizontalAngle;
  }

  getVerticalAngle() {
    return this.verticalAngle;
  }

  getPower() {
    return this.power;
  }

  update(currentCamera: THREE.Camera) {
    this.mesh.visible = currentCamera.name === 'Player camera';

    this.horizontalAngle = THREE.MathUtils.degToRad(-45 * mouse.x);
    this.verticalAngle = ((mouse.y + 1) * -Math.PI) / 8 + Math.PI / 2;

    this.horizontalAngleObject.rotation.y = this.horizontalAngle;
    this.mesh.rotation.x = this.verticalAngle;
  }

  powerUp() {
    this.power += 0.02;

    this.horizontalAngleObject.scale.z = this.power + 1;

    // Dégradé vert -> jaune -> rouge
    this.material.color.setRGB(this.power <= 0.5 ? this.power * 2 : 1, this.power > 0.5 ? 2 - this.power * 2 : 1, 0);

    if (this.power > 1) {
      this.power = 0;
    }
  }

  reset() {
    this.horizontalAngleObject.scale.z = 1;
    this.material.color.setRGB(1, 1, 1);
    this.power = 0;
  }
}

export default Arrow;
