import {Component} from '@core/Component'
import {$} from '@core/jquery.extends'
import {loadMesh} from '@/components/toolbar/toolbar.functions'
import {createItems} from '@core/template.functions'
import {getBlocks} from '@/components/toolbar/toolbar.blocks'
import * as bootbox from 'bootbox'

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
                action: loadMesh
            }
        ]
    }

    init() {
        super.init()

        this.$on('toolbar:loadMesh', (e) => {
            this.render({loading: true})
        })

        this.$on('project:loadMeshUrl', (e) => {
            this.render()
        })

    }


    toHTML(options = {}) {
        const blocks = getBlocks(this.project, options)

        return `<div class="toolbar__label">
                    <div class="label">Project:</div>
                    ${createItems(blocks.project)}
                </div>
                <div class="toolbar__label">
                    ${createItems(blocks.projectJSON)}
                </div>
                <div class="toolbar__label">
                    <div class="label">Mesh:</div>
                    ${createItems(blocks.meshInput)}
                    ${createItems(blocks.meshBtns)}
                </div>`
    }

    onClick(e) {
        const $target = $(e.target)
        if ($target.data('type') !== 'toolbar_button') return

        if ($target.data('category') === 'project') {
            if ($target.data('name') === 'newProject') {
                bootbox.confirm({
                    title: "New Project",
                    message: "All unsaved data will be lost. Are you sure?",
                    callback: (res) => {
                        if (res) this.$emit('toolbar:newProject')
                    }
                })
            } else {
                this.$emit(`toolbar:${$target.data('name')}`)
            }

            // if ($target.data('name') === 'loadProject') this.$emit('toolbar:loadProject')
            // if ($target.data('name') === 'saveProject') this.$emit('toolbar:saveProject')
            // if ($target.data('name') === 'downloadProject') this.$emit('toolbar:downloadProject')
            // if ($target.data('name') === 'uploadProject') this.$emit('toolbar:uploadProject')
        } else if ($target.data('category') === 'mesh') {
            if ($target.data('name') === 'loadMesh') loadMesh.call(this, e)
            if ($target.data('name') === 'removeMesh') this.$emit('toolbar:removeMesh')
        }

    }

}
