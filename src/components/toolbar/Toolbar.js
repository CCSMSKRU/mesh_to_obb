import {Component} from '@core/Component'
import {$} from '@core/jquery.extends'
import {generateStateBlock, loadMesh, manageStates, uploadJSONProject} from '@/components/toolbar/toolbar.functions'
import {createItems} from '@core/template.functions'
import {getBlocks} from '@/components/toolbar/toolbar.blocks'
import * as bootbox from 'bootbox'
import {v4 as uuidv4} from 'uuid'

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

        this.$on('model:boundsChange', (e) => {
            const model = e.model
            const modelX = model ? Math.round(model.boundsFull.size.x * 2 * 100) / 100 : 0
            const modelY = model ? Math.round(model.boundsFull.size.y * 2 * 100) / 100 : 0
            const modelZ = model ? Math.round(model.boundsFull.size.z * 2 * 100) / 100 : 0

            this.$root.find('[data-id="boundsFullX"]').text(modelX)
            this.$root.find('[data-id="boundsFullY"]').text(modelY)
            this.$root.find('[data-id="boundsFullZ"]').text(modelZ)

        })

        this.$on('model:selectState', (e) => {
            // const state = e.state
            //
            // const name = state? state.name : 'No state'
            //
            // this.$root.find('[data-id="stateName"]').text(name)


            this.$root.find('[data-id="stateBlock"]').replaceWith(generateStateBlock.call(this))

        })

    }


    toHTML(options = {}) {
        const blocks = getBlocks(this.project, options)

        console.log('this', this)

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
                </div>
                <div class="toolbar__label">
                    <div class="label" data-id="boundsFullX">0</div>
                    <div class="label" data-id="boundsFullY">0</div>
                    <div class="label" data-id="boundsFullZ">0</div>
                </div>
                ${generateStateBlock.call(this)}
`
    }

    onClick(e) {
        const $target = $(e.target)
        if ($target.data('type') !== 'toolbar_button') return

        if ($target.data('category') === 'project') {

            if ($target.data('name') === 'copyProject') {
                return this.$emit('toolbar:copyProject', {})
            }

            if ($target.data('name') === 'uploadProject') {
                return uploadJSONProject.call(this, e)
            }

            if ($target.data('name') === 'uploadProjectFromJSON') {

                var id = uuidv4()
                bootbox.dialog({
                    title: 'Type a JSON with project or model',
                    message: '<label>JSON:</label><textarea id="jsonContainer_'+ id +'"></textarea>',
                    buttons: {
                        success: {
                            label: 'Load',
                            callback: ()=>{

                                this.$emit('toolbar:uploadJSONProject', {json: $('#jsonContainer_' + id).val()})

                            }
                        },
                        error: {
                            label: 'Close',
                            callback: function(){

                            }
                        }
                    }
                });

                return
            }

            if ($target.data('name') === 'newProject') {
                bootbox.confirm({
                    title: "New Project",
                    message: "All unsaved data will be lost. Are you sure?",
                    callback: (res) => {
                        if (!res) return
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
            if ($target.data('name') === 'loadMesh') return loadMesh.call(this, e)

            if ($target.data('name') === 'removeMesh') this.$emit('toolbar:removeMesh')
        } else if ($target.data('category') === 'state') {
            this.$emit(`toolbar:${$target.data('name')}`)
        }

    }

}
