import $ from 'jquery'
import * as THREE from 'three'
import * as dat from 'dat.gui'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'
import { ClampToEdgeWrapping, Mesh } from 'three'

const loading = {
    loaded: 0,
    total: 0,
}

const loadingManager = new THREE.LoadingManager()
loadingManager.onProgress = (item, loaded, total) => {
    loading.loaded = loaded
    loading.total = total
}

const dracoLoader = new DRACOLoader(loadingManager)
dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.4.1/')
dracoLoader.setDecoderConfig({type: 'js'})
dracoLoader.preload()

const gltfLoader = new GLTFLoader(loadingManager)
gltfLoader.setDRACOLoader(dracoLoader)

const model = {
    load: function(cb) {
        gltfLoader.load('/assets/models/fox/Fox.gltf', (gltf) => {
            const mixer = new THREE.AnimationMixer(gltf.scene)
            const action = mixer.clipAction(gltf.animations[1])
            action.play()
    
            gltf.scene.traverse((node) => {
                if (node.isMesh) { 
                    node.castShadow = true
                    node.receiveShadow = true
                }
            })
    
            gltf.scene.scale.set(0.01, 0.01, 0.01)
            gltf.scene.rotation.set(0, 1, 0)
            gltf.scene.position.set(0, 0, 0)

            cb(gltf.scene, mixer)
        })
    }
}

export const ykThree = {
    status: {
        loaded: false
    },
    canvas: [],

    load: function() {
        const _this = this

        fox($('.play-canvas[data-three=fox]'))
        infinite($('.play-canvas[data-three=infinite]'))

        _this.setCanvas()
        _this.resize()

        const clock = new THREE.Clock()
        let previousTime = 0
        
        const tick = () => {
            const elapsedTime = clock.getElapsedTime()
            const deltaTime = elapsedTime - previousTime
            previousTime = elapsedTime

            // camera.position.x = 4 * Math.cos(elapsedTime * 0.5) + 3
            // camera.position.z = Math.sin(elapsedTime * 0.5) + 4.5
            // camera.lookAt(new THREE.Vector3(0.5, 0, 0.5))
            
            _this.canvas.forEach(canvas => {
                canvas.renderer.render(canvas.scene, canvas.camera)
                if (canvas.controls) controls.update()
                canvas.motion(deltaTime)
            })
            window.requestAnimationFrame(tick)
        }
        tick()
    },

    resize: function() {
        const _this = this

        _this.setCanvas()

        _this.canvas.forEach(canvas => {
            canvas.camera.aspect = canvas.width /canvas.height
            canvas.camera.updateProjectionMatrix()

            canvas.renderer.setSize(canvas.width, canvas.height)
            canvas.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        })
    },

    scroll: function() {
    },

    setCanvas: function() {
        this.canvas.forEach(canvas => {
            canvas.width = $(canvas.el).width()
            canvas.height = $(canvas.el).height()
        })
    },
}








const fox = ($cvs) => {
    const canvas = {
        el: $cvs[0],
        width: $cvs.width(),
        height: $cvs.height(),
    }
    
    const scene = new THREE.Scene()
    model.load((gltf, mixer) => {
        scene.add(gltf)
        canvas.mixer = mixer
    })

    const floor = new THREE.Mesh(
        new THREE.CircleBufferGeometry(30, 12),
        new THREE.MeshStandardMaterial({ color: 0xefefef })
    )
    floor.receiveShadow = true
    floor.rotation.x = - Math.PI * 0.5
    scene.add(floor)

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.3)
    directionalLight.castShadow = true
    directionalLight.shadow.mapSize.set(512, 512)
    directionalLight.shadow.camera.far = 100
    directionalLight.shadow.camera.left = -20
    directionalLight.shadow.camera.top = 20
    directionalLight.shadow.camera.right = 20
    directionalLight.shadow.camera.bottom = -20
    directionalLight.position.set(15, 15, 15)
    scene.add(directionalLight)

    const camera = new THREE.PerspectiveCamera(75, canvas.width / canvas.height, 0.1, 100)
    camera.position.set(0, 2, 2.5)
    scene.add(camera)

    const controls = new OrbitControls(camera, canvas.el)
    controls.target.set(0, 0.7, 0)
    controls.maxDistance = 3.5
    controls.minDistance = 2
    controls.maxPolarAngle = 1.5
    controls.minPolarAngle = 0.8
    controls.enableDamping = true

    const renderer = new THREE.WebGLRenderer({ canvas: canvas.el })
    renderer.shadowMap.enabled = true
    renderer.shadowMapSoft = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.setClearColor(0xffffff, 0)

    canvas.motion = (deltaTime) => {
        const a = Math.random() * 0.3
        if (canvas.mixer) canvas.mixer.update(deltaTime * (1 + a))
    }

    canvas.scene = scene
    canvas.camera = camera
    canvas.renderer = renderer

    ykThree.canvas.push(canvas)
}


const infinite = ($cvs) => {
    const canvas = {
        el: $cvs[0],
        width: $cvs.width(),
        height: $cvs.height(),
    }
    
    const scene = new THREE.Scene()

    const box = new THREE.Mesh(
        new THREE.BoxBufferGeometry(1, 1, 1),
        new THREE.MeshStandardMaterial({ color: 0xefefef })
    )
    box.receiveShadow = true
    scene.add(box)

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8)
    scene.add(ambientLight)

    const directionalLight = new THREE.DirectionalLight(0xffeeff, 0.3)
    directionalLight.castShadow = true
    directionalLight.shadow.mapSize.set(512, 512)
    directionalLight.shadow.camera.far = 100
    directionalLight.shadow.camera.left = -20
    directionalLight.shadow.camera.top = 20
    directionalLight.shadow.camera.right = 20
    directionalLight.shadow.camera.bottom = -20
    directionalLight.position.set(15, 15, 15)
    scene.add(directionalLight)

    const camera = new THREE.PerspectiveCamera(75, canvas.width / canvas.height, 0.1, 100)
    camera.position.set(0, 1.5, 1.5)
    scene.add(camera)

    const controls = new OrbitControls(camera, canvas.el)
    controls.target.set(0, 0, 0)
    controls.maxDistance = 3.5
    controls.minDistance = 2
    controls.maxPolarAngle = 1.5
    controls.minPolarAngle = 0.8
    controls.enableDamping = true

    const renderer = new THREE.WebGLRenderer({ canvas: canvas.el })
    renderer.shadowMap.enabled = true
    renderer.shadowMapSoft = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    renderer.setClearColor(0xffffff, 0)

    canvas.motion = (deltaTime) => {
    }

    canvas.scene = scene
    canvas.camera = camera
    canvas.renderer = renderer

    ykThree.canvas.push(canvas)
}