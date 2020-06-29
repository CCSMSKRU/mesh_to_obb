import {PhysicEngine} from '@core/physicEngine/PhysicEngine'

export const init3D = (options = {}) => {
    const pEngine = new PhysicEngine({
            ...{
                container: '.container-3D',
                optionsXY: {
                    width: 800,
                    height: 300,
                    css: {
                        backgroundColor: 'rgba(0,0,0,0.03)',
                        border: '1px solid'
                    }
                },
                optionsXZ: {
                    width: 800,
                    height: 300,
                    css: {
                        backgroundColor: 'rgba(0,0,0,0.03)',
                        border: '1px solid'
                    }
                },
                options3D: {
                    width: 1000,
                    height: 600,
                    css: {
                        backgroundColor: 'rgba(203,231,255,0.45)',
                        // border: '1px solid'
                    },
                    axesHelper: true,
                    // drawBounds: true,
                }
            },
            ...options
        }
    )


    return pEngine

}
