/*
 * Complex Cloud Solutions, LLC (ccs.msk.ru)
 * Ivan Goptarev
 * Copyright (c) 2020.
 */

import {Component} from '@core/Component'
import {createOptions} from '@/components/options/options.template'

export class Options extends Component {
    static className = 'app__options'

    constructor($root, options) {
        super($root, {
            name: 'Options',
            listeners: [],
            ...options
        })
        this.wrapperSelector = '.app__content'
    }

    init() {
        // this.$on('project:loadModel', (e)=>{
        //     this.render()
        // })
    }

    toHTML() {

        const model = this.project.selectedModel
        const data = {
            model
        }
        const options = {
            opacity:this.project.options.model.opacity
        }
        return createOptions(data, options)

    }
}
