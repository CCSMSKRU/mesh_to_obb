import {Component} from '@core/Component'

export class Header extends Component {
    static className = 'app__header'

    constructor($root, options) {
        super($root, {
            name: 'Header',
            listeners: [],
            ...options
        })

    }

    // init(){
    //     super.init()
    //
    //     this.$on('toolbar:loadMesh', (e)=>{
    //         console.log('e.file',e)
    //     })
    // }

    toHTML() {


        return `
            <input type="text" class="input" value="${this.project.name}">
            <div>

                <div class="button"><i class="material-icons">delete</i></div>
                <div class="button"><i class="material-icons">exit_to_app</i></div>
            </div>
        `
    }
}
