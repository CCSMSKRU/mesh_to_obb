/*
 * Complex Cloud Solutions, LLC (ccs.msk.ru)
 * Ivan Goptarev
 * Copyright (c) 2020.
 */

import './scss/index.scss'
import 'material-design-lite'
import {App} from '@/components/app/App'
import {Header} from '@/components/header/Header'
import {Toolbar} from '@/components/toolbar/Toolbar'
import {Tree} from '@/components/tree/Tree'
import {RenderContainer} from '@/components/renderContainer/RenderContainer'
import {Options} from '@/components/options/Options'
import {Content} from '@/components/content/Content'
import 'bootstrap';
import * as toastr from 'toastr'

// toastr.options // https://codeseven.github.io/toastr/demo.html
toastr.options = {
    "positionClass": "toast-bottom-right"
}

const app = new App('#app', {
    components: [Header, Toolbar, Content, Tree, RenderContainer, Options]
})

app.init()
app.render()
app.projectInit()
