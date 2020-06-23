import {Component} from '@core/Component'

export class TreeNode extends Component {
    static className = 'app__tree-node'

    constructor($root, options = {}) {
        super($root, {
            name: 'TreeNode',
            listeners: [],
            ...options
        })

        this.parent = options.parent

    }

    destroy() {
        super.destroy()
        this.parent = undefined
    }

    toHTML() {
        return `
            <div>
                Node
            </div>
        `
    }
}
