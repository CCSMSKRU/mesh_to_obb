import {Component} from '@core/Component'
import {TreeNode} from '@/components/tree/TreeNode'

export class Tree extends Component {
    static className = 'app__tree'

    constructor($root, options) {
        super($root, {
            name: 'Tree',
            listeners: [],
            ...options
        })
        this._nodes = []
    }

    init() {
        // const topNode = new TreeNode(this.$root, {title:'Model'})
        // this._nodes.push(topNode)
    }

    toHTML() {
        return `
            <div>
                <h2>Top</h2>
<!--                ${this._nodes.map(node=>node.toHTML)}-->
            </div>
        `
    }
}
