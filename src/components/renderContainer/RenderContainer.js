import {Component} from '@core/Component'
import {init3D} from '@/components/renderContainer/renderContainer.init3D'

export class RenderContainer extends Component {
    static className = 'app__renderContainer'

    constructor($root, options) {
        super($root, {
            name: 'RenderContainer',
            listeners: [],
            ...options
        })
        this.wrapperSelector = '.app__content'
    }

    init() {
        super.init()

        this.pEngine = init3D({container:this.$root})
        this.pEngine.init3D()
        // this.project.scene = this.pEngine.createScene()
        // this.pEngine.renderScene3D(this.project.scene)


        this.$on('project:loadProject', (e)=>{
            this.pEngine.stopRenderScene3D()
            this.project.scene = this.pEngine.createScene()
            this.pEngine.clear3DScene()
            console.log('this.project.scene',this.project.scene.objects);
            console.log('this.pEngine.scene3D',this.pEngine.scene3D.children);

            this.pEngine.renderScene3D(this.project.scene)
        })

        this.$on('project:loadModel', (e)=>{
            // this.project.scene.clear()
            // this.pEngine.clear3DScene()
            this.project.scene.addModel(this.project.model)
            // this.pEngine.addModelTo3D(this.project.model)
        })

        this.$on('project:loadMeshModel', (e)=>{
            this.project.scene.addModel(this.project.meshModel)
            this.pEngine.addModelTo3D(this.project.meshModel)
        })
    }

    toHTML() {



        return `
            <div>
               Loading...
            </div>
        `
    }
}
