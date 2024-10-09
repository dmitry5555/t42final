import * as THREE from 'three';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';

let screen: THREE.Scene, camera: THREE.PerspectiveCamera, renderer: THREE.WebGLRenderer;
let starG: THREE.BufferGeometry, star: THREE.Points;
const velocities: number[] = [];
const accelerations: number[] = [];
const mouse: THREE.Vector2 = new THREE.Vector2();
let zinHtml = 3;
const raycaster = new THREE.Raycaster();
const targetFPS = 80; // Set target frame rate
const frameDuration = 1000 / targetFPS; // Calculate time per frame (milliseconds)
let lastFrameTime = performance.now();
let w_text = 0;

export function init(canvas: HTMLElement) {
    screen = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.z = 1;
    camera.rotation.x = Math.PI / 2;

    renderer = new THREE.WebGLRenderer({ antialias: true, canvas });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    starG = new THREE.BufferGeometry();
    const vertices: number[] = [];
    for (let i = 0; i < 2000; i++) {
        vertices.push(Math.random() * 600 - 300, Math.random() * 600 - 300, Math.random() * 600 - 300);
        velocities.push(0);
        accelerations.push(Math.random());
    }
    starG.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));

    const starTexture = new THREE.TextureLoader().load('./Rock045.png');
    const starMaterial = new THREE.PointsMaterial({
        size: 2.5,
        map: starTexture,
        alphaTest: 0.5
    });

    star = new THREE.Points(starG, starMaterial);
    screen.add(star);

    window.addEventListener('mousemove', (event) => {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(screen.children, true);
        canvas.style.cursor = intersects.length > 0 && intersects[0].object instanceof THREE.Mesh ? 'pointer' : 'default';
    });
    animate();
}

export function animate() {
    const positions = starG.attributes.position.array as Float32Array;
    const currentTime = performance.now();
    const elapsedTime = currentTime - lastFrameTime;

    if (elapsedTime >= frameDuration) {
        for (let i = 0; i < positions.length; i += 3) {
            velocities[i / 3] += accelerations[i / 3];
            positions[i + 1] = velocities[i / 3]; // Move y
            if (positions[i + 1] <= -200) {
                positions[i + 1] = 200;
                velocities[i / 3] = 0;
            }
        }
        lastFrameTime = currentTime - (elapsedTime % frameDuration);
        starG.attributes.position.needsUpdate = true;
        renderer.render(screen, camera);
    }
    requestAnimationFrame(animate);
}



export function init3DText(text: string, url: string) {

    const fontLoader = new FontLoader();
    fontLoader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', (font) => {
        const textGeometry = new TextGeometry(text, {
            font: font,
            size: 0.3,
            depth: 0.1,
            curveSegments: 5,
            bevelEnabled: true,
            bevelThickness: 0,
            bevelSize: 0,
            bevelOffset: 0,
            bevelSegments: 0.5,
        });

        textGeometry.computeBoundingBox();
        const outlineGeometry = new TextGeometry(text, {
            font: font,
            size: 0.3,
            depth: 0.1,
            curveSegments: 5,
            bevelEnabled: true,
            bevelThickness: 0,
            bevelSize: 0,
            bevelOffset: 0,
            bevelSegments: 0.5,
        });

        const outlineMaterial = new THREE.MeshBasicMaterial({ color: 0x7C4A3A });
        const outlineMesh = new THREE.Mesh(outlineGeometry, outlineMaterial);
        const textWidth = textGeometry.boundingBox!.getSize(new THREE.Vector3()).x;
        const textHeight = textGeometry.boundingBox!.getSize(new THREE.Vector3()).y;
        if (textHeight >= w_text)
            w_text = textHeight;
        outlineMesh.rotation.x = Math.PI / 2.05;
        outlineMesh.position.set(-textWidth / 2 + 0.003, 5, zinHtml);
        outlineMesh.scale.set(1.01, 1.01, 1.01); // Scale up for outline
        screen.add(outlineMesh);
        outlineMesh.userData = { url };

        const textMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const textMesh = new THREE.Mesh(textGeometry, textMaterial);
        textMesh.position.set(-textWidth / 2 , 5, zinHtml);
        textMesh.rotation.x = Math.PI / 2.05;
        screen.add(textMesh);

        textMesh.userData = { url };
        window.addEventListener('click', (event) => {
            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
            raycaster.setFromCamera(mouse, camera);
            const intersects = raycaster.intersectObjects(screen.children, true);
            if (intersects.length > 0 && (intersects[0].object === textMesh || intersects[0].object === outlineMesh)) {
                const clickedObject = intersects[0].object;
                if (clickedObject.userData.url) {
                    window.location.href = clickedObject.userData.url;
                }
            }
        });
        zinHtml -= (w_text + 0.1);
    });
}
