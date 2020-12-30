import * as dat from 'dat.gui';
import * as THREE from 'three';
import Arrow from './arrow';
import BaseWall from './baseWall';
import Bottle from './bottle';
import Cameras from './cameras';
import Ground from './ground';
import Rondelle from './rondelle';
import WindowWall from './windowWall';

const gui = new dat.GUI(); // replace by TweakPane ?

const renderer = new THREE.WebGLRenderer();
const canvas = renderer.domElement;
renderer.setSize(window.innerWidth, window.innerHeight, false);
document.body.appendChild(renderer.domElement);

const textureLoader = new THREE.TextureLoader();
const scene = new THREE.Scene();
const cameras = new Cameras(canvas);

const nbThrows = 33;
let currentThrow = 0;

const options = {
  slowMotion: false,
};

// gui.add(options, 'slowMotion');

const throwsInfo = document.querySelector('#remainingThrows');
throwsInfo.innerHTML = (nbThrows - currentThrow).toString();

const mouse = new THREE.Vector2();

document.addEventListener('mousemove', event => {
  event.preventDefault();
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
});

let mouseDown = false;
let mouseUp = false;

document.onmousedown = function() {
  mouseDown = true;
};

document.onmouseup = function() {
  mouseDown = false;
  mouseUp = true;
};

// Lights
{
  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(0, 300, 0);
  light.target.position.set(0, 100, 250);
  scene.add(light);
  scene.add(light.target);

  const helper = new THREE.DirectionalLightHelper(light);
  //scene.add(helper);

  function updateLight() {
    light.target.updateMatrixWorld();
    helper.update();
  }
  updateLight();
}

const ground = new Ground(textureLoader);
ground.addToScene(scene);

const windowWall = new WindowWall();
windowWall.addToScene(scene);

const baseWall = new BaseWall(windowWall);
baseWall.addToScene(scene);

const leftBottle = new Bottle(new THREE.Vector3(-12, baseWall.height, baseWall.distanceFromPlayer + 15));
leftBottle.addToScene(scene);

const centerBottle = new Bottle(new THREE.Vector3(0, baseWall.height, baseWall.distanceFromPlayer + 8));
centerBottle.addToScene(scene);

const rightBottle = new Bottle(new THREE.Vector3(12, baseWall.height, baseWall.distanceFromPlayer + 15));
rightBottle.addToScene(scene);

const arrow = new Arrow(new THREE.Vector3(0, 120, 0));
arrow.addToScene(scene);

const rondelles = Array(nbThrows)
  .fill(null)
  .map((_, i) => {
    const rondelle = new Rondelle(`Rondelle ${i}`);
    rondelle.addToScene(scene);
    // i === 0 && rondelle.addGUI(gui);

    return rondelle;
  });

function shouldResizeRenderer(canvas: HTMLCanvasElement) {
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  const needResize = canvas.width !== width || canvas.height !== height;

  return needResize;
}

function animate(time: number) {
  if (shouldResizeRenderer(canvas)) {
    renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
    cameras.updateAspect(canvas);
  }

  arrow.update(cameras.getCurrentCamera());
  rondelles.forEach(rondelle => {
    rondelle.update(time, options.slowMotion);

    if (rondelle.state !== 'IDLE') {
      let collided = false;

      !collided && (collided = rondelle.testGroundCollision(time, ground));
      !collided && (collided = rondelle.testWindowWallCollision(time, windowWall));
      !collided && (collided = rondelle.testBaseWallCollision(time, baseWall));
      !collided && (collided = rondelle.testBottleCollision(time, centerBottle));
      !collided && (collided = rondelle.testBottleCollision(time, leftBottle));
      !collided && (collided = rondelle.testBottleCollision(time, rightBottle));

      // !collided && rondelle.testBottleIn(time, centerBottle);
    }
  });

  cameras.playerCamera.lookAt(0 - 20 * mouse.x, 100 + 20 * mouse.y, 250);

  if (mouseDown && currentThrow < nbThrows) {
    arrow.powerUp();
  }

  if (mouseUp && currentThrow < nbThrows) {
    mouseUp = false;

    rondelles[currentThrow].startThrow(
      time,
      new THREE.Vector3(0, 120, 0),
      -arrow.getVerticalAngle() + Math.PI / 2,
      arrow.getHorizontalAngle(),
      60 + arrow.getPower() * 20,
    );

    currentThrow += 1;
    throwsInfo.innerHTML = (nbThrows - currentThrow).toString();

    arrow.reset();
  }

  renderer.render(scene, cameras.getCurrentCamera());
  requestAnimationFrame(animate);
}

requestAnimationFrame(animate);
