/*
 * Complex Cloud Solutions, LLC (ccs.msk.ru)
 * Ivan Goptarev
 * Copyright (c) 2020.
 */

import {Component} from '@core/Component'

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
