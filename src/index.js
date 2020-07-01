/*
 * Complex Cloud Solutions, LLC (ccs.msk.ru)
 * Ivan Goptarev
 * Copyright (c) 2020.
 */

import './scss/index.scss'
// import '../node_modules/material-design-lite/material.min.js'
import {App} from '@/components/app/App'
import {Header} from '@/components/header/Header'
import {Toolbar} from '@/components/toolbar/Toolbar'
import {Tree} from '@/components/tree/Tree'
import {RenderContainer} from '@/components/renderContainer/RenderContainer'
import {Options} from '@/components/options/Options'
import {Content} from '@/components/content/Content'


const app = new App('#app', {
    components: [Header, Toolbar, Content, Tree, RenderContainer, Options]
})

app.init()
app.render()
app.projectInit()
