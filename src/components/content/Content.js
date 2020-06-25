/*
 * Complex Cloud Solutions, LLC (ccs.msk.ru)
 * Ivan Goptarev
 * Copyright (c) 2020.
 */

import {Component} from '@core/Component'
import {$} from '@core/dom'
import {loadMesh} from '@/components/toolbar/toolbar.functions'

export class Content extends Component {
    static className = 'app__content'

    constructor($root, options) {
        super($root, {
            name: 'Content',
            listeners: [],
            ...options
        })

    }

    toHTML(options = {}) {
        return ``
    }
}
