import {GraphicEngine} from '@core/physicEngine/GraphicEngine'
import {Vector3} from '@core/physicEngine/geometry/Vector3'

export class PhysicEngine extends GraphicEngine {
    constructor(obj) {
        super(obj)
    }

    // moveAndCheck(scene, technicalModel, platformModel, options = {}){
    //     const startOnObject = technicalModel.checkOn(platformModel)
    //     let lastSuccess = options.lastSuccess
    //     const step = options.stepX || 100
    //
    //     // return false
    //     // Двигаем по X
    //     // const step =
    //     technicalModel.move(new Vector3(step, 0, 0))
    //
    //     const onObject = technicalModel.checkOn(platformModel)
    //
    //     // Столкновение с препядствием по X или сход с платформы
    //     const collisionX = scene.checkCollision(technicalModel) || (startOnObject && !onObject)
    //     if (collisionX) {
    //         // Если наткнулись на рампу, будем подниматься
    //         // if (collisionX.collisions && collisionX.collisions.length === 1 && collisionX.collisions[0].second.isRamp && collisionX.collisions[0].first.isSupport){
    //         //     technicalModel.move(new Vector3(-100, 0, 10))
    //         //     return this.moveAndCheck(scene, technicalModel, platformModel)
    //         // }
    //         if (collisionX.target.isRamp && !options.moveByZ){
    //             technicalModel.move(new Vector3(-step, 50, 0))
    //             return this.moveAndCheck(scene, technicalModel, platformModel, {...options, lastSuccess})
    //         }
    //
    //         // if (startOnObject && !onObject)
    //         if (!onObject) {
    //             // Иначе это провал (если нет LastSuccess)
    //             if (lastSuccess) {
    //                 technicalModel.moveTo(...lastSuccess.position.asArray)
    //                 return options.moveByZ ? false : this.moveAndCheck(scene, technicalModel, platformModel, {...options, lastSuccess, moveByZ:true})
    //                 // return false
    //             }
    //             // console.warn('Временно ставим return false');
    //             // return false
    //             return collisionX
    //         }
    //
    //         //
    //         // technicalModel.move(new Vector3(-step, 0, 0))
    //         // return false
    //
    //
    //
    //         // Иначе отменяем перемещение по X и начинаем двигаться по Z
    //         technicalModel.move(new Vector3(-step, 0, 100))
    //         // Столкновение с препядствием по Z или сход с платформы
    //         const collisionZ = scene.checkCollision(technicalModel) || (startOnObject && !technicalModel.checkOn(platformModel))
    //         if (collisionZ){
    //
    //             // Отменяем движение по Z
    //             technicalModel.move(new Vector3(0, 0, -100))
    //             // и если до этого мы были на платформе, то это успех
    //             if (startOnObject) return false
    //
    //             // Иначе это провал (если нет LastSuccess)
    //             if (lastSuccess) {
    //                 technicalModel.moveTo(...lastSuccess.position.asArray)
    //                 return false
    //             }
    //             return collisionZ
    //         }
    //         // Успешно переместились по Z будем снова пробовать по X
    //         return this.moveAndCheck(scene, technicalModel, platformModel, {...options, lastSuccess})
    //     }
    //
    //     // Возможно мы каким то образом вообще промазали мимо платформы.
    //     // Если пройденное расстояние уже достаточно большое - завершим цикл
    //     if (technicalModel.position.x > 30000){
    //
    //
    //         if (lastSuccess) {
    //             technicalModel.moveTo(...lastSuccess.position.asArray)
    //             return false
    //         }
    //         // console.warn('Временно ставим return false');
    //         // return false
    //         return new MyError('Miss', {pos: technicalModel.position, posPlatform: platformModel.position})
    //     }
    //
    //
    //     // if (technicalModel.position.x > 0){
    //     //     return false
    //     // }
    //
    //     // Если же все ок, то сохраним успешную позицию и попробуем еще дальше сдвинуться по X
    //
    //     if (technicalModel.checkOn(platformModel)){
    //         lastSuccess = {
    //             position:new Vector3(...technicalModel.position.asArray),
    //             rotation:new Vector3(...technicalModel.rotation.asArray)
    //         }
    //         // console.log('lastSuccess', lastSuccess);
    //     }
    //
    //
    //     return this.moveAndCheck(scene, technicalModel, platformModel, {...options, lastSuccess})
    // }
    //
    // placeOn(scene, technicalModel, platformModel){
    //     // Set to start
    //     // technicalModel.moveTo(new Vector3(
    //     //     platformObjectPos.x - physicObjectPos.l - 3000,
    //     //     platformObjectPos.y,
    //     //     platformObjectPos.z
    //     // ))
    //
    //     technicalModel.moveTo(
    //         // platformModel.boundsFull.position.x - (platformModel.boundsFull.size.x * 2) - 3000,
    //         // platformModel.boundsFull.position.x - (platformModel.boundsFull.size.x) - (technicalModel.boundsFull.size.x * 2),
    //         platformModel.boundsFull.position.x - (platformModel.boundsFull.size.x) - (technicalModel.boundsFull.size.x) - 2000,
    //         null,
    //         platformModel.boundsFull.position.z - platformModel.boundsFull.size.z + technicalModel.boundsFull.size.z
    //     )
    //
    //
    //     // Move X, check, if collision unmove and move Y. while collisionX && collisionY && onPlatform. Then restore last success
    //     const oldPosition = new Vector3(
    //         technicalModel.position.x,
    //         technicalModel.position.y,
    //         technicalModel.position.z
    //     )
    //     const collision = this.moveAndCheck(scene, technicalModel, platformModel)
    //     if (collision){
    //         technicalModel.moveTo(oldPosition)
    //         return collision
    //     }
    //
    //     // move by Z
    //
    //     return collision
    //     // return false
    // }






}
