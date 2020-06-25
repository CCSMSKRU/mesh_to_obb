import {$} from '@core/dom'
// import * as THREE from '~/three/build/three.module.js';
// import * as THREE from 'three/build/three.module';

export function loadMesh(){
    const input = $.create('input').attr({
        type:'file',
        name:'meshFile'
    })
    input.$el.click()

    const _t = this
    input.$el.onchange = e => {
        var file = e.target.files[0]
        // _t.project.meshFile = file
        this.$emit('toolbar:loadMesh', {file})
        // console.log(file)
        // var reader = new FileReader();
        // reader.onload = (r)=>{
        //
        //     this.project.meshUrl = reader.result
        // }
        // reader.onerror = (error)=>{
        //     console.error('error while reading file',error);
        // }
        // reader.readAsDataURL(file);


    }

}
