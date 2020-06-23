import './scss/index.scss'
import {App} from '@/components/app/App'
import {Header} from '@/components/header/Header'
import {Toolbar} from '@/components/toolbar/Toolbar'
import {Tree} from '@/components/tree/Tree'
import {RenderContainer} from '@/components/renderContainer/RenderContainer'


const app = new App('#app', {
    components: [Header, Toolbar, Tree, RenderContainer]
})

app.render()
