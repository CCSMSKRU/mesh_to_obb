import {Component} from '@core/Component'

export class RenderContainer extends Component {
    static className = 'app__renderContainer'

    constructor($root, options) {
        super($root, {
            name: 'RenderContainer',
            listeners: [],
            ...options
        })
    }


    toHTML() {
        return `
            <div>
               renderContainer
            </div>
        `
    }
}
