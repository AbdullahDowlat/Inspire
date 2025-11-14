// === CAMERA ===
const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 13;

// === SCENE ===
const scene = new THREE.Scene();
let model;

// === LOADERS ===
const loader = new THREE.GLTFLoader();
const cubeTextureLoader = new THREE.CubeTextureLoader(); // ✅ added

// === ENVIRONMENT MAP (reflections) ===


// envMap.encoding = THREE.sRGBEncoding;
// scene.environment = envMap; // globally affects reflections

// === LOAD MODEL ===
loader.load(
  'css/img/model3.glb',
  function (gltf) {
    model = gltf.scene;

    // ✅ Apply new reflective material
    model.traverse((child) => {
      if (child.isMesh) {
        child.material = new THREE.MeshStandardMaterial({
          color: 0xffffff,  // pure white
          metalness: 0,
          roughness: 0.3,
          // emissive: 0xffffff,     // glow color
          // emissiveIntensity: 1.5, // how strong the glow is

        });

        child.material.needsUpdate = true;
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    // 




    const deg2rad = (deg) => deg * (Math.PI / 180);

    // === START VALUES ===
    model.position.set(7, -5, 0);       // X, Y, Z starting position
    model.rotation.set(
      deg2rad(250),  // Flip upside down along X
      deg2rad(0),   // Slight rotation around Y (tilt toward camera)
      deg2rad(19)   // Slight tilt around Z (top toward you)
    );
    model.scale.set(1, 1, 1);       // Starting scale
    scene.add(model);

    // After adding your model to the scene
    const glowMaterial = new THREE.MeshBasicMaterial({
        color: 0x00aaff,          // glow color
        transparent: true,
        opacity: 0.5,             // initial glow opacity
        blending: THREE.AdditiveBlending, // makes it glow
        side: THREE.BackSide      // render back faces only
    });

    // Clone your model to use as glow
    const glowMesh = model.clone();
    glowMesh.traverse((child) => {
      if (child.isMesh) {
        child.material = glowMaterial;
      }
    });

    // Slightly scale up the glow mesh so it surrounds the original
    glowMesh.scale.multiplyScalar(1.1);
    scene.add(glowMesh);


    const originalPosition = model.position.clone(); // center of floating

    // GSAP timeline
    // GSAP timeline
    const tl = gsap.timeline({ repeat: 0, yoyo: false });
    CustomEase.create("fastThenSlow", "M0,0 C0.4,1 0.6,1 1,1");

    tl.to(model.position, {
      x: -8.5, y: -2, z: -1, duration: 4, ease: "fastThenSlow"
    }, 0);

    tl.to(model.rotation, {
      x: deg2rad(190),
      y: deg2rad(-55),
      z: deg2rad(-20),
      duration: 4,
      ease: "fastThenSlow"
    }, 0);

    tl.to(model.scale, {
      x: 0.3,
      y: 0.3,
      z: 0.3,
      duration: 4,
      ease: "fastThenSlow"
    }, 0);

    // Trigger floating after animation finishes
    tl.eventCallback("onComplete", () => {
      // Store the final position of the model after GSAP
      const originalPosition = model.position.clone();

      const startTime = Date.now();

      function floatLoop() {
        requestAnimationFrame(floatLoop);

        const time = (Date.now() - startTime) * 0.001;

        // subtle floating around the final GSAP position
        model.position.x = originalPosition.x + Math.sin(time * 0.3) * 0.2;
        model.position.y = originalPosition.y + Math.sin(time * 0.4) * 0.2;
        model.position.z = originalPosition.z + Math.sin(time * 0.3) * 0.2;

        renderer.render(scene, camera);
      }

      floatLoop();
    });


  },
  (xhr) => console.log(`Loading model: ${(xhr.loaded / xhr.total) * 100}%`),
  (error) => console.error("Error loading model:", error)
);


// === RENDERER ===
const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputEncoding = THREE.sRGBEncoding;       // ✅ fix color brightness
renderer.physicallyCorrectLights = true;            // ✅ realistic lighting
document.getElementById('container3D').appendChild(renderer.domElement);

// === LIGHTS ===
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // brighter ambient
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
directionalLight.position.set(-5, -5, 7); // X = left, Y = bottom, Z = in front
directionalLight.castShadow = true;
scene.add(directionalLight);


const pointLight = new THREE.PointLight(0xffffff, 2, 10); // color, intensity, distance
pointLight.position.set(-5, -5, 7);
scene.add(pointLight);

let startTime = Date.now();

// === ANIMATION LOOP ===
function reRender3D() {
  requestAnimationFrame(reRender3D);
  renderer.render(scene, camera);
}
reRender3D();


// === RESPONSIVE ===
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});



///////////////////////////////

// Mouse position variables
let mouseX = 0;
let mouseY = 0;

// Sensitivity controls
const modelRotateFactor = 0.0008;
const modelMoveFactor = 0.02;
const textMoveFactor = 15;

// === TRACK MOUSE MOVEMENT ===
document.addEventListener("mousemove", (e) => {
    mouseX = (e.clientX - window.innerWidth / 2);
    mouseY = (e.clientY - window.innerHeight / 2);
});

// === animate function ===
function animate() {
    requestAnimationFrame(animate);

    if (model) {
        const targetPosX = mouseX * 0.002;
        const targetPosY = -mouseY * 0.002;

        model.position.x += (targetPosX - model.position.x) * 0.05;
        model.position.y += (targetPosY - model.position.y) * 0.05;
    }

    // Move text
    const title = document.querySelector(".slogin-text");
    if (title) {
        title.style.transform = `
            translate(${mouseX * 0.01}px, ${mouseY * 0.01}px)
        `;
    }

    // --- NEW: MOVE CSS GLOWS ---
    const glow = document.querySelector(".glow");
    const glow2 = document.querySelector(".glow2");

    if (glow) {
        glow.style.transform = `
            translate(${mouseX * 0.01}px, ${mouseY * 0.01}px)
        `;
    }

    if (glow2) {
        glow2.style.transform = `
            translate(${mouseX * 0.005}px, ${mouseY * 0.005}px)
        `;
    }

    renderer.render(scene, camera);
}

animate();

