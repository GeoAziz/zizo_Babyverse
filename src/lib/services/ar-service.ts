import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

class ARService {
  private loader: GLTFLoader;
  private modelCache: Map<string, any>;
  private scene: THREE.Scene | null;
  private camera: THREE.PerspectiveCamera | null;
  private renderer: THREE.WebGLRenderer | null;

  private controls: any; // AR Controls
  private previewMode: boolean;

  constructor() {
    this.loader = new GLTFLoader();
    this.modelCache = new Map();
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.previewMode = false;
  }

  async loadModel(url: string) {
    if (this.modelCache.has(url)) {
      return this.modelCache.get(url);
    }

    try {
      const gltf = await this.loader.loadAsync(url);
      this.modelCache.set(url, gltf);
      return gltf;
    } catch (error) {
      console.error('Error loading 3D model:', error);
      throw new Error('Failed to load 3D model');
    }
  }

  async startARSession(modelUrl: string) {
    if (!navigator.xr) {
      throw new Error('WebXR not supported');
    }

    try {
      const session = await (navigator as any).xr.requestSession('immersive-ar', {
        requiredFeatures: ['hit-test'],
      });

      const model = await this.loadModel(modelUrl);
      return { session, model };
    } catch (error) {
      console.error('Error starting AR session:', error);
      throw new Error('Failed to start AR session');
    }
  }

  async checkARSupport() {
    if (!navigator.xr) {
      return false;
    }

    try {
      return await (navigator as any).xr.isSessionSupported('immersive-ar');
    } catch {
      return false;
    }
  }

  setupScene() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);

    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);

    // Add directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    this.scene.add(directionalLight);

    return this.renderer.domElement;
  }

  async placeModel(model: THREE.Object3D, position: THREE.Vector3, rotation: THREE.Euler) {
    if (!this.scene) throw new Error('Scene not initialized');

    model.position.copy(position);
    model.rotation.copy(rotation);
    this.scene.add(model);
  }

  updateModelScale(model: THREE.Object3D, scale: number) {
    model.scale.setScalar(scale);
  }

  resize() {
    if (!this.camera || !this.renderer) return;

    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  cleanup() {
    if (this.renderer) {
      this.renderer.dispose();
    }
    if (this.scene) {
      this.scene.clear();
    }
    this.modelCache.clear();
    this.scene = null;
    this.camera = null;
    this.renderer = null;
  }

  startPreviewMode(container: HTMLElement) {
    this.previewMode = true;
    const canvas = this.setupScene();
    container.appendChild(canvas);

    if (this.camera && this.renderer) {
      this.camera.position.z = 5;
      this.controls = new OrbitControls(this.camera, this.renderer.domElement);
      this.controls.enableDamping = true;
      this.controls.dampingFactor = 0.05;
      this.controls.screenSpacePanning = false;
      this.controls.minDistance = 3;
      this.controls.maxDistance = 10;
    }

    window.addEventListener('resize', () => this.resize());
  }

  private animate = () => {
    if (!this.previewMode || !this.scene || !this.camera || !this.renderer) return;

    requestAnimationFrame(this.animate);

    if (this.controls) {
      this.controls.update();
    }

    this.renderer.render(this.scene, this.camera);
  }

  stopPreviewMode() {
    this.previewMode = false;
    this.cleanup();
  }

  // Utility methods for model manipulation
  rotateModel(model: THREE.Object3D, axis: 'x' | 'y' | 'z', angle: number) {
    switch (axis) {
      case 'x':
        model.rotation.x += angle;
        break;
      case 'y':
        model.rotation.y += angle;
        break;
      case 'z':
        model.rotation.z += angle;
        break;
    }
  }

  moveModel(model: THREE.Object3D, axis: 'x' | 'y' | 'z', distance: number) {
    switch (axis) {
      case 'x':
        model.position.x += distance;
        break;
      case 'y':
        model.position.y += distance;
        break;
      case 'z':
        model.position.z += distance;
        break;
    }
  }

  resetModel(model: THREE.Object3D) {
    model.position.set(0, 0, 0);
    model.rotation.set(0, 0, 0);
    model.scale.set(1, 1, 1);
  }

  takeScreenshot(): Promise<string> {
    return new Promise((resolve) => {
      if (!this.renderer) {
        throw new Error('Renderer not initialized');
      }

      // Render the current frame
      this.renderer.render(this.scene!, this.camera!);
      
      // Convert the canvas to a data URL
      const dataUrl = this.renderer.domElement.toDataURL('image/png');
      resolve(dataUrl);
    });
  }
}

export const arService = new ARService();