/*
 * Complex Cloud Solutions, LLC (ccs.msk.ru)
 * Ivan Goptarev
 * Copyright (c) 2020.
 */

import {Component} from '@core/Component'
import {createTree} from '@/components/tree/tree.template'

export class Tree extends Component {
    static className = 'app__tree'

    constructor($root, options) {
        super($root, {
            name: 'Tree',
            listeners: [],
            ...options
        })
        this.wrapperSelector = '.app__content'
    }

    init() {
        // const topNode = new TreeNode(this.$root, {title:'Model'})
        // this._nodes.push(topNode)

        this.$on('project:loadModel', (e)=>{
            this.render()
        })
    }

    toHTML() {
        const rootNode = this.project.model || []
        const selectedId = this.project.selectedModel? this.project.selectedModel.id : null
        console.log('rootNode', rootNode);
        return createTree(rootNode, {selectedId})
    }
}
