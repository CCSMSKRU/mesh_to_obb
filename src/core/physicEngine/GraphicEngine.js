import {$} from '@core/jquery.extends'
import {Vector3} from '@core/physicEngine/geometry/Vector3'
import {degToRad, Model, OBB, Plane} from '@core/physicEngine/geometry/Geometry3D'
import * as THREE from 'three'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls'
import {Scene} from '@core/physicEngine/Scene/Scene'
import {Matrix4} from '@core/physicEngine/geometry/Matrix4'
import {OBJLoader} from 'three/examples/jsm/loaders/OBJLoader'
import {Matrix3} from '@core/physicEngine/geometry/Matrix3'

export class GraphicEngine {
    constructor(obj = {}) {

        // this._container = obj.container
        //     ? typeof obj.container === 'string' ? $(obj.container) : obj.container
        //     : $('body')

        this.container = obj.container
        this.containerXY = obj.containerXY
        this.containerXZ = obj.containerXZ
        this.containerYZ = obj.containerYZ
        this.container3D = obj.container3D

        this.optionsXY = obj.optionsXY
        this.optionsXZ = obj.optionsXZ
        this.optionsYZ = obj.optionsYZ
        this.options3D = obj.options3D

        this._renders = []
        this._scenes = []
        this._scenes_ = []

        this.inverseMultiplyVec = new Vector3(1, -1, -1)
        this.inverseMultiplyVecY = new Vector3(-1, 1, -1)
        this.inverseMultiplyVecZ = new Vector3(-1, -1, 1)
        this.inverseMultiplyVec3D = new Vector3(1, 1, 1)
        // this.inverseAddVec = new Vector3(1, -1, 1)
        // this.scale = obj.scale || new Vector3(0.0265, 0.0265, 0.0265)
        this.scale = obj.scale || new Vector3(0.0265, 0.0265, 0.0265)
        this.offset = obj.offset || new Vector3(0, 0, 0)

        const groundOptions = typeof obj.groundOptions === 'object' ? obj.groundOptions : null

        if (groundOptions) {
            this.ground = new Plane(groundOptions.normal || new Vector3(0, -1, 0), groundOptions.distance || 100000)
        }

        this.listeners3D = []

    }

    get contextXY() {
        if (!this._contextXY) this._contextXY = this.canvasXY.getContext('2d')
        return this._contextXY
    }

    get contextXZ() {
        if (!this._contextXZ) this._contextXZ = this.canvasXZ.getContext('2d')
        return this._contextXZ
    }

    get container() {
        return this._container || $('body')
    }

    set container(val) {
        this._container = val
            ? typeof val === 'string' ? $(val) : val
            : $('body')
        // if (this._container) this._container[0].listeners3D = this._container[0].listeners3D || []
    }

    get containerXY() {
        return this._containerXY || this._container
    }

    set containerXY(val) {
        this._containerXY = val
            ? typeof val === 'string' ? $(val) : val
            : null
    }

    get containerXZ() {
        return this._containerXZ || this._container
    }

    set containerXZ(val) {
        this._containerXZ = val
            ? typeof val === 'string' ? $(val) : val
            : null
    }

    get containerYZ() {
        return this._containerYZ || this._container
    }

    set containerYZ(val) {
        this._containerYZ = val
            ? typeof val === 'string' ? $(val) : val
            : null
    }

    get container3D() {
        return this._container3D || this._container
    }

    set container3D(val) {
        this._container3D = val
            ? typeof val === 'string' ? $(val) : val
            : null
        // if (this._container3D) this._container3D[0].listeners3D = this._container3D[0].listeners3D || []
    }

    get optionsXY() {
        return this._optionsXY
    }

    set optionsXY(val) {
        const optionsXY = val || {}
        this._optionsXY = {
            width: optionsXY.width || 10,
            height: optionsXY.height || 10,
            attr: optionsXY.attr || {},
            css: optionsXY.css || {}
        }

        this._optionsXY.attr.width = this._optionsXY.width
        this._optionsXY.attr.height = this._optionsXY.height
        delete this._optionsXY.css.width
        delete this._optionsXY.css.height
    }

    get optionsXZ() {
        return this._optionsXZ
    }

    set optionsXZ(val) {
        const optionsXZ = val || {}
        this._optionsXZ = {
            width: optionsXZ.width || 10,
            height: optionsXZ.height || 10,
            attr: optionsXZ.attr || {},
            css: optionsXZ.css || {}
        }

        this._optionsXZ.attr.width = this._optionsXZ.width
        this._optionsXZ.attr.height = this._optionsXZ.height
        delete this._optionsXZ.css.width
        delete this._optionsXZ.css.height
    }

    get optionsYZ() {
        return this._optionsYZ
    }

    set optionsYZ(val) {
        const optionsYZ = val || {}
        this._optionsYZ = {
            width: optionsYZ.width || 10,
            height: optionsYZ.height || 10,
            attr: optionsYZ.attr || {},
            css: optionsYZ.css || {}
        }

        this._optionsYZ.attr.width = this._optionsYZ.width
        this._optionsYZ.attr.height = this._optionsYZ.height
        delete this._optionsYZ.css.width
        delete this._optionsYZ.css.height
    }

    get options3D() {
        return this._options3D
    }

    set options3D(val) {
        const options3D = val || {}
        this._options3D = {
            ...val,
            width: options3D.width || 10,
            height: options3D.height || 10,
            attr: options3D.attr || {},
            css: options3D.css || {},
            drawBounds: options3D.drawBounds || false

        }

        this._options3D.attr.width = this._options3D.width
        this._options3D.attr.height = this._options3D.height
        this._options3D.css.width = '100%'
        this._options3D.css.height = '100%'
    }

    initXY(options, container) {
        if (options) this.optionsXY = options
        if (container) this.containerXY = container

        this.canvasXY = $.create('canvas')
            .addClass('canvasXY')
            .attr(this.optionsXY.attr)
            .css(this.optionsXY.css)
        this.containerXY.html(this.canvasXY.html())

        this.canvasXY.on('wheel', (e) => {
            if (!e.ctrlKey) return
            e.preventDefault()

            let delta = e.wheelDelta / 20000
            this.scale = this.scale.add(new Vector3(delta, delta, delta))
        })

        this.canvasXY.on('mousedown', (e) => {
            if (!e.ctrlKey) return
            e.preventDefault()

            const moveFunc = eMove => {
                if (!eMove.ctrlKey) return
                eMove.preventDefault()
                this.offset = this.offset.add(new Vector3(eMove.movementX, eMove.movementY, eMove.movementY))
            }

            const upFunc = eUp => {
                this.canvasXY.off('mousemove', moveFunc)
                this.canvasXY.off('mouseup', upFunc)
            }

            this.canvasXY.on('mousemove', moveFunc)

            this.canvasXY.on('mouseup', upFunc)
        })

        return this
    }

    initXZ(options, container) {
        if (options) this.optionsXZ = options
        if (container) this.containerXZ = container

        this.canvasXZ = $.create('canvas')
            .addClass('canvasXZ')
            .attr(this.optionsXZ.attr)
            .css(this.optionsXZ.css)
        this.containerXZ.html(this.canvasXZ.html())

        this.canvasXZ.on('wheel', (e) => {
            if (!e.ctrlKey) return
            e.preventDefault()

            let delta = e.wheelDelta / 20000
            this.scale = this.scale.add(new Vector3(delta, delta, delta))
        })

        this.canvasXZ.on('mousedown', (e) => {
            if (!e.ctrlKey) return
            e.preventDefault()

            const moveFunc = eMove => {
                if (!eMove.ctrlKey) return
                eMove.preventDefault()
                this.offset = this.offset.add(new Vector3(eMove.movementX, eMove.movementY, eMove.movementY))
            }

            const upFunc = eUp => {
                this.canvasXZ.off('mousemove', moveFunc)
                this.canvasXZ.off('mouseup', upFunc)
            }

            this.canvasXZ.on('mousemove', moveFunc)

            this.canvasXZ.on('mouseup', upFunc)
        })

        return this
    }

    initYZ(options, container) {
        if (options) this.optionsYZ = options
        if (container) this.containerYZ = container

        this.canvasYZ = $.create('canvas')
            .addClass('canvasYZ')
            .attr(this.optionsYZ.attr)
            .css(this.optionsYZ.css)
        this.containerYZ.html(this.canvasYZ.html())

        this.canvasYZ.on('wheel', (e) => {
            if (!e.ctrlKey) return
            e.preventDefault()

            let delta = e.wheelDelta / 20000
            this.scale = this.scale.add(new Vector3(delta, delta, delta))
        })

        this.canvasYZ.on('mousedown', (e) => {
            if (!e.ctrlKey) return
            e.preventDefault()

            const moveFunc = eMove => {
                if (!eMove.ctrlKey) return
                eMove.preventDefault()
                this.offset = this.offset.add(new Vector3(eMove.movementX, eMove.movementY, eMove.movementY))
            }

            const upFunc = eUp => {
                this.canvasYZ.off('mousemove', moveFunc)
                this.canvasYZ.off('mouseup', upFunc)
            }

            this.canvasYZ.on('mousemove', moveFunc)

            this.canvasYZ.on('mouseup', upFunc)
        })

        return this
    }

    selectOn3DEvent() {
    }

    init3D(options, container) {
        if (options) this.options3D = options
        if (container) this.container3D = container

        // this.div3D = $.create('div')
        //     .addClass('div3D')
        //     .attr(this.options3D.attr)
        //     .css(this.options3D.css)
        // // this.container3D.html(this.div3D.html())
        // this.container3D.append(this.div3D)

        this.scene3D = new THREE.Scene()
        // this.camera3D = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
        this.camera3D = new THREE.PerspectiveCamera(45, this.options3D.width / this.options3D.height, 0.1, 100000)
        // this.camera3D.position.z = 1;


        // const geometry = new THREE.BoxGeometry( 0.2, 0.2, 0.2 );
        // const material = new THREE.MeshNormalMaterial();
        //
        // const mesh = new THREE.Mesh( geometry, material );
        // this.scene3D.add( mesh );


        this.renderer3D = new THREE.WebGLRenderer({
            antialias: true,
            preserveDrawingBuffer: this.options3D.preserveDrawingBuffer
        })
        //renderer.shadowMapEnabled = true;
        this.renderer3D.setSize(this.options3D.width, this.options3D.height)
        const clearColor = typeof this.options3D.clearColor !== 'undefined' ? this.options3D.clearColor : 0xA7B0C4
        this.renderer3D.setClearColor(clearColor, 1)
        const $renderer3D = $(this.renderer3D.domElement)
        $renderer3D
            .addClass('div3D')
            .attr(this.options3D.attr)
            .css(this.options3D.css)
        // $renderer3D.css(this.options3D.css)
        this.container3D.html('').append($renderer3D[0])
        // this.container3D.append(this.renderer3D.domElement)

        this.controls3D = new OrbitControls(this.camera3D, this.renderer3D.domElement)

        // this.angle = 0
        if (this.options3D.axesHelper) {
            var axesHelper = new THREE.AxesHelper(50000)
            this.scene3D.add(axesHelper)
        }

        const light = new THREE.SpotLight()
        light.position.set(100000, 100000, 100000)
        light.castShadow = true
        this.scene3D.add(light)


        const light2 = new THREE.SpotLight()
        light2.position.set(-100000, 100000, -100000)
        light2.castShadow = true
        this.scene3D.add(light2)

        const light3 = new THREE.SpotLight()
        light3.position.set(0, -1000000, 0)
        light3.castShadow = true
        this.scene3D.add(light3)

        // const plane = new THREE.Mesh(new THREE.PlaneGeometry(400,400,10,10), new THREE.MeshLambertMaterial());
        // plane.rotation.x = -Math.PI / 2;
        // plane.position.y = 0;
        // plane.receiveShadow = true;
        // this.scene3D.add(plane);

        // const animate = ()=> {
        //     requestAnimationFrame( animate );
        //     this.renderer3D.render( this.scene3D, this.camera3D );
        // }
        // animate();
        //
        // this.canvasXY.on('wheel', (e) => {
        //     if (!e.ctrlKey) return
        //     e.preventDefault()
        //
        //     let delta = e.wheelDelta / 20000
        //     this.scale = this.scale.add(new Vector3(delta, delta, delta))
        //     // console.log(this.scale);
        // })
        //
        // this.canvasXY.on('mousedown', (e) => {
        //     if (!e.ctrlKey) return
        //     e.preventDefault()
        //
        //     const moveFunc = eMove => {
        //         if (!eMove.ctrlKey) return
        //         eMove.preventDefault()
        //         this.offset = this.offset.add(new Vector3(eMove.movementX, eMove.movementY, eMove.movementY))
        //     }
        //
        //     const upFunc = eUp => {
        //         this.canvasXY.off('mousemove', moveFunc)
        //         this.canvasXY.off('mouseup', upFunc)
        //     }
        //
        //     this.canvasXY.on('mousemove', moveFunc)
        //
        //     this.canvasXY.on('mouseup', upFunc)
        // })

        // if (false) {
        //
        //     const listener = {event: 'mousedown', target: this.container3D[0]}
        //
        //     listener.fn = (event) => {
        //         event.preventDefault()
        //         // console.log('X',event.clientX, listener.target.width())
        //         const elemBound = listener.target.getBoundingClientRect()
        //         const x = event.clientX - elemBound.x
        //         const y = event.clientY - elemBound.y
        //
        //         const mouse3D = new THREE.Vector3((x / elemBound.width) * 2 - 1,
        //             -(y / elemBound.height) * 2 + 1,
        //             0.5)
        //
        //         console.log('mouse3D', mouse3D)
        //         const raycaster = new THREE.Raycaster()
        //         raycaster.setFromCamera(mouse3D, this.camera3D)
        //         // var raycaster = new THREE.Raycaster(this.camera3D.position, mouse3D.sub(this.camera3D.position).normalize());
        //         // console.log('this.scene3D',this.scene3D)
        //         var intersects = raycaster.intersectObjects(this.scene3D.children)
        //         console.log(intersects)
        //         if (intersects.length > 0) {
        //             intersects[0].object.material.color.setHex(Math.random() * 0xffffff)
        //         }
        //     }
        //
        //
        //     this.container3D[0].listeners3D.push(listener)
        //
        //     console.log('addEventListener', this.container3D[0].listeners3D)
        //     listener.target.addEventListener(listener.event, listener.fn)
        //
        //
        // }

        if (this.options3D.selectOn3DEvent) {


            this.selectOn3DEvent = (event, cb) => {
                event.preventDefault()
                const elemBound = this.container3D[0].getBoundingClientRect()
                const x = event.clientX - elemBound.x
                const y = event.clientY - elemBound.y

                const mouse3D = new THREE.Vector3((x / elemBound.width) * 2 - 1,
                    -(y / elemBound.height) * 2 + 1,
                    0.5)

                const raycaster = new THREE.Raycaster()
                raycaster.setFromCamera(mouse3D, this.camera3D)
                var intersects = raycaster.intersectObjects(this.scene3D.children)
                // if (intersects.length > 0) {
                //     intersects[0].object.material.color.setHex(Math.random() * 0xffffff)
                // }
                if (typeof cb === 'function') cb({intersects})
            }


        }


        return this
    }

    img3D() {
        if (!this.renderer3D) return null
        var strMime = "image/jpeg"
        return this.renderer3D.domElement.toDataURL(strMime)
    }


    createScene() {
        const scene = new Scene()
        scene.pEngine = this
        this._scenes_.push(scene)
        return scene
    }

    getScene(id) {
        return this._scenes.filter(one => one.id === id)[0]
    }

    removeScene(id) {
        this._scenes = this._scenes.filter(one => one.id !== id)
        return this
    }

    clear3DScene() {
        if (!this.scene3D) return
        // const ids = this.scene3D.children.filter(one=>one.name).map(one=>one.name.replace(/_.*/ig, ''))
        this.scene3D.children = this.scene3D.children.filter(one => !one.name)
        // this.scene3D.children.forEach(one=>{
        //     if (!one.name) return
        //     this.scene3D.remove(one)
        // })
        // console.log('this.scene3D.children', this.scene3D.children);
    }

    addToRequestAnimationFrame(func) {
        if (func && !this._renders.includes(func)) this._renders.push(func)

        if (!this.requestAnimationFrame) {
            this.requestAnimationFrame = window.requestAnimationFrame(this.requestAnimationFrameCallback.bind(this))
        }
    }

    requestAnimationFrameCallback() {
        this._renders.forEach(oneCb => {
            oneCb()
        })
        this.requestAnimationFrame = window.requestAnimationFrame(this.requestAnimationFrameCallback.bind(this))
    }

    stopRequestAnimationFrame() {
        if (this.requestAnimationFrame) {
            window.cancelAnimationFrame(this.requestAnimationFrame)
            this.requestAnimationFrame = undefined
        }
    }

    removeFromRequestAnimationFrame(func) {
        if (func && this._renders.includes(func)) this._renders = this._renders.filter(one => one !== func)

        if (this.requestAnimationFrame && !this._renders.length) {
            this.stopRequestAnimationFrame()
        }
    }


    renderSceneXY(scene) {
        this.renderSceneXY_func = this.renderSceneXY_.bind(this, scene)
        this.addToRequestAnimationFrame(this.renderSceneXY_func)
    }

    stopRenderSceneXY() {
        this.removeFromRequestAnimationFrame(this.renderSceneXY_func)
    }

    renderPhysicObjectXY(physicObjectPos, parentPhysicObjectPos) {
        physicObjectPos.items.forEach(one => this.renderPhysicObjectXY(one, parentPhysicObjectPos || physicObjectPos))

        const graphicOptions = parentPhysicObjectPos
            ? {...parentPhysicObjectPos.graphicOptions, ...physicObjectPos.graphicOptions}
            : {...physicObjectPos.graphicOptions}

        const zeroPos = new Vector3(0, this.optionsXY.height, 0).subtract(
            new Vector3(0, 0, 0)
        ).add(this.offset)
        this.contextXY.beginPath()
        this.contextXY.arc(zeroPos.x, zeroPos.y, 2, 0, 2 * Math.PI)
        this.contextXY.fillStyle = '#F00'
        this.contextXY.fill()
        this.contextXY.closePath()

        this.contextXY.beginPath()

        if (physicObjectPos.items.length) {
            this.contextXY.setLineDash(graphicOptions.lineDash || [5, 2])
            this.contextXY.lineWidth = .5
        } else {
            this.contextXY.setLineDash([])
            this.contextXY.lineWidth = graphicOptions.lineWidth || 1
        }

        if (physicObjectPos.graphicOptions.fill) {
            this.contextXY.fillStyle = graphicOptions.fillStyle || '#000000'
        }
        this.contextXY.strokeStyle = graphicOptions.strokeStyle || '#000000'

        const boxSize = physicObjectPos.box.size.multiply(this.scale)

        const boxPos = new Vector3(0, this.optionsXY.height, 0)
            .subtract(
                physicObjectPos.box.position
                    .multiply(this.scale)
            )
            .multiply(this.inverseMultiplyVecY)
            .add(this.offset)

        if (physicObjectPos.graphicOptions.fill) {
            this.contextXY.fillRect(boxPos.x, boxPos.y, boxSize.x, boxSize.y)
        }

        this.contextXY.strokeRect(boxPos.x - boxSize.x, boxPos.y - boxSize.y, boxSize.x * 2, boxSize.y * 2)
        this.contextXY.closePath()


        this.contextXY.font = "12px Arial"
        this.contextXY.fillText("Y", 10, 22)
        this.contextXY.fillText("X", this.optionsXY.width - 22, this.optionsXY.height - 10)

    }

    renderSceneXY_(scene) {
        this.contextXY.clearRect(0, 0, this.optionsXY.width, this.optionsXY.height)
        scene.items.forEach(boxPos => {
            this.renderPhysicObjectXY(boxPos)
        })
    }

    //////==RENDER=XZ=======/////

    renderSceneXZ(scene) {
        this.renderSceneXZ_func = this.renderSceneXZ_.bind(this, scene)
        this.addToRequestAnimationFrame(this.renderSceneXZ_func)
    }

    stopRenderSceneXZ() {
        this.removeFromRequestAnimationFrame(this.renderSceneXZ_func)
    }

    renderPhysicObjectXZ(physicObjectPos, parentPhysicObject) {
        physicObjectPos.items.forEach(one => this.renderPhysicObjectXZ(one, parentPhysicObject || physicObjectPos))

        const graphicOptions = parentPhysicObject
            ? {...parentPhysicObject.graphicOptions, ...physicObjectPos.graphicOptions}
            : {...physicObjectPos.graphicOptions}


        const zeroPos = new Vector3(0, 0, 0)
            .add(new Vector3(0, this.optionsXY.height, 0))
            .add(this.offset)
        this.contextXZ.beginPath()
        this.contextXZ.arc(zeroPos.x, zeroPos.y, 2, 0, 2 * Math.PI)
        this.contextXZ.fillStyle = '#F00'
        this.contextXZ.fill()
        this.contextXZ.closePath()

        this.contextXZ.beginPath()

        if (physicObjectPos.items.length) {
            this.contextXZ.setLineDash(graphicOptions.lineDash || [5, 2])
            this.contextXZ.lineWidth = .5
        } else {
            this.contextXZ.setLineDash([])
            this.contextXZ.lineWidth = graphicOptions.lineWidth || 1
        }

        if (physicObjectPos.graphicOptions.fill) {
            this.contextXZ.fillStyle = graphicOptions.fillStyle || '#000000'
        }
        this.contextXZ.strokeStyle = graphicOptions.strokeStyle || '#000000'


        const boxSize = physicObjectPos.box.size.multiply(this.scale)

        const boxPos = new Vector3(0, 0, this.optionsXY.height)
            .subtract(
                physicObjectPos.box.position
                    .multiply(this.scale)
            )
            .multiply(this.inverseMultiplyVecZ)
            .add(this.offset)


        if (physicObjectPos.graphicOptions.fill) {
            this.contextXZ.fillRect(boxPos.x, boxPos.z, boxSize.x, boxSize.z)
        }

        this.contextXZ.strokeRect(boxPos.x - boxSize.x, boxPos.z - boxSize.z, boxSize.x * 2, boxSize.z * 2)
        this.contextXZ.closePath()


        this.contextXZ.font = "12px Arial"
        this.contextXZ.fillText("Z", 10, 22)
        this.contextXZ.fillText("X", this.optionsXY.width - 22, this.optionsXY.height - 10)

        // const boxSize = physicObjectPos.size.multiply(this.scale)
        // const boxPos = physicObjectPos.position
        //     .add(physicObjectPos.offset)
        //     .multiply(this.scale)
        // const boxPosOrign = physicObjectPos.origin
        //     .add(boxPos)
        //     .multiply(this.inverseMultiplyVec)
        //     .add(new Vector3(0, 0, this.optionsXZ.height - boxSize.z))
        //     .add(this.offset)


        // const rotationY = physicObjectPos.rotation ? physicObjectPos.rotation.y : null
        // if (rotationY) {
        //     this.contextXZ.translate(boxPosOrign.x, boxPosOrign.z)
        //     this.contextXZ.rotate(degToRad(rotationY))
        //     if (physicObjectPos.graphicOptions.fill) {
        //         // this.contextXZ.fillRect(-boxSize.x / 2, -boxSize.z / 2, boxSize.x, boxSize.z)
        //         this.contextXZ.fillRect(0, 0, boxSize.x, boxSize.z)
        //     }
        //     // this.contextXZ.strokeRect(-boxSize.x / 2, -boxSize.z / 2, boxSize.x, boxSize.z)
        //     this.contextXZ.strokeRect(0, 0, boxSize.x, boxSize.z)
        //     this.contextXZ.rotate(-degToRad(rotationY))
        //     this.contextXZ.translate(-boxPosOrign.x, -boxPosOrign.z)
        // } else {
        //     if (physicObjectPos.graphicOptions.fill) {
        //         this.contextXZ.fillRect(boxPosOrign.x, boxPosOrign.z, boxSize.x, boxSize.z)
        //     }
        //     this.contextXZ.strokeRect(boxPosOrign.x, boxPosOrign.z, boxSize.x, boxSize.z)
        // }
        //
        // this.contextXZ.closePath()
    }

    renderSceneXZ_(scene) {
        this.contextXZ.clearRect(0, 0, this.optionsXZ.width, this.optionsXZ.height)
        scene.items.forEach(boxPos => {
            this.renderPhysicObjectXZ(boxPos)
        })
    }


    //////==RENDER=3D=======/////

    // addTo3DPhysicObject3D(physicObjectPos, parentPhysicObject) {
    //
    //     physicObjectPos.items.forEach(one => this.addTo3DPhysicObject3D(one, parentPhysicObject || physicObjectPos))
    //
    //     if (physicObjectPos.items.length) return
    //
    //     const graphicOptions = parentPhysicObject
    //         ? {...parentPhysicObject.graphicOptions, ...physicObjectPos.graphicOptions}
    //         : {...physicObjectPos.graphicOptions}
    //
    //     // let boxSize = physicObjectPos.size
    //     // const boxPos = physicObjectPos.position.add(physicObjectPos.offset)
    //
    //     const boxSize = physicObjectPos.box.size //.multiply(this.scale)
    //     debugger;
    //     const boxPos = physicObjectPos.box.position.multiply(this.inverseMultiplyVec3D)
    //
    //
    //
    //     const geometry = new THREE.BoxGeometry(boxSize.x * 2, boxSize.y * 2, boxSize.z * 2)
    //     const material = new THREE.MeshLambertMaterial({color: graphicOptions.materialColor || '#0F0'})
    //     const cube = new THREE.Mesh(geometry, material)
    //     cube.name = physicObjectPos.id
    //     cube.position.set(boxPos.x, boxPos.y, boxPos.z)
    //
    //     // https://jsfiddle.net/1qoev8jr/
    //     // https://jsfiddle.net/eh5zqa4r/1/
    //
    //     const rotation = physicObjectPos.rotation ? physicObjectPos.rotation : null
    //
    //     if (rotation) {
    //         cube.rotation.z = -degToRad(rotation.y)
    //     }
    //
    //
    //     this.scene3D.add(cube)
    //
    //     var axesHelper = new THREE.AxesHelper(50000)
    //     this.scene3D.add(axesHelper)
    // }

    addModelTo3D(model, topModel = {}) {
        if (model.type === 'OBJ') {
            var loader = new OBJLoader()
            const scene = this.scene3D
            // load a resource
            loader.load(
                // resource URL
                model.objUrl,
                // called when resource is loaded
                function (object) {

                    scene.add(object)
                    console.log('Three object', object)
                    // scene.add( object );

                },
                // called when loading is in progresses
                function (xhr) {

                    console.log((xhr.loaded / xhr.total * 100) + '% loaded')

                },
                // called when loading has errors
                function (error) {

                    console.log('An error happened', error)

                }
            )

            return
        }

        if (model.type === 'THREEJS_OBJ') {
            model.content.name = model.name
            this.scene3D.add(model.content)
            return
        }


        const graphicOptions = model.graphicOptions || topModel.graphicOptions || {}

        let box = model.content || model
        if (model.content.bounds) box = model.content.bounds

        const boxSize = box.size //.multiply(this.scale)
        const boxPos = box.position //.multiply(this.inverseMultiplyVec3D)
        const geometry = new THREE.BoxGeometry(boxSize.x * 2, boxSize.y * 2, boxSize.z * 2)
        const material = new THREE.MeshPhongMaterial({
            color: graphicOptions.materialColor || '#0F0',
            opacity: typeof graphicOptions.opacity !== 'undefined' ? graphicOptions.opacity : 1,
            // transparent:graphicOptions.transparent
            transparent: !(typeof graphicOptions.opacity !== 'undefined' && graphicOptions.opacity === 1)
        })
        const cube = new THREE.Mesh(geometry, material)
        cube.name = model.id
        cube.position.set(boxPos.x, boxPos.y, boxPos.z)
        this.scene3D.add(cube)


        if (this.options3D.drawBounds) {
            const boundsFullSize = model.boundsFull.size //.multiply(this.scale)
            const boundsFullPos = box.position //.multiply(this.inverseMultiplyVec3D)
            const boundsFullGeometry = new THREE.BoxGeometry(boundsFullSize.x * 2, boundsFullSize.y * 2, boundsFullSize.z * 2)

            const boundsFullMaterial = new THREE.MeshPhongMaterial({
                color: model.childs.length ? '#cdffcb' : '#ffa2a5',
                opacity: model.childs.length ? 0.2 : 0.5,
                transparent: true,
            })
            const boundsFullBox = new THREE.Mesh(boundsFullGeometry, boundsFullMaterial)
            boundsFullBox.name = model.id + '_boundsFull'
            boundsFullBox.position.set(boundsFullPos.x, boundsFullPos.y, boundsFullPos.z)
            this.scene3D.add(boundsFullBox)
        }


        if (this.options3D.drawSupports) {
            const supportsGroups = model.supportGroupsAll
            if (supportsGroups.length) {
                supportsGroups.forEach(group => {
                    group.items.forEach((item, index) => {
                        const point = item.point
                        const geometry = new THREE.SphereGeometry(50, 32, 32)
                        const material = new THREE.MeshBasicMaterial({color: 0xff0000})
                        const sphere = new THREE.Mesh(geometry, material)
                        sphere.name = model.id + '_supportPoint' + index
                        sphere.name = `${model.id}_supportPoint_${group.name}_${index}`
                        sphere.position.set(point.x, point.y, point.z)
                        this.scene3D.add(sphere)
                    })

                })
            }
        }

        // if ((this.options3D.drawWheelAxle || true) && model.isTop) {
        //     model.wheelAxles.forEach(axle => {
        //         const axleLineMaterial = new THREE.LineBasicMaterial({
        //             color: 0x2FC24A
        //         })
        //         const points = []
        //         points.push(new THREE.Vector3(axle.x, axle.y + 300, -axle.width))
        //         points.push(new THREE.Vector3(axle.x, axle.y + 300, axle.width))
        //
        //         const axleLineGeometry = new THREE.BufferGeometry().setFromPoints(points)
        //
        //         const axleLine = new THREE.Line(axleLineGeometry, axleLineMaterial)
        //
        //         axleLine.name = model.id + '_axleLine_' + axle.id
        //         this.scene3D.add(axleLine)
        //
        //     })
        // }

    }

    renderScene3D(scene) {


        const cameraPosition = this.options3D.cameraPosition
            ? [this.options3D.cameraPosition.x, this.options3D.cameraPosition.y, this.options3D.cameraPosition.z]
            : [10000, 10000, 40000]
        this.camera3D.position.set(...cameraPosition)
        const cameraTarget = this.options3D.cameraTarget
            ? [this.options3D.cameraTarget.x, this.options3D.cameraTarget.y, this.options3D.cameraTarget.z]
            : [0, 0, 0]
        this.controls3D.target = new THREE.Vector3(...cameraTarget)
        this.controls3D.update()

        scene.objects.forEach(model => {
            if (model.type === 'OBJ') this.addModelTo3D(model)
            if (model.type === 'THREEJS_OBJ') this.addModelTo3D(model)
        })

        if (this.ground instanceof Plane) {
            const geometry = new THREE.PlaneGeometry(this.ground.distance, this.ground.distance, 1, 1)
            const material = new THREE.MeshBasicMaterial({color: '#0000ff', side: THREE.DoubleSide})
            const plane = new THREE.Mesh(geometry, material)
            plane.material.transparent = true
            plane.material.opacity = 0.1
            plane.rotateX(-Math.PI / 2)
            this.scene3D.add(plane)
        }


        this.renderScene3D_func = this.renderScene3D_.bind(this, scene)
        this.addToRequestAnimationFrame(this.renderScene3D_func)
    }

    stopRenderScene3D() {
        this.removeFromRequestAnimationFrame(this.renderScene3D_func)
    }


    renderModel3D(model, topModel) {
        if (!topModel) topModel = model

        // if ()

        if (model.type === 'OBJ' || model.type === 'THREEJS_OBJ') return
        if (model instanceof Plane) return
        if (model instanceof Model && !model.content) return

        if (!model.content) return


        const cube = this.scene3D.getObjectByName(model.id)
        if (!cube) {
            this.addModelTo3D(model)
            return this.renderModel3D(model)
        }


        if (model.content.sizeNeedUpdate) {
            const scaleX = (model.content.size.x * 2) / cube.geometry.parameters.width
            const scaleY = (model.content.size.y * 2) / cube.geometry.parameters.height
            const scaleZ = (model.content.size.z * 2) / cube.geometry.parameters.depth
            cube.scale.set(scaleX, scaleY, scaleZ)
            model.content.sizeNeedUpdate = false
        }


        if (model.graphicOptions.updated) {
            delete model.graphicOptions.updated
            delete model.graphicOptions.needUpdate
        }

        const graphicOptions = {...topModel.graphicOptions, ...model.graphicOptions}
        if (graphicOptions.needUpdate) {
            if (graphicOptions.materialColor) cube.material.color = new THREE.Color(graphicOptions.materialColor)
            // if (graphicOptions.transparent) cube.material.transparent = graphicOptions.transparent
            const opacity = typeof graphicOptions.opacity !== 'undefined' ? graphicOptions.opacity : null
            if (opacity) {
                cube.material.transparent = !(opacity === 1)
                cube.material.opacity = opacity
            }
            model.graphicOptions.updated = true


            // if (model.removed) {
            //     // Remove from 3D scene
            //     this.scene3D.remove(cube)
            //     model.removed = undefined
            //     let selectBox = this.scene3D.getObjectByName(model.id + '_selectBox')
            //     if (selectBox) this.scene3D.remove(selectBox)
            //
            // } else
            if (model.selected) {
                let selectBox = this.scene3D.getObjectByName(model.id + '_selectBox')
                if (!selectBox) {
                    selectBox = new THREE.BoxHelper(cube, 0xffff00)
                    selectBox.name = model.id + '_selectBox'
                    this.scene3D.add(selectBox)
                }

                //
                // const boundsFullSize = model.boundsFull.size
                // const boundsFullPos = model.boundsFull.position
                // if (selectBox) {
                //     const scaleX = (model.boundsFull.size.x * 2) / selectBox.geometry.parameters.width
                //     const scaleY = (model.boundsFull.size.y * 2) / selectBox.geometry.parameters.height
                //     const scaleZ = (model.boundsFull.size.z * 2) / selectBox.geometry.parameters.depth
                //     selectBox.scale.set(scaleX, scaleY, scaleZ)
                //     // cubeBoundsFull.position.set(model.boundsFull.position.x, model.boundsFull.position.y, model.boundsFull.position.z)
                //     selectBox.position.set(boundsFullPos.x, boundsFullPos.y, boundsFullPos.z)
                // } else {
                //     selectBox = new THREE.BoxHelper( cube, 0xffff00 );
                //     selectBox.name = model.id + '_selectBox'
                //     this.scene3D.add(selectBox)
                // }
            } else {
                let selectBox = this.scene3D.getObjectByName(model.id + '_selectBox')
                if (selectBox) this.scene3D.remove(selectBox)
            }

            // if (model.selected) {
            //     let selectBox = this.scene3D.getObjectByName(model.id + '_selectBox')
            //
            //     const boundsFullSize = model.boundsFull.size //.multiply(this.scale)
            //     const boundsFullPos = model.boundsFull.position
            //
            //     if (selectBox) {
            //         const scaleX = (model.boundsFull.size.x * 2) / selectBox.geometry.parameters.width
            //         const scaleY = (model.boundsFull.size.y * 2) / selectBox.geometry.parameters.height
            //         const scaleZ = (model.boundsFull.size.z * 2) / selectBox.geometry.parameters.depth
            //         selectBox.scale.set(scaleX, scaleY, scaleZ)
            //         // cubeBoundsFull.position.set(model.boundsFull.position.x, model.boundsFull.position.y, model.boundsFull.position.z)
            //         selectBox.position.set(boundsFullPos.x, boundsFullPos.y, boundsFullPos.z)
            //     } else {
            //         const boundsFullGeometry = new THREE.BoxGeometry(boundsFullSize.x * 2 + 50, boundsFullSize.y * 2  + 50, boundsFullSize.z * 2 + 50)
            //
            //         const boundsFullMaterial = new THREE.MeshPhongMaterial({
            //             color: model.childs.length ? '#cdffcb' : '#ffa2a5',
            //             opacity: model.childs.length ? 0.2 : 0.5,
            //             transparent: true,
            //         })
            //         selectBox = new THREE.Mesh(boundsFullGeometry, boundsFullMaterial)
            //         selectBox.name = model.id + '_selectBox'
            //         selectBox.position.set(boundsFullPos.x, boundsFullPos.y, boundsFullPos.z)
            //         this.scene3D.add(selectBox)
            //     }
            // } else {
            //     let selectBox = this.scene3D.getObjectByName(model.id + '_selectBox')
            //     console.log('this.scene3D.children', this.scene3D.children)
            //     this.scene3D.remove(selectBox)
            //     // if (selectBox) this.scene3D =
            // }
        }


        const box1 = model.getOBB()
        const oma = box1.orientation.inverse()

        const m4t = new Matrix4(
            oma._11, oma._12, oma._13, 0,
            oma._21, oma._22, oma._23, 0,
            oma._31, oma._32, oma._33, 0,
            ...box1.position.asArray, 1
        )
        const m1 = new THREE.Matrix4()
        m1.set(...m4t.asArray)
        cube.setRotationFromMatrix(m1)

        cube.updateMatrix()
        let boxPos = m4t.getTranslation()


        // let box = model.getOBB()
        //
        // const oma = box.orientation
        // // const oma = box.orientation.multiplyVector(new Vector3(1, -1, -1))
        //
        // // const inverseZMatrix = new Matrix4(
        // //     -1, 0, 0, 0,
        // //     0, -1, 0, 0,
        // //     0, 0, 1, 0,
        // //     0, 0, 0, 1)
        //
        // let self_rotation = new Matrix4(
        //     oma._11, oma._12, oma._13, 0,
        //     oma._21, oma._22, oma._23, 0,
        //     oma._31, oma._32, oma._33, 0,
        //     0, 0, 0, 1
        // ).inverse()
        // // ).inverse().multiply(inverseZMatrix)
        // // )
        //
        //
        // const m = new THREE.Matrix4()
        // m.set(...self_rotation.asArray)
        // cube.setRotationFromMatrix(m)
        //
        // cube.updateMatrix();
        //
        // let boxPos = box.position.multiply(this.inverseMultiplyVec3D)
        // // let boxPos = box.position
        cube.position.set(boxPos.x, boxPos.y, boxPos.z)

        if (this.options3D.drawBounds) {
            const cubeBoundsFull = this.scene3D.getObjectByName(model.id + '_boundsFull')
            if (cubeBoundsFull) {
                // const boundsFullPos = box.position.multiply(this.inverseMultiplyVec3D)
                // const boundsFullPos = model.boundsFull.position.multiply(this.inverseMultiplyVec3D)
                const boundsFullPos = model.boundsFull.position
                const scaleX = (model.boundsFull.size.x * 2) / cubeBoundsFull.geometry.parameters.width
                const scaleY = (model.boundsFull.size.y * 2) / cubeBoundsFull.geometry.parameters.height
                const scaleZ = (model.boundsFull.size.z * 2) / cubeBoundsFull.geometry.parameters.depth
                cubeBoundsFull.scale.set(scaleX, scaleY, scaleZ)
                // cubeBoundsFull.position.set(model.boundsFull.position.x, model.boundsFull.position.y, model.boundsFull.position.z)
                cubeBoundsFull.position.set(boundsFullPos.x, boundsFullPos.y, boundsFullPos.z)
            }
        }

        if (this.options3D.drawSupports) {
            const supportsGroups = model.supportGroupsAll
            if (supportsGroups.length) {
                supportsGroups.forEach(group => {
                    group.items.forEach((item, index) => {
                        const point = item.point
                        const sphere = this.scene3D.getObjectByName(`${model.id}_supportPoint_${group.name}_${index}`)
                        if (sphere) sphere.position.set(point.x, point.y, point.z)
                    })

                })
            }
        }

        if ((this.options3D.drawWheelAxles) && model.isTop) {

            model.wheelAxles.forEach(axle => {
                // Draw axle
                const axleLine = this.scene3D.getObjectByName(model.id + '_axleLine_' + axle.id)
                if (axleLine) {
                    const positions = axleLine.geometry.attributes.position.array
                    // const newPositions = [...model.absolutePosition.asArray, ...boxPos.asArray]
                    const newPositions = [axle.x, axle.y, boxPos.z - axle.width, axle.x, axle.y, boxPos.z + axle.width]
                    let needUpdate
                    for (const i in newPositions) {
                        if (positions[i] !== newPositions[i]) {
                            needUpdate = true
                            positions[i] = newPositions[i]
                        }
                    }
                    axleLine.geometry.attributes.position.needsUpdate = needUpdate
                } else {
                    const axleLineMaterial = new THREE.LineBasicMaterial({
                        color: 0x2FC24A
                    })
                    const points = []
                    points.push(new THREE.Vector3(axle.x, axle.y, boxPos.z + -axle.width))
                    points.push(new THREE.Vector3(axle.x, axle.y, boxPos.z + axle.width))

                    const axleLineGeometry = new THREE.BufferGeometry().setFromPoints(points)

                    const axleLine = new THREE.Line(axleLineGeometry, axleLineMaterial)

                    axleLine.name = model.id + '_axleLine_' + axle.id
                    this.scene3D.add(axleLine)
                }

                // Draw wheels
                for (let i = 0; i < 2; i++) {

                    const z = i > 0 ? -axle.width : axle.width

                    const wheelMesh = this.scene3D.getObjectByName(`${model.id}_wheelMesh${i}_${axle.id}`)
                    if (wheelMesh) {
                        if (axle.needUpdate) {
                            this.scene3D.remove(wheelMesh)
                        }
                        // const positions = wheelCircle.geometry.attributes.position.array
                        // // const newPositions = [...model.absolutePosition.asArray, ...boxPos.asArray]
                        // const newPositions = [axle.x, axle.y + 300, -axle.width, axle.x, axle.y + 300, axle.width]
                        // let needUpdate
                        // for (const i in newPositions) {
                        //     if (positions[i] !== newPositions[i]) {
                        //         needUpdate = true
                        //         positions[i] = newPositions[i]
                        //     }
                        // }
                        // wheelCircle.geometry.attributes.position.needsUpdate = needUpdate
                        wheelMesh.position.set(axle.x, axle.y, boxPos.z + z)
                    } else {
                        const wheelCircleMaterial = new THREE.MeshPhongMaterial({
                            color: 0x26282a,
                            opacity:0.9,
                            transparent:true
                        })
                        const wheelGeometry = new THREE.CylinderGeometry( axle.radius, axle.radius, 200,  64 )
                        const wheelMesh = new THREE.Mesh(wheelGeometry, wheelCircleMaterial)
                        wheelMesh.position.set(axle.x, axle.y, boxPos.z + z)
                        wheelMesh.rotation.x = Math.PI/2

                        wheelMesh.name = `${model.id}_wheelMesh${i}_${axle.id}`
                        this.scene3D.add(wheelMesh)
                    }

                }

                if (axle.needUpdate) {
                    axle.needUpdate = null
                }
            })

        }

        if (graphicOptions.drawCenters) {
            const centersLine = this.scene3D.getObjectByName(model.id + '_centersLine')
            if (centersLine) {
                // console.log([...model.position.asArray, ...boxPos.asArray]);
                // centersLine.geometry.attributes.position.array = [...model.position.asArray, ...boxPos.asArray]
                const positions = centersLine.geometry.attributes.position.array
                // const newPositions = [...model.position.asArray, ...boxPos.asArray]
                const newPositions = [...model.absolutePosition.asArray, ...boxPos.asArray]
                // const newPositions = [...model.position.asArray, ...model.content.position.asArray]
                let needUpdate
                for (const i in newPositions) {
                    if (positions[i] !== newPositions[i]) {
                        needUpdate = true
                        positions[i] = newPositions[i]
                    }

                }
                centersLine.geometry.attributes.position.needsUpdate = needUpdate
            } else {
                const centersLineMaterial = new THREE.LineBasicMaterial({
                    color: 0xffff00
                })

                const points = []
                points.push(new THREE.Vector3(model.position.x, model.position.y, model.position.z))
                // points.push( new THREE.Vector3( boxPos.x, boxPos.y, boxPos.z ) )
                points.push(new THREE.Vector3(model.content.position.x, model.content.position.y, model.content.position.z))

                const centersLineGeometry = new THREE.BufferGeometry().setFromPoints(points)

                const centersLine = new THREE.Line(centersLineGeometry, centersLineMaterial)

                centersLine.name = model.id + '_centersLine'
                this.scene3D.add(centersLine)
            }
            // const points = [];
            // points.push( new THREE.Vector3( model.position.x, model.position.y, model.position.z) );
            // points.push( new THREE.Vector3( boxPos.x, boxPos.y, boxPos.z ) )

            // const centersLineGeometry = new THREE.BufferGeometry().setFromPoints( points );

            // var centersLine = new THREE.Line( centersLineGeometry, centersLineMaterial );
            // this.scene3D.add(centersLine)
        }





        model.childs.forEach(one => this.renderModel3D(one, topModel))
    }

    // renderPhysicObject3D_(model) {
    //
    //
    //     const graphicOptions = {}
    //
    //     const world = model.getWorldMatrix()
    //     const inv = world.inverse()
    //
    //     const box = model.content
    //
    //     const boxSize = box.size //.multiply(this.scale)
    //     const boxPos = box.position.multiply(this.inverseMultiplyVec3D)
    //
    //     const cube = this.scene3D.getObjectByName(physicObjectPos.id)
    //
    //     if (!cube) return
    //
    //     // console.log('a');
    //
    //
    //     const rotation = physicObjectPos.rotation ? physicObjectPos.rotation : null
    //
    //     // if (rotation) {
    //     //     cube.translateX(boxPos.x + boxSize.x / 2)
    //     //     cube.rotation.z = -degToRad(rotation.y)
    //     //     cube.translateX(-(boxPos.x + boxSize.x / 2))
    //     //     // console.log(physicObjectPos);
    //     //     cube.position.set(boxPos.x + boxSize.x / 2, boxPos.z + boxSize.z / 2, boxPos.y + boxSize.y / 2)
    //     //     // cube.rotation.z += -degToRad(0.1)
    //     // } else {
    //     //     cube.position.set(boxPos.x + boxSize.x / 2, boxPos.z + boxSize.z / 2, boxPos.y + boxSize.y / 2)
    //     // }
    //
    //     cube.position.set(boxPos.x, boxPos.y, boxPos.z)
    // }

    renderScene3D_(scene) {

        if (scene.needUpdate) {
            const obj_ids = scene.objects.map(one => one.id)
            this.scene3D.children.forEach(one => {
                if (one.name && !obj_ids.includes(one.name)) {
                    one.toRemove = true
                }
            })

            const toRemove = this.scene3D.children.filter(one => one.toRemove)
            toRemove.forEach(one => {
                this.scene3D.remove(one)
                this.scene3D.children.forEach(child => {
                    if (child.name.includes(one.name)) this.scene3D.remove(child)
                })
            })
            scene.needUpdate = false
        }

        scene.objects.forEach(model => {
            if (model.parent) return
            this.renderModel3D(model)
        })

        this.renderer3D.render(this.scene3D, this.camera3D)
    }

}
