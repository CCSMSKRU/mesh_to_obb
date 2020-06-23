import {Component} from '@core/Component'

export class Toolbar extends Component {
    static className = 'app__toolbar'

    constructor($root, options) {
        super($root, {
            name: 'Toolbar',
            listeners: [],
            ...options
        })

    }


    toHTML() {
        return `
            <div class="button"><i class="material-icons">format_align_left</i></div>
            <div class="button"><i class="material-icons">format_align_center</i></div>
            <div class="button"><i class="material-icons">format_align_right</i></div>
            <div class="button"><i class="material-icons">format_bold</i></div>
            <div class="button"><i class="material-icons">format_italic</i></div>
            <div class="button"><i class="material-icons">format_underline</i></div>
        `
    }

}
