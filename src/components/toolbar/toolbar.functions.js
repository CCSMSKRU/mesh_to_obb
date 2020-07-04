import {$} from '@core/jquery.extends'
// import * as THREE from '~/three/build/three.module.js';
// import * as THREE from 'three/build/three.module';

export function loadMesh(){
    const input = $.create('input').attr({
        type:'file',
        name:'meshFile'
    })
    input.click()

    const _t = this
    input.on('change', e => {
        var file = e.target.files[0]
        this.$emit('toolbar:loadMesh', {file})
    })
}
