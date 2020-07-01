/*
 * Complex Cloud Solutions, LLC (ccs.msk.ru)
 * Ivan Goptarev
 * Copyright (c) 2020.
 */

import {OBJLoader} from 'three/examples/jsm/loaders/OBJLoader'

export const loadThreeJSModel = (url)=>{

    return new Promise((r, reject)=>{
        const loader = new OBJLoader();
        loader.load(
            // resource URL
            url,
            // called when resource is loaded
            function ( object ) {
                r(object)
            },
            function ( xhr ) {
                console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
            },
            function ( error ) {
                reject(error)
                console.log( 'An error happened', error);
            }
        );

    })

}
