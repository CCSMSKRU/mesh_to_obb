import {Component} from '@core/Component'
import {$} from '@core/dom'
import {loadMesh} from '@/components/toolbar/toolbar.functions'
import {createButton, createInput, createItems} from '@core/template.functions'

export class Toolbar extends Component {
    static className = 'app__toolbar'

    constructor($root, options) {
        super($root, {
            name: 'Toolbar',
            listeners: ['click'],
            ...options
        })

    }

    prepare() {
        this.btns = [
            {
                name: 'loadMesh',
                icon: 'add',
                action:loadMesh
            }
        ]
    }

    init() {
        super.init()

        this.$on('toolbar:loadMesh', (e)=>{
            this.render({loading:true})
        })

        this.$on('project:loadMeshUrl', (e)=>{
            this.render()
        })

    }


    toHTML(options = {}) {
        const dataType = `data-type="button"`

        const loading = options.loading? 'Loading...' : ''

        const meshName = this.project.meshFile? this.project.meshFile.name : 'Mesh not loaded'

        const blocks = {
            toolbar1: {
                func: createButton,
                options: {
                    datas: [
                        'data-type="toolbar_button"',
                        'data-category="toolbar1"',
                    ],
                },
                items: [
                    {
                        name: 'loadMesh',
                        icon: 'add',
                        action: loadMesh
                    },
                    {
                        name: 'loadProject',
                        icon: 'input'
                    },
                    {
                        name: 'saveProject',
                        icon: 'save'
                    },
                    {
                        name: 'downloadProject',
                        icon: 'get_app'
                    }
                ]
            }
        }

        return `<div class="toolbar__mesh-name">${loading || meshName}</div>
                    ${createItems(blocks.toolbar1)}`
    }

    onClick(e){
        const $target = $(e.target)
        if ($target.data.type !== 'toolbar_button') return

        if ($target.data.category === 'toolbar1'){
            if ($target.data.name === 'loadMesh') loadMesh.call(this, e)
            if ($target.data.name === 'loadProject') this.$emit('toolbar:loadProject')
            if ($target.data.name === 'saveProject') this.$emit('toolbar:saveProject')
            if ($target.data.name === 'downloadProject') this.$emit('toolbar:downloadProject')
        }

    }

}
