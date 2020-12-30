import * as THREE from 'three';
import AxisGridHelper from './AxisGridHelper';
import BaseWall from './baseWall';
import Bottle from './bottle';
import Ground from './ground';
import WindowWall from './windowWall';

const G = 9.81;

const shape = new THREE.Shape();
shape.absellipse(0, 0, 5, 5, 0, 2 * Math.PI, false, 0);

const hole = new THREE.Path();
hole.absellipse(0, 0, 4.2, 4.2, 0, 2 * Math.PI, false, 0);
shape.holes = [hole];

const geometry = new THREE.ExtrudeGeometry(shape, {
  depth: 0.3,
  bevelEnabled: false,
});
geometry.rotateX(-Math.PI / 2);

const languetteShape = new THREE.Shape();
languetteShape.absellipse(0, 5, 0.8, 0.8, 0, 2 * Math.PI, false, 0);

const languetteGeometry = new THREE.ExtrudeGeometry(languetteShape, {
  depth: 0.3,
  bevelEnabled: false,
});
languetteGeometry.rotateX(-Math.PI / 2);

type RondelleState = 'IDLE' | 'THROWING';

const collisionPointGeometry = new THREE.SphereGeometry(1);

type CollisionPoint = {
  currentPosition: THREE.Vector3;
  previousPosition: THREE.Vector3;
  trajectory: THREE.Line3;
  point: THREE.Object3D;
  container: THREE.Object3D;
};

class Rondelle {
  name: string;

  radius = 5; // cm
  innerRadius = 4.2; // cm

  // Position initiale
  initialPosition: THREE.Vector3 = new THREE.Vector3(0, 0, 0);

  // angle vertical
  verticalAngle: number = 0;

  // angle horizontal
  horizontalAngle: number = 0;

  // force du lancer
  power: number = 0;

  material: THREE.MeshBasicMaterial;

  // Rondelle
  mesh: THREE.Mesh;

  // Lancer de la rondelle
  throwObject: THREE.Object3D;

  // Lancer de la rondelle orienté depuis son point de départ
  throwHorizontalAngleObject: THREE.Object3D;

  throwContainer: THREE.Object3D;

  // Début du lancer (en elapsed time)
  throwStartTime: number;

  // Vitesse de rotation
  rotationSpeed: number = 0;

  // Status
  state: RondelleState = 'IDLE';

  previousTime: number = 0;

  wallPoint: CollisionPoint;
  bottlePoint: CollisionPoint;
  bottlePoint2: CollisionPoint;
  centerPoint: CollisionPoint;
  behindPoint: CollisionPoint;

  helpers: any[] = [];

  constructor(name: string) {
    this.name = name;
    this.material = new THREE.MeshBasicMaterial({ color: '#DA6345' });

    this.mesh = new THREE.Mesh(geometry, this.material);
    this.mesh.geometry.computeBoundingBox();
    this.mesh.name = 'rondelle';

    const languette = new THREE.Mesh(languetteGeometry, this.material);
    this.mesh.add(languette);

    this.throwObject = new THREE.Object3D();
    this.throwObject.add(this.mesh);
    this.throwObject.name = 'throwObject';

    const mesh2 = new THREE.Mesh(
      new THREE.SphereGeometry(this.radius, 20, 20),
      new THREE.MeshBasicMaterial({
        color: '#FFFF00',
        transparent: true,
        opacity: 0.5,
      }),
    );

    // this.throwObject.add(mesh2);

    this.throwHorizontalAngleObject = new THREE.Object3D();
    this.throwHorizontalAngleObject.add(this.throwObject);
    this.throwHorizontalAngleObject.name = 'throwHorizontalAngleObject';

    this.throwContainer = new THREE.Object3D();
    this.throwContainer.add(this.throwHorizontalAngleObject);
    this.throwContainer.name = 'throwContainer';
    this.throwContainer.visible = false;

    this.throwStartTime = 0;

    // Collision points
    this.wallPoint = this.initCollisionPoint('wallPoint', '#00FF00');
    this.wallPoint.point.position.z = this.radius;

    this.bottlePoint = this.initCollisionPoint('bottlePoint', '#00FF00');
    this.bottlePoint.point.position.z = this.radius;

    this.bottlePoint2 = this.initCollisionPoint('bottlePoint2', '#0000FF');
    this.bottlePoint2.point.position.z = this.radius;

    this.centerPoint = this.initCollisionPoint('centerPoint', '#FF0000');

    this.behindPoint = this.initCollisionPoint('behindPoint', '#00FF00');
    this.behindPoint.point.position.z = -this.innerRadius;

    // Helpers
    this.helpers.push(
      new AxisGridHelper(this.throwContainer, 30),
      new AxisGridHelper(this.throwHorizontalAngleObject, 30),
      new AxisGridHelper(this.throwObject, 30),
      new AxisGridHelper(this.mesh, 30),
    );
  }

  initCollisionPoint(name: string, color: string, visible = false) {
    const collisionPoint: CollisionPoint = {
      currentPosition: new THREE.Vector3(),
      previousPosition: new THREE.Vector3(),
      trajectory: new THREE.Line3(),
      point: new THREE.Mesh(
        collisionPointGeometry,
        new THREE.MeshBasicMaterial({
          color,
        }),
      ),
      container: new THREE.Object3D(),
    };
    collisionPoint.point.name = name;

    collisionPoint.container.add(collisionPoint.point);
    collisionPoint.container.name = name + 'Container';
    collisionPoint.container.visible = visible;
    this.throwObject.add(collisionPoint.container);

    return collisionPoint;
  }

  addToScene(scene: THREE.Scene) {
    scene.add(this.throwContainer);
    this.helpers.forEach(h => scene.add(h));
  }

  update(time: number, slowMotion = false, force = false) {
    if (this.state === 'IDLE' && !force) {
      return;
    }

    // Sauvegarde des précédentes positions
    this.wallPoint.point.getWorldPosition(this.wallPoint.previousPosition);
    this.bottlePoint.point.getWorldPosition(this.bottlePoint.previousPosition);
    this.centerPoint.point.getWorldPosition(this.centerPoint.previousPosition);
    this.behindPoint.point.getWorldPosition(this.behindPoint.previousPosition);

    const t = (time - this.throwStartTime) * (slowMotion ? 0.5 : 5) * 0.001;

    // Lancer sur l'axe Y-Z
    const zt = Math.cos(this.verticalAngle) * this.power * t;
    const yt = -0.5 * G * t * t + Math.sin(this.verticalAngle) * this.power * t;

    // Dérivée de la trajectoire pour avoir l'angle d'incidence de la rondelle
    const dydz =
      (-G * zt) / (this.power * this.power * Math.cos(this.verticalAngle) * Math.cos(this.verticalAngle)) +
      Math.tan(this.verticalAngle);
    const angle = Math.atan(dydz);

    this.throwObject.position.set(0, yt, zt);
    this.throwObject.rotation.x = -angle;

    this.mesh.rotation.y = time * -this.rotationSpeed * 0.001;

    this.throwContainer.updateMatrixWorld();

    // Sauvegarde des nouvelles positions
    this.wallPoint.point.getWorldPosition(this.wallPoint.currentPosition);
    this.wallPoint.trajectory.set(this.wallPoint.previousPosition, this.wallPoint.currentPosition);

    this.bottlePoint.point.getWorldPosition(this.bottlePoint.currentPosition);
    this.bottlePoint.trajectory.set(this.bottlePoint.previousPosition, this.bottlePoint.currentPosition);

    this.centerPoint.point.getWorldPosition(this.centerPoint.currentPosition);
    this.centerPoint.trajectory.set(this.centerPoint.previousPosition, this.centerPoint.currentPosition);

    this.behindPoint.point.getWorldPosition(this.behindPoint.currentPosition);
    this.behindPoint.trajectory.set(this.behindPoint.previousPosition, this.behindPoint.currentPosition);
  }

  addGUI(gui: any) {
    const folder = gui.addFolder(this.name);
    folder.open = true;

    this.helpers.forEach(h => {
      folder.add(h, 'visible').name(h.nodeName);
    });
  }

  startThrow(
    time: number,
    initialPosition: THREE.Vector3,
    verticalAngle: number,
    horizontalAngle: number,
    power: number,
  ) {
    this.throwStartTime = time;
    this.initialPosition = initialPosition;
    this.verticalAngle = verticalAngle;
    this.horizontalAngle = horizontalAngle;
    this.power = power;
    this.rotationSpeed = 10;
    this.state = 'THROWING';

    this.throwContainer.visible = true;
    this.throwContainer.position.copy(initialPosition);
    this.throwHorizontalAngleObject.rotation.y = this.horizontalAngle;
    this.throwObject.position.set(0, 0, 0);
    this.throwObject.rotation.x = 0;

    if (horizontalAngle >= -Math.PI / 2 && horizontalAngle <= Math.PI / 2) {
      this.wallPoint.container.rotation.y = -horizontalAngle;
    } else {
      this.wallPoint.container.rotation.y = -horizontalAngle - Math.PI;
    }
  }

  private interceptPlane(
    plane: THREE.Plane,
    collisionPoint: CollisionPoint,
    condition: (intersection: THREE.Vector3) => boolean,
    callback: (intersection: THREE.Vector3) => void,
  ) {
    const interception = new THREE.Vector3();

    if (plane.intersectLine(collisionPoint.trajectory, interception)) {
      if (condition(interception)) {
        this.computeOffset(collisionPoint.currentPosition, interception);
        callback(interception);

        return true;
      }
    }

    return false;
  }

  private doRebound(time: number, collisionPoint: THREE.Vector3, restitution: number) {
    collisionPoint.z -= this.radius;

    this.startThrow(
      time,
      collisionPoint,
      -this.throwObject.rotation.x,
      Math.PI - this.horizontalAngle,
      this.power * restitution,
    );
  }

  testGroundCollision(time: number, ground: Ground) {
    if (this.wallPoint.currentPosition.y < ground.mesh.position.y) {
      return this.interceptPlane(
        ground.getCollisionBody(),
        this.wallPoint,
        () => true,
        interception => {
          this.state = 'IDLE';

          this.throwContainer.position.copy(interception);
          this.throwObject.position.set(0, 0, 0);
          this.throwObject.rotation.x = 0;
        },
      );
    }

    return false;
  }

  testWindowWallCollision(time: number, windowWall: WindowWall) {
    if (this.wallPoint.currentPosition.z >= windowWall.distanceFromPlayer) {
      return this.interceptPlane(
        windowWall.getCollisionBody(),
        this.wallPoint,
        () => true,
        interception => this.doRebound(time, interception, windowWall.restitution),
      );
    }

    return false;
  }

  testBaseWallCollision(time: number, baseWall: BaseWall) {
    if (this.wallPoint.currentPosition.z >= baseWall.distanceFromPlayer) {
      if (
        this.interceptPlane(
          baseWall.getCollisionWallBody(),
          this.wallPoint,
          interception => interception.y <= baseWall.height,
          interception => this.doRebound(time, interception, baseWall.restitution),
        )
      ) {
        return true;
      }
    }

    if (
      this.wallPoint.currentPosition.z >= baseWall.distanceFromPlayer &&
      this.wallPoint.currentPosition.y <= baseWall.height
    ) {
      return this.interceptPlane(
        baseWall.getCollisionBaseBody(),
        this.wallPoint,
        () => true,
        interception => {
          this.state = 'IDLE';

          // this.throwContainer.visible = false; // Fixme

          this.throwContainer.position.copy(interception);
          this.throwObject.position.set(0, 0, 0);
          this.throwObject.rotation.x = 0;

          const threshold = baseWall.distanceFromPlayer + baseWall.depth - this.radius;

          if (this.throwContainer.position.z >= threshold) {
            this.throwContainer.position.z = threshold;
          }
        },
      );
    }

    return false;
  }

  testBottleCollision(time: number, bottle: Bottle) {
    const previousTime = this.previousTime;
    this.previousTime = time;

    let collisionAngle = 0;

    const intersectSphereCylinder = () => {
      if (
        this.bottlePoint.currentPosition.y >= bottle.position.y &&
        this.bottlePoint.currentPosition.y < bottle.position.y + bottle.height
      ) {
        const center = new THREE.Vector2(this.centerPoint.currentPosition.x, this.centerPoint.currentPosition.z);
        const bottleCenter = new THREE.Vector2(bottle.position.x, bottle.position.z);
        const dist = center.distanceTo(bottleCenter);

        if (dist <= this.radius + bottle.maxRadius) {
          const v1 = new THREE.Vector2(
            this.bottlePoint.currentPosition.x - center.x,
            this.bottlePoint.currentPosition.z - center.y,
          );
          const v2 = new THREE.Vector2(bottleCenter.x - center.x, bottleCenter.y - center.y);

          collisionAngle = Math.acos(v1.dot(v2) / (v1.length() * v2.length()));
          collisionAngle = center.x < bottleCenter.x ? collisionAngle : -collisionAngle;

          this.bottlePoint2.container.rotation.y = collisionAngle;
          this.bottlePoint2.container.updateMatrixWorld();
          this.bottlePoint2.point.getWorldPosition(this.bottlePoint2.currentPosition);

          const bottlePoint2 = new THREE.Vector2(
            this.bottlePoint2.currentPosition.x,
            this.bottlePoint2.currentPosition.z,
          );
          const dist2 = bottlePoint2.distanceTo(bottleCenter);
          const h = this.bottlePoint2.currentPosition.y - bottle.position.y;

          if (dist2 <= bottle.getRadius(h)) {
            return true;
          }
        }
      }

      return false;
    };

    if (intersectSphereCylinder()) {
      console.log('first collision', time);

      this.state = 'IDLE';

      const duration = time - previousTime;
      const step = duration / 100;
      let collided = false;
      let currentTime = previousTime;

      while (!collided && currentTime <= time) {
        this.update(currentTime, false, true);
        collided = intersectSphereCylinder();
        currentTime += step;
      }

      if (collided) {
        console.log('precise collision', currentTime);

        const bottleCenter = new THREE.Vector2(bottle.position.x, bottle.position.z);
        const bottlePoint2 = new THREE.Vector2(
          this.bottlePoint2.currentPosition.x,
          this.bottlePoint2.currentPosition.z,
        );

        const v2 = new THREE.Vector2(bottleCenter.x - bottlePoint2.x, bottleCenter.y - bottlePoint2.y);

        const newHAngle = collisionAngle - v2.angle() - Math.PI / 2;

        // console.log('v2 angle', v2.angle(), THREE.MathUtils.radToDeg(v2.angle()));
        // console.log('collisionAngle', collisionAngle, THREE.MathUtils.radToDeg(collisionAngle));
        // console.log('newHAngle', newHAngle, THREE.MathUtils.radToDeg(newHAngle));

        this.startThrow(
          time,
          this.centerPoint.currentPosition,
          -this.throwObject.rotation.x,
          newHAngle,
          this.power * 0.3,
        );

        return true;
      }
    }

    this.update(previousTime, false, true);
    this.update(time, false, true);

    return false;
  }

  testBottleIn(time: number, bottle: Bottle) {
    if (
      this.centerPoint.currentPosition.y >= bottle.position.y &&
      this.centerPoint.currentPosition.y <= bottle.position.y + bottle.height
    ) {
      const distMax = this.innerRadius - bottle.getRadius(bottle.height);

      const center = new THREE.Vector2(this.centerPoint.currentPosition.x, this.centerPoint.currentPosition.z);
      const bottleCenter = new THREE.Vector2(bottle.position.x, bottle.position.z);
      const dist = center.distanceTo(bottleCenter);

      if (dist <= distMax) {
        const behindPoint = new THREE.Vector2(this.behindPoint.currentPosition.x, this.behindPoint.currentPosition.z);
        let behindPointDist = behindPoint.distanceTo(bottleCenter);
        let previousBehindPointDist = behindPointDist + 1;
        let currentTime = time + 1;

        while (behindPointDist > bottle.getRadius(bottle.height) && behindPointDist < previousBehindPointDist) {
          this.update(currentTime, false, true);
          currentTime += 1;
          behindPoint.x = this.behindPoint.currentPosition.x;
          behindPoint.y = this.behindPoint.currentPosition.z;
          previousBehindPointDist = behindPointDist;
          behindPointDist = behindPoint.distanceTo(bottleCenter);
        }

        if (this.behindPoint.currentPosition.y <= bottle.position.y + bottle.height) {
          this.update(time, false, true);
          this.state = 'IDLE';
        }
      }
    }
  }

  private displayPosition(obj: THREE.Object3D) {
    console.log('Local position', obj.name, obj.position.toArray());

    const currentPosition = new THREE.Vector3();
    obj.getWorldPosition(currentPosition);
    console.log('World position', obj.name, currentPosition.toArray());
  }

  private computeOffset(currentPosition: THREE.Vector3, interception: THREE.Vector3) {
    const offset = currentPosition.clone().sub(interception);

    this.throwContainer.position.x -= offset.x;
    this.throwContainer.position.y -= offset.y;
    this.throwContainer.position.z -= offset.z;
  }
}

export default Rondelle;
