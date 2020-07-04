/*
 * Complex Cloud Solutions, LLC (ccs.msk.ru)
 * Ivan Goptarev
 * Copyright (c) 2020.
 */

import {Component} from '@core/Component'
import {createTree} from '@/components/tree/tree.template'
import {$} from '@core/jquery.extends'

export class Tree extends Component {
    static className = 'app__tree'

    constructor($root, options) {
        super($root, {
            name: 'Tree',
            listeners: ['click'],
            ...options
        })
        this.wrapperSelector = '.app__content'
    }

    init() {
        super.init()
        // const topNode = new TreeNode(this.$root, {title:'Model'})
        // this._nodes.push(topNode)

        // this.$on('project:loadModel', (e)=>{
        //     this.render()
        // })

        this.$on('project:selectModel', (e)=>{
            this.render()
        })

        this.$on('project:changeName', (e)=>{
            this.render()
        })
    }

    toHTML() {
        const rootNode = this.project.model || []
        const selectedId = this.project.selectedModel? this.project.selectedModel.id : null
        return createTree(rootNode, {selectedId})
    }

    onClick(e) {

        const $target = $(e.target)
        if ($target.data('type') !== 'tree-node') return
        this.$emit('tree:selectModel', {value:$target.data('id')})


    }
}
