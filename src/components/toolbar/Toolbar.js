import {Component} from '@core/Component'
import {$} from '@core/dom'
import {loadMesh} from '@/components/toolbar/toolbar.functions'

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

        return `
            <div class="toolbar__mesh-name">${loading || meshName}</div>
            ${this.btns.map(btn=>{
                return `
                    <div class="button" 
                        ${dataType}
                        data-name="${btn.name}"
                    >
                        <i class="material-icons" 
                            ${dataType}
                            data-name="${btn.name}"
                        >${btn.icon}</i>
                    </div>`
            }).join('')}
        `
        //
        // return this.btns.map(btn=>{
        //     return `
        //         <div class="button"
        //             ${dataType}
        //             data-name="${btn.name}"
        //         >
        //             <i class="material-icons"
        //                 ${dataType}
        //                 data-name="${btn.name}"
        //             >${btn.icon}</i>
        //         </div>`
        // }).join('')

    }

    onClick(e){
        const $target = $(e.target)
        if ($target.data.type === 'button'){
            const btn = this.btns.filter(btn=>btn.name === $target.data.name)[0]
            if (btn && typeof btn.action === 'function') btn.action.call(this, e)
        }
    }

}
