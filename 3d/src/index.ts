import * as THREE from 'three';
import { GUI } from 'dat.gui';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import Ammo from 'ammojs-typed';

import AxisGridHelper from './AxisGridHelper';

const gui = new GUI();

Ammo(Ammo).then(() => {
  const renderer = new THREE.WebGLRenderer();
  const canvas = renderer.domElement;
  renderer.setSize(window.innerWidth, window.innerHeight, false);
  document.body.appendChild(renderer.domElement);

  const loader = new THREE.TextureLoader();

  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(45, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
  camera.position.set(50, 50, 100);
  camera.zoom = 40;

  const controls = new OrbitControls(camera, canvas);
  controls.target.set(0, 0, 0);
  //controls.maxPolarAngle = Math.PI / 2.1;
  controls.update();

  const clock = new THREE.Clock();

  const SCALE = 100;

  const planeSize = 5;
  const checkSize = 0.5;

  const texture = loader.load('./checker.png');
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.magFilter = THREE.NearestFilter;
  const repeats = planeSize / (checkSize * 2);
  texture.repeat.set(repeats, repeats);

  // Physics

  const gravityConstant = -9.8 * SCALE;
  const rigidBodies = [];
  const margin = 0.1;
  const transformAux1 = new Ammo.btTransform();

  const collisionConfiguration = new Ammo.btSoftBodyRigidBodyCollisionConfiguration();
  const dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration);
  const broadphase = new Ammo.btDbvtBroadphase();
  const solver = new Ammo.btSequentialImpulseConstraintSolver();
  const softBodySolver = new Ammo.btDefaultSoftBodySolver();

  const physicsWorld = new Ammo.btSoftRigidDynamicsWorld(dispatcher, broadphase, solver, collisionConfiguration, softBodySolver);
  physicsWorld.setGravity(new Ammo.btVector3(0, gravityConstant, 0));
  physicsWorld.getWorldInfo().set_m_gravity(new Ammo.btVector3(0, gravityConstant, 0));

  // Ground
  {
    const planeGeo = new THREE.BoxGeometry(planeSize * SCALE, 100, planeSize * SCALE);
    const planeMat = new THREE.MeshBasicMaterial({
      map: texture,
    });
    const mesh = new THREE.Mesh(planeGeo, planeMat);

    mesh.position.y = -100 / 2;
    scene.add(mesh);

    // Physics
    const mass = 0;
    const ammoShape = new Ammo.btBoxShape(new Ammo.btVector3(planeSize * SCALE / 2, 100 / 2, planeSize * SCALE / 2));
    //ammoShape.setMargin(margin);

    const transform = new Ammo.btTransform();
    transform.setIdentity();
    transform.setOrigin(new Ammo.btVector3(mesh.position.x, mesh.position.y, mesh.position.z));
    transform.setRotation(new Ammo.btQuaternion(mesh.quaternion.x, mesh.quaternion.y, mesh.quaternion.z, mesh.quaternion.w));
    const motionState = new Ammo.btDefaultMotionState(transform);

    const localInertia = new Ammo.btVector3(0, 0, 0);
    ammoShape.calculateLocalInertia(mass, localInertia);

    const rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, motionState, ammoShape, localInertia);
    const body = new Ammo.btRigidBody(rbInfo);

    mesh.userData.physicsBody = body;
    rigidBodies.push(mesh);

    physicsWorld.addRigidBody(body);
  }

  // Bottle
  {
    const bottleBaseRadius = 0.026;
    const bottleHeight = 0.182;
    const points = [
      new THREE.Vector2(0, 0),
      new THREE.Vector2(0.023, 0),
      new THREE.Vector2(0.026, 0.003),
      new THREE.Vector2(0.026, 0.08),
      new THREE.Vector2(0.02, 0.12),
      new THREE.Vector2(0.012, 0.142),
      new THREE.Vector2(0.012, 0.179),
      new THREE.Vector2(0.014, 0.179),
      new THREE.Vector2(0.014, 0.182),
      new THREE.Vector2(0.009, 0.182),
    ];

    const geometry = new THREE.LatheBufferGeometry(points);
    geometry.translate(0, -bottleHeight / 2, 0);
    geometry.scale(SCALE, SCALE, SCALE);

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

    const bottle = new THREE.Object3D();
    const bottleInnerSide = new THREE.Mesh(geometry, bottleInnerMat);
    const bottleOuterSide = new THREE.Mesh(geometry, bottleOuterMat);
    // bottleInnerSide.position.set(0, -bottleHeight / 2, 0);
    // bottleOuterSide.position.set(0, -bottleHeight / 2, 0);

    bottle.add(bottleInnerSide);
    bottle.add(bottleOuterSide);
    scene.add(bottle);

    bottle.position.set(0,  bottleHeight * SCALE / 2, 0);

    // Physics
    const mass = 10000;
    const ammoShape = new Ammo.btCylinderShape(new Ammo.btVector3(bottleBaseRadius * SCALE, bottleHeight * SCALE / 2, bottleBaseRadius * SCALE));
    //ammoShape.setMargin(margin);

    const transform = new Ammo.btTransform();
    transform.setIdentity();
    transform.setOrigin(new Ammo.btVector3(bottle.position.x, bottle.position.y, bottle.position.z));
    transform.setRotation(new Ammo.btQuaternion(bottle.quaternion.x, bottle.quaternion.y, bottle.quaternion.z, bottle.quaternion.w));
    const motionState = new Ammo.btDefaultMotionState(transform);

    const localInertia = new Ammo.btVector3(0, 0, 0);
    ammoShape.calculateLocalInertia(mass, localInertia);

    const rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, motionState, ammoShape, localInertia);
    const body = new Ammo.btRigidBody(rbInfo);

    bottle.userData.physicsBody = body;

    rigidBodies.push(bottle);

    // Disable deactivation
    //body.setActivationState(4);

    physicsWorld.addRigidBody(body);
  }

  // Rondelle
  {
    const shape = new THREE.Shape();
    shape.absellipse(0, 0, 5, 5, 0, 2*Math.PI, false, 0);

    const hole = new THREE.Path();
    hole.absellipse(0, 0, 4.2, 4.2, 0, 2*Math.PI, false, 0);
    shape.holes = [hole];

    const geometry = new THREE.ExtrudeGeometry(shape, { depth: 0.3, bevelEnabled: false });
    //geometry.translate(0, 0, 0.15);
    const material = new THREE.MeshBasicMaterial({ color: '#DA6345' });
    const rondelle = new THREE.Mesh(geometry, material);

    const shape2 = new THREE.Shape();
    shape2.absellipse(0, 5, 0.8, 0.8, 0, 2*Math.PI, false, 0);

    const geometry2 = new THREE.ExtrudeGeometry(shape2, { depth: 0.3, bevelEnabled: false });
    //geometry2.translate(0, 0, 0.15);
    const languette = new THREE.Mesh(geometry2, material);
    rondelle.add(languette);

    rondelle.rotation.set(-Math.PI / 6, -Math.PI / 6, -Math.PI / 6);
    rondelle.position.set(1, 50, 0);
    scene.add(rondelle);

    // Physics
    const mass = 100;
    const ammoShape = new Ammo.btCylinderShapeZ(new Ammo.btVector3(5, 5, 0.3));
    //ammoShape.setMargin(10);

    const transform = new Ammo.btTransform();
    transform.setIdentity();
    transform.setOrigin(new Ammo.btVector3(rondelle.position.x, rondelle.position.y, rondelle.position.z));
    transform.setRotation(new Ammo.btQuaternion(rondelle.quaternion.x, rondelle.quaternion.y, rondelle.quaternion.z, rondelle.quaternion.w));
    const motionState = new Ammo.btDefaultMotionState(transform);

    const localInertia = new Ammo.btVector3(0, 0, 0);
    ammoShape.calculateLocalInertia(mass, localInertia);

    const rbInfo = new Ammo.btRigidBodyConstructionInfo(mass, motionState, ammoShape, localInertia);
    const body = new Ammo.btRigidBody(rbInfo);

    rondelle.userData.physicsBody = body;

    rigidBodies.push(rondelle);

    // Disable deactivation
    body.setActivationState(4);

    physicsWorld.addRigidBody(body);
  }

  function shouldResizeRenderer(canvas) {
    const width  = canvas.clientWidth;
    const height = canvas.clientHeight;
    const needResize = canvas.width !== width || canvas.height !== height;

    return needResize;
  }

  function animate(time: number) {
    time *= 0.001;

    if (shouldResizeRenderer(canvas)) {
      renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
    }

    const deltaTime = clock.getDelta();

    // Step world
    physicsWorld.stepSimulation(deltaTime / 4);

    // Update rigid bodies
    for (let i = 0, il = rigidBodies.length; i < il; i++) {
      const objThree = rigidBodies[i];
      const objPhys = objThree.userData.physicsBody;
      const ms = objPhys.getMotionState();

      if (ms) {
        ms.getWorldTransform(transformAux1);
        const p = transformAux1.getOrigin();
        const q = transformAux1.getRotation();

        objThree.position.set(p.x(), p.y(), p.z());
        objThree.quaternion.set(q.x(), q.y(), q.z(), q.w());
      }
    }

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);

});
