import {Component} from '@core/Component'
import {$} from '@core/jquery.extends'

export class Header extends Component {
    static className = 'app__header'

    constructor($root, options) {
        super($root, {
            name: 'Header',
            listeners: ['input'],
            ...options
        })

    }

    init(){
        super.init()

        this.$on('project:loadProject', (e) => {
            this.render()
        })
    }

    toHTML() {

        return `
            <input type="text" 
                class="input" 
                value="${this.project.name}"
                data-type="header_input"
                data-name="projectName"
            >
            <div></div>
        `
    }

    onInput(e) {
        const $target = $(e.target)
        if ($target.data('type') !== 'header_input') return

        if ($target.data('name') === 'projectName') return this.$emit('header:changeProjectName',{value:$target.val()})
    }
}
