import {AABB, Point3D, radToDeg, Ray} from '@core/physicEngine/geometry/Geometry3D'
import {Vector3} from '@core/physicEngine/geometry/Vector3'
import {checkCollision2Objects} from '@core/physicEngine/Scene/scene.collision'
import {isError} from '@core/error'
import {Matrix3} from '@core/physicEngine/geometry/Matrix3'
import {v1 as uuidv1} from "uuid"

export class Scene {
    constructor(props) {

        this._objects = []
        this.octree = null

        this.querySizeVec = new Vector3(100, 100, 100)

        this.isFlyingLengthMax = 50
    }

    get objects() {
        return this._objects
    }

    getModel(id) {
        return this._objects.filter(one => one.id === id)[0] || null
    }

    addModel(model) {
        if (!model) return
        if (!this._objects.includes(model)) this._objects.push(model)
        if (model.childs) model.childs.forEach(one => this.addModel(one))
    }

    removeModel(model) {
        if (!model) return
        // model.removed = true
        // model.setGraphicOption('needUpdate', true)
        // this.clear()
        this.needUpdate = true
        if (model.childs) model.childs.forEach(one => this.removeModel(one))
        this._objects = this._objects.filter(one => one !== model)
    }

    clear(excludes = []) {
        if (!Array.isArray(excludes)) excludes = []
        this._objects.forEach(obj => {
            if (excludes.includes(obj)) return
            this.removeModel(obj)
        })
        this.cleared = true
    }

    updateModel(model) {
        if (!model) return
        this.removeModel(model)
        this.addModel(model)
    }

    findChildren(model) {
        const children = []
        for (const one of this._objects) {
            const parent = one.parent
            if (!parent) continue
            if (parent === model) {
                children.push(one)
                continue
            }

        }
        console.error('МЕТОД НЕДОПИСАН')
        return children
    }

    raycast(ray) {
        if (this.octree) {
            return this.octree.raycast(ray)
        }

        let result
        let result_t = -1
        for (const one of this._objects) {
            const t = one.raycast(ray)
            if (!result && t >= 0) {
                result = one
                result_t = t
            } else if (result && t < result_t) {
                result = one
                result_t = t
            }

        }
        return result

    }

    query(primitiv, objects_) {
        if (this.octree) {
            return this.octree.query(primitiv)
        }

        const objects = objects_ || this._objects
        return objects.filter(one => {
            const collisionBoundsFull = primitiv.aabbIn(one.boundsFull)
            if (!collisionBoundsFull) return

            const bounds = one.getOBB()
            return (primitiv.obbIn(bounds))
        })
    }

    accelerate(position, size = 0) {
        if (!this.octree) return false
        const min = new Vector3(position.x - size, position.y - size, position.z - size)
        const max = new Vector3(position.x + size, position.y + size, position.z + size)
        const octree = new OctreeNode()
        octree.bounds = AABB.fromMinMax(min, max)
        this._objects.forEach(oneObj => {
            octree.models.push(oneObj)
        })
        splitTree(octree, 5)
        return true
    }

    checkCollision(model) {

        // Здесь сперва можно делать query исключать себя и своих детей и делать сравнение только с остальными объектами попавшими в query
        const qAABB = new AABB(model.boundsFull.position, model.boundsFull.size.add(this.querySizeVec))
        const objects = this.query(qAABB, this._objects.filter(one => one.topModelId !== model.id))

        // const objects = this._objects.filter(one=>one.topModelId !== model.id)

        for (const object of objects) {
            let collisions = checkCollision2Objects(model, object)

            if (!collisions) continue

            // console.log(collisions, object);

            if (!model.materialColorOrig) model.materialColorOrig = model.graphicOptions.materialColor
            if (!object.materialColorOrig) object.materialColorOrig = object.graphicOptions.materialColor

            model.setGraphicOption('materialColor', '#ffafb9', false)
            object.setGraphicOption('materialColor', '#e09aa3', false)

            setTimeout(()=>{
                if (model.materialColorOrig) model.setGraphicOption('materialColor', model.materialColorOrig, false)
                if (object.materialColorOrig) object.setGraphicOption('materialColor', object.materialColorOrig, false)
            }, 2000)

            return {
                self: model,
                target: object,
                collisions
            }
        }
    }

    // moveAndCheck(technicalModel, platformModel, options = {}) {
    //     const startOnObject = technicalModel.checkOn(platformModel)
    //     if (isError(startOnObject)) return startOnObject
    //     let lastSuccess = options.lastSuccess
    //     const step = options.stepX || 100
    //
    //     // return false
    //     // Двигаем по X
    //     // const step =
    //     technicalModel.move(new Vector3(step, 0, 0))
    //
    //     let onObject = technicalModel.checkOn(platformModel)
    //     if (isError(onObject)) return onObject
    //     // console.log('onObject', onObject)
    //
    //     // Столкновение с препядствием по X или сход с платформы
    //     const collisionX = this.checkCollision(technicalModel) || (startOnObject && !onObject)
    //     if (collisionX) {
    //         // Если наткнулись на рампу, будем подниматься
    //         // console.log('collisionX', collisionX)
    //         if (typeof collisionX === 'object'
    //             && ((collisionX.target.isRamp && !collisionX.target.isSteepRamp) || (collisionX.target.isRamp && collisionX.target.isSteepRamp && collisionX.self.canUseSteepRamp))
    //             && !options.moveByZ)
    //         {
    //
    //             // Реакция опоры (внутри нее вызов гравитации)
    //             const r = this.applySupportReaction(technicalModel, platformModel, {collision: collisionX})
    //             return false
    //             if (r === 1) return false
    //             technicalModel.move(new Vector3(-step, 50, 0))
    //             return this.moveAndCheck(technicalModel, platformModel, {...options, lastSuccess})
    //         }
    //
    //         // if (startOnObject && !onObject)
    //         if (!onObject) {
    //             // Иначе это провал (если нет LastSuccess)
    //             if (lastSuccess) {
    //                 technicalModel.moveTo(...lastSuccess.position.asArray)
    //                 return options.moveByZ
    //                     ? false
    //                     : this.moveAndCheck(technicalModel, platformModel, {...options, lastSuccess, moveByZ: true})
    //                 // return false
    //             }
    //             // TMP
    //             return false
    //             // TMP
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
    //         // Иначе отменяем перемещение по X и начинаем двигаться по Z
    //         technicalModel.move(new Vector3(-step, 0, 100))
    //         // Столкновение с препядствием по Z или сход с платформы
    //         onObject = technicalModel.checkOn(platformModel)
    //         if (isError(onObject)) return onObject
    //
    //         const collisionZ = this.checkCollision(technicalModel) || (startOnObject && !onObject)
    //         if (collisionZ) {
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
    //         return this.moveAndCheck(technicalModel, platformModel, {...options, lastSuccess})
    //     }
    //
    //     // Возможно мы каким то образом вообще промазали мимо платформы.
    //     // Если пройденное расстояние уже достаточно большое - завершим цикл
    //     if (technicalModel.position.x > 30000) {
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
    //     // Если же все ок, то сохраним успешную позицию и попробуем еще дальше сдвинуться по X
    //     onObject = technicalModel.checkOn(platformModel)
    //     if (isError(onObject)) return onObject
    //     if (onObject) {
    //         lastSuccess = {
    //             position: new Vector3(...technicalModel.position.asArray),
    //             rotation: new Vector3(...technicalModel.rotation.asArray)
    //         }
    //         // console.log('lastSuccess', lastSuccess);
    //     }
    //
    //
    //     return this.moveAndCheck(technicalModel, platformModel, {...options, lastSuccess})
    // }

    // moveAndCheck(technicalModel, platformModel, options = {}) {
    //     const startOnObject = technicalModel.checkOn(platformModel)
    //     if (isError(startOnObject)) return startOnObject
    //     let lastSuccess = options.lastSuccess
    //     const step = options.stepX || 200
    //
    //
    //
    //     // return false
    //
    //     // return false
    //     // Двигаем по X
    //     // const step =
    //     technicalModel.move(new Vector3(step, 0, 0))
    //     this.applySupportReaction(technicalModel, platformModel, {})
    //
    //     let onObject = technicalModel.checkOn(platformModel)
    //     if (isError(onObject)) return onObject
    //     // console.log('onObject', onObject)
    //
    //     // Столкновение с препядствием по X или сход с платформы
    //     const collisionX = this.checkCollision(technicalModel) || (startOnObject && !onObject)
    //     if (collisionX) {
    //         // Если наткнулись на рампу, будем подниматься
    //         // console.log('collisionX', collisionX)
    //
    //         // if (typeof collisionX === 'object'
    //         //     && (
    //         //         (collisionX.target.isRamp && !collisionX.target.isSteepRamp)
    //         //         || (collisionX.target.isRamp && collisionX.target.isSteepRamp && collisionX.self.canUseSteepRamp)
    //         //     )
    //         //     && !options.moveByZ) {
    //         //
    //         //     // Реакция опоры (внутри нее вызов гравитации)
    //         //     const hasMove = this.applySupportReaction(technicalModel, platformModel, {collision: collisionX})
    //         //     if (hasMove) return this.moveAndCheck(technicalModel, platformModel, options)
    //         //
    //         // }
    //
    //         // if (startOnObject && !onObject)
    //         if (!onObject) {
    //             // Иначе это провал (если нет LastSuccess)
    //             if (lastSuccess) {
    //                 technicalModel.moveTo(...lastSuccess.position.asArray)
    //                 return false
    //                 return options.moveByZ
    //                     ? false
    //                     : this.moveAndCheck(technicalModel, platformModel, {...options, lastSuccess, moveByZ: true})
    //                 // return false
    //             }
    //             // // TMP
    //             // return false
    //             // // TMP
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
    //         // Иначе отменяем перемещение по X и начинаем двигаться по Z
    //         // console.log('ZZZZZZZZZZZZZ')
    //         technicalModel.move(new Vector3(-step, 0, 100))
    //         this.applySupportReaction(technicalModel, platformModel, {})
    //
    //         // Столкновение с препядствием по Z или сход с платформы
    //         onObject = technicalModel.checkOn(platformModel)
    //         if (isError(onObject)) return onObject
    //
    //         const collisionZ = this.checkCollision(technicalModel) || (startOnObject && !onObject)
    //         if (collisionZ) {
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
    //         return this.moveAndCheck(technicalModel, platformModel, {...options, lastSuccess})
    //     }
    //
    //     // Возможно мы каким то образом вообще промазали мимо платформы.
    //     // Если пройденное расстояние уже достаточно большое - завершим цикл
    //     if (technicalModel.position.x > 30000) {
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
    //     // Если же все ок, то сохраним успешную позицию и попробуем еще дальше сдвинуться по X
    //     onObject = technicalModel.checkOn(platformModel)
    //     if (isError(onObject)) return onObject
    //     if (onObject) {
    //         lastSuccess = {
    //             position: new Vector3(...technicalModel.position.asArray),
    //             rotation: new Vector3(...technicalModel.rotation.asArray)
    //         }
    //         // console.log('lastSuccess', lastSuccess);
    //     }
    //
    //
    //     return this.moveAndCheck(technicalModel, platformModel, {...options, lastSuccess})
    // }

    moveAndCheck(technicalModel, platformModel, options = {}) {
        let startOnObject = technicalModel.checkOn(platformModel)
        if (isError(startOnObject)) return startOnObject
        let lastSuccess = options.lastSuccess

        const step = 200
        const stepZ = 100

        const toLastSuccess = () => {
            if (!lastSuccess) return new MyError('lastSuccess не определен')
            technicalModel.moveTo(...lastSuccess.position.asArray)
            technicalModel.rotateTo(...lastSuccess.rotation.asArray)
            return false
        }


        let moveZ, onObject
        for (let i = 0; i < 200; i++) {

            if (!moveZ) {
                // move X
                technicalModel.move(new Vector3(step, 0, 0))
                this.applySupportReaction(technicalModel, platformModel, {})
                onObject = technicalModel.checkOn(platformModel)
                if (isError(onObject)) return onObject
                // Если впервые оказался на платформе, зафиксируем это
                if (!startOnObject && onObject) startOnObject = onObject
                // Проверим не сошел ли с платформы, если был на ней
                if (startOnObject && !onObject) {
                    // Сошел с платформы по X. Отменяем moveX и будем двигаться по Z
                    technicalModel.move(new Vector3(-step, 0, 0))
                    moveZ = true
                    continue
                }
                const collisionX = this.checkCollision(technicalModel)
                if (collisionX) {
                    // Препядствие по X. Отменяем moveX и будем двигаться по Z
                    technicalModel.move(new Vector3(-step, 0, 0))
                    moveZ = true
                    continue
                }
                // Сохраним lastSuccess
                if (onObject) {
                    lastSuccess = {
                        position: new Vector3(...technicalModel.position.asArray),
                        rotation: new Vector3(...technicalModel.rotation.asArray)
                    }
                }
            } else {
                technicalModel.move(new Vector3(0, 0, stepZ))
                this.applySupportReaction(technicalModel, platformModel, {})
                onObject = technicalModel.checkOn(platformModel)
                if (isError(onObject)) return onObject
                // Проверим не сошел ли с платформы, если был на ней
                if (startOnObject && !onObject) {
                    // Сошел с платформы по Z. Переещаем в lastSuccess (если есть) или возврящаем сход
                    if (lastSuccess) {
                        return toLastSuccess()
                    } else {
                        return new MyError('Not on platform', {
                            pos: new Vector3(...technicalModel.position.asArray),
                            posPlatform: new Vector3(...platformModel.position.asArray)
                        })
                    }
                }
                const collisionZ = this.checkCollision(technicalModel)
                if (collisionZ) {
                    // Препядствие по Z. Переещаем в lastSuccess (если есть) или возврящаем коллизию
                    if (lastSuccess) {
                        return toLastSuccess()
                    } else {
                        return collisionZ
                    }
                }
                // Сохраним lastSuccess
                if (onObject) {
                    lastSuccess = {
                        position: new Vector3(...technicalModel.position.asArray),
                        rotation: new Vector3(...technicalModel.rotation.asArray)
                    }
                }
            }
        }


        return new MyError('Miss', {pos: technicalModel.position, posPlatform: platformModel.position})
        // return false

        // // return false
        // // Двигаем по X
        // // const step =
        // technicalModel.move(new Vector3(step, 0, 0))
        // this.applySupportReaction(technicalModel, platformModel, {})
        //
        // let onObject = technicalModel.checkOn(platformModel)
        // if (isError(onObject)) return onObject
        // // console.log('onObject', onObject)
        //
        // // Столкновение с препядствием по X или сход с платформы
        // const collisionX = this.checkCollision(technicalModel) || (startOnObject && !onObject)
        // if (collisionX) {
        //     // Если наткнулись на рампу, будем подниматься
        //     // console.log('collisionX', collisionX)
        //
        //     // if (typeof collisionX === 'object'
        //     //     && (
        //     //         (collisionX.target.isRamp && !collisionX.target.isSteepRamp)
        //     //         || (collisionX.target.isRamp && collisionX.target.isSteepRamp && collisionX.self.canUseSteepRamp)
        //     //     )
        //     //     && !options.moveByZ) {
        //     //
        //     //     // Реакция опоры (внутри нее вызов гравитации)
        //     //     const hasMove = this.applySupportReaction(technicalModel, platformModel, {collision: collisionX})
        //     //     if (hasMove) return this.moveAndCheck(technicalModel, platformModel, options)
        //     //
        //     // }
        //
        //     // if (startOnObject && !onObject)
        //     if (!onObject) {
        //         // Иначе это провал (если нет LastSuccess)
        //         if (lastSuccess) {
        //             technicalModel.moveTo(...lastSuccess.position.asArray)
        //             return false
        //             return options.moveByZ
        //                 ? false
        //                 : this.moveAndCheck(technicalModel, platformModel, {...options, lastSuccess, moveByZ: true})
        //             // return false
        //         }
        //         // // TMP
        //         // return false
        //         // // TMP
        //         // console.warn('Временно ставим return false');
        //         // return false
        //         return collisionX
        //     }
        //
        //     //
        //     // technicalModel.move(new Vector3(-step, 0, 0))
        //     // return false
        //
        //
        //     // Иначе отменяем перемещение по X и начинаем двигаться по Z
        //     // console.log('ZZZZZZZZZZZZZ')
        //     technicalModel.move(new Vector3(-step, 0, 100))
        //     this.applySupportReaction(technicalModel, platformModel, {})
        //
        //     // Столкновение с препядствием по Z или сход с платформы
        //     onObject = technicalModel.checkOn(platformModel)
        //     if (isError(onObject)) return onObject
        //
        //     const collisionZ = this.checkCollision(technicalModel) || (startOnObject && !onObject)
        //     if (collisionZ) {
        //
        //         // Отменяем движение по Z
        //         technicalModel.move(new Vector3(0, 0, -100))
        //         // и если до этого мы были на платформе, то это успех
        //         if (startOnObject) return false
        //
        //         // Иначе это провал (если нет LastSuccess)
        //         if (lastSuccess) {
        //             technicalModel.moveTo(...lastSuccess.position.asArray)
        //             return false
        //         }
        //         return collisionZ
        //     }
        //     // Успешно переместились по Z будем снова пробовать по X
        //     return this.moveAndCheck(technicalModel, platformModel, {...options, lastSuccess})
        // }
        //
        // // Возможно мы каким то образом вообще промазали мимо платформы.
        // // Если пройденное расстояние уже достаточно большое - завершим цикл
        // if (technicalModel.position.x > 30000) {
        //
        //
        //     if (lastSuccess) {
        //         technicalModel.moveTo(...lastSuccess.position.asArray)
        //         return false
        //     }
        //     // console.warn('Временно ставим return false');
        //     // return false
        //     return new MyError('Miss', {pos: technicalModel.position, posPlatform: platformModel.position})
        // }
        //
        // // Если же все ок, то сохраним успешную позицию и попробуем еще дальше сдвинуться по X
        // onObject = technicalModel.checkOn(platformModel)
        // if (isError(onObject)) return onObject
        // if (onObject) {
        //     lastSuccess = {
        //         position: new Vector3(...technicalModel.position.asArray),
        //         rotation: new Vector3(...technicalModel.rotation.asArray)
        //     }
        //     // console.log('lastSuccess', lastSuccess);
        // }
        //
        //
        // return this.moveAndCheck(technicalModel, platformModel, {...options, lastSuccess})
    }

    // moveAndCheck(technicalModel, platformModel, options = {}) {
    //     const startOnObject = technicalModel.checkOn(platformModel)
    //     if (isError(startOnObject)) return startOnObject
    //     let lastSuccess = options.lastSuccess
    //     const step = options.stepX || 100
    //
    //
    //     this.applySupportReaction(technicalModel, platformModel, {})
    //     // return false
    //
    //     // return false
    //     // Двигаем по X
    //     // const step =
    //     technicalModel.move(new Vector3(step, 0, 0))
    //     this.applySupportReaction(technicalModel, platformModel, {})
    //
    //     let onObject = technicalModel.checkOn(platformModel)
    //     if (isError(onObject)) return onObject
    //     // console.log('onObject', onObject)
    //
    //     // Столкновение с препядствием по X или сход с платформы
    //     const collisionX = this.checkCollision(technicalModel) || (startOnObject && !onObject)
    //     if (collisionX) {
    //         // Если наткнулись на рампу, будем подниматься
    //         // console.log('collisionX', collisionX)
    //         if (typeof collisionX === 'object'
    //             && (
    //                 (collisionX.target.isRamp && !collisionX.target.isSteepRamp)
    //                 || (collisionX.target.isRamp && collisionX.target.isSteepRamp && collisionX.self.canUseSteepRamp)
    //             )
    //             && !options.moveByZ) {
    //
    //             // Реакция опоры (внутри нее вызов гравитации)
    //             const hasMove = this.applySupportReaction(technicalModel, platformModel, {collision: collisionX})
    //             if (hasMove) return this.moveAndCheck(technicalModel, platformModel, options)
    //
    //         }
    //
    //         // if (startOnObject && !onObject)
    //         if (!onObject) {
    //             // Иначе это провал (если нет LastSuccess)
    //             if (lastSuccess) {
    //                 technicalModel.moveTo(...lastSuccess.position.asArray)
    //                 return options.moveByZ
    //                     ? false
    //                     : this.moveAndCheck(technicalModel, platformModel, {...options, lastSuccess, moveByZ: true})
    //                 // return false
    //             }
    //             // TMP
    //             return false
    //             // TMP
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
    //         // Иначе отменяем перемещение по X и начинаем двигаться по Z
    //         technicalModel.move(new Vector3(-step, 0, 100))
    //         // Столкновение с препядствием по Z или сход с платформы
    //         onObject = technicalModel.checkOn(platformModel)
    //         if (isError(onObject)) return onObject
    //
    //         const collisionZ = this.checkCollision(technicalModel) || (startOnObject && !onObject)
    //         if (collisionZ) {
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
    //         return this.moveAndCheck(technicalModel, platformModel, {...options, lastSuccess})
    //     }
    //
    //     // Возможно мы каким то образом вообще промазали мимо платформы.
    //     // Если пройденное расстояние уже достаточно большое - завершим цикл
    //     if (technicalModel.position.x > 30000) {
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
    //     // Если же все ок, то сохраним успешную позицию и попробуем еще дальше сдвинуться по X
    //     onObject = technicalModel.checkOn(platformModel)
    //     if (isError(onObject)) return onObject
    //     if (onObject) {
    //         lastSuccess = {
    //             position: new Vector3(...technicalModel.position.asArray),
    //             rotation: new Vector3(...technicalModel.rotation.asArray)
    //         }
    //         // console.log('lastSuccess', lastSuccess);
    //     }
    //
    //
    //     return this.moveAndCheck(technicalModel, platformModel, {...options, lastSuccess})
    // }

    placeOn(technicalModel, platformModel, params = {}) {

        // debugger

        // // Ставим перед машиной
        // technicalModel.moveTo(
        //     platformModel.boundsFull.position.x - (platformModel.boundsFull.size.x) - (technicalModel.boundsFull.size.x) - 2000,
        //     // platformModel.boundsFull.position.x - (platformModel.boundsFull.size.x) - (technicalModel.boundsFull.size.x) + 10,
        //     // platformModel.content.size.y + technicalModel.boundsFull.size.y,
        //     platformModel.content.size.y,
        //     platformModel.boundsFull.position.z - platformModel.boundsFull.size.z + technicalModel.boundsFull.size.z
        //     // -2000
        // )

        // Ставим перед машиной
        if (!params.skipMoveToStart) {
            technicalModel.moveTo(
                platformModel.boundsFull.position.x - (platformModel.boundsFull.size.x) - (technicalModel.boundsFull.size.x) - 2000,
                // platformModel.boundsFull.position.x - (platformModel.boundsFull.size.x) - (technicalModel.boundsFull.size.x) + 10,
                platformModel.content.size.y + technicalModel.boundsFull.size.y,
                // platformModel.content.size.y + 2000,
                platformModel.boundsFull.position.z - platformModel.boundsFull.size.z + technicalModel.boundsFull.size.z
                // -2000
            )
            this.applySupportReaction(technicalModel, platformModel, {})
        }

        // Move X, check, if collision unmove and move Y. while collisionX && collisionY && onPlatform. Then restore last success
        const oldPosition = new Vector3(
            technicalModel.position.x,
            technicalModel.position.y,
            technicalModel.position.z
        )

        console.time('moveAndCheck')
        const collision = this.moveAndCheck(technicalModel, platformModel)
        console.timeEnd('moveAndCheck')
        if (isError(collision)) return collision

        if (collision) {
            // if (this.pEngine){
            //     setTimeout(()=>{
            //         const dataUrl = this.pEngine.img3D()
            //         console.log('dataUrl', dataUrl)
            //     }, 0)
            //
            // }
            technicalModel.moveTo(oldPosition)
            return collision
        }

        return collision
        // return false
    }

    supportItemRaysDown(item, params = {}) {
        let excludeModels = params.excludeModel
            ? Array.isArray(params.excludeModel)
                ? params.excludeModel
                : [params.excludeModel]
            : []


        excludeModels = [...excludeModels, ...excludeModels.map(one => one.getAllChilds()).flat()]

        const objects = params.model ? [params.model] : this.objects

        const raysDown = []
        const rayDown = new Ray(new Vector3(item.point.x, item.point.y, item.point.z), new Vector3(0, -1, 0))
        objects.forEach(object => {
            if (!object || !object.raycast) return
            if (excludeModels.includes(object)) return

            const raycast = object.raycast(rayDown)
            if (raycast) raysDown.push({object, raycast})
        })
        return raysDown
    }

    supportItemRaysUp(item, params = {}) {
        let excludeModels = params.excludeModel
            ? Array.isArray(params.excludeModel)
                ? params.excludeModel
                : [params.excludeModel]
            : []


        excludeModels = [...excludeModels, ...excludeModels.map(one => one.getAllChilds()).flat()]

        const objects = params.model ? [params.model] : this.objects

        const raysUp = []
        const rayUp = new Ray(new Vector3(item.point.x, item.point.y, item.point.z), new Vector3(0, 1, 0))
        objects.forEach(object => {
            if (!object || !object.raycast) return
            if (excludeModels.includes(object)) return

            const raycast = object.raycast(rayUp)
            if (raycast) raysUp.push({object, raycast})
        })
        return raysUp
    }

    supportItemRays(items, technicalModel, params = {}) {

        const raysDownParams = params.raysDown || {}
        const raysUpParams = params.raysUp || {}

        items.forEach(item => {
            // Пройтись по всем моделям на сцене и заустить в них райкаст вниз.
            // Выбрать самый близкий
            // Если нет, то расстояние до земли (до 0)
            item.raysDown = this.supportItemRaysDown(item, {
                ...raysDownParams,
                excludeModel: raysDownParams.excludeModel || technicalModel
            })
            item.isFlyingLength = item.raysDown.length
                ? Math.round(Math.min(...item.raysDown.map(one => Math.min(one.raycast.t, one.raycast.t2))))
                : Math.round(+item.point.y)

            item.isFlying = item.isFlyingLength > this.isFlyingLengthMax

            // Пройтись по всем моделям на сцене и заустить в них райкаст вверх.
            // Выбрать самый дальний и поднять модель на это расстояние
            item.raysUp = this.supportItemRaysUp(item, {
                ...raysUpParams,
                excludeModel: raysUpParams.excludeModel || technicalModel
            })
            // Второе условие позволяет считать что точка "внутри тела", если точко проходит очеень близко под моделью.
            // То есть как бы увеличиваются границы модеи с которой идет пересечение.
            // Это помогает, не пропустить точку касания рампы и земли, когда шаг вперед слишком большой и сама точка
            // касания остается между двумя шагами
            const isInBodyArr = item.raysUp
                .filter(one => (one.raycast.t > 0 && one.raycast.t2 < 0) || (one.raycast.t > 0 && one.raycast.t <= 200))
                .map(one => Math.max(one.raycast.t, one.raycast.t2)) // t2 будет больше если проходим слегка под моделью
            item.isInBodyLength = isInBodyArr.length
                ? Math.round(Math.max(...isInBodyArr))
                : 0

            item.isInBody = item.isInBodyLength && item.isInBodyLength > 0
        })
    }

    calcSupportReaction(items, step) {

        items
        // Будем игнорировать тела, которые не являются опорой или рампой (isPlatform || isRamp)
            .filter(item => !item.isInBody || item.raysUp
                .filter(one => one.raycast
                    && one.raycast.hit
                    && (one.object.isPlatform || one.object.isRamp)
                ).length)
            .forEach(item => {
                item.supportReaction = !item.isInBody && !item.isFlying
                    ? 0
                    : item.isInBody
                        ? step < item.isInBodyLength ? step : item.isInBodyLength
                        : step < item.isFlyingLength ? -step : -item.isFlyingLength
            })
    }

    /**
     * Возвращает true если было пременено перемещение. И false если все ок
     * @param technicalModel
     * @param platformModel
     * @param params
     * @returns {null|boolean|number}
     */
    applySupportReaction(technicalModel, platformModel, params = {}) {

        let needRecursion = true

        // if (!window.tm) window.tm = technicalModel

        const deep1 = params.deep1 || 0

        let isMove

        for (let i = 0; i <6; i++) {
            if (!needRecursion) return false
            needRecursion = false

            // console.log('applySupportReaction iteration', i)
            if (!isMove && i > 0) isMove = true

            // Вытолкним из земли
            let items = technicalModel.supportGroupsAll.map(gr => gr.items).flat()

            if (!items.length) return null

            // Move from underground
            const minY = Math.min(...items.map(one => one.point.y))
            if (minY < 0) {
                technicalModel.move(new Vector3(0, Math.abs(minY), 0))
                needRecursion = true
            }

            this.supportItemRays(items, technicalModel)

            // Теперь будем падать на землю или на препятствия
            // Пока не коснемся хотя бы одной точкой
            let step = (this.isFlyingLengthMax / 2)

            if (i > 10 && step - (i - 10) > 0) step -= (i - 10)

            // Опустим на поверхность
            const minFlying = Math.round(Math.min(...items.map(one => one.isFlyingLength)))
            if (minFlying > this.isFlyingLengthMax) {
                // step = minFlying > 100 ? Math.round(minFlying / 2) : minFlying
                technicalModel.move(new Vector3(0, -minFlying, 0))
                needRecursion = true
                items.forEach(item => {
                    item.isFlyingLength -= minFlying
                    item.isFlying = item.isFlyingLength > this.isFlyingLengthMax
                })
            }

            // Определим реакцию опоры. Если точка летает, то отрицательная (гравитация)
            this.calcSupportReaction(items, step)
            let noReactionItems = items.filter(one => !one.supportReaction)

            // Если все точки имеют реакцию опоры (ни одна не стоит на поверхности)
            if (!noReactionItems.length) {
                // Теперь поднимим модель если какие-то точки находятся внутри другой модели
                const maxInBody = Math.round(
                    Math.max(
                        ...items
                            .filter(item => item.isInBody && item.raysUp
                                .filter(one => one.raycast
                                    && one.raycast.hit
                                    && (one.object.isPlatform || one.object.isRamp)
                                ).length)
                            .map(one => one.isInBodyLength)
                    )
                )
                if (maxInBody > 0) {
                    // technicalModel.move(new Vector3(0, step, 0))
                    technicalModel.move(new Vector3(0, maxInBody, 0))
                    needRecursion = true
                    items.forEach(item => {
                        item.isFlyingLength += step
                        item.isInBodyLength -= step
                        item.isFlying = item.isFlyingLength > this.isFlyingLengthMax
                        item.isInBody = item.isInBodyLength > 0
                    })
                }

                this.calcSupportReaction(items, step)
                noReactionItems = items.filter(one => !one.supportReaction)
            }


            const needRotate = !!items.filter(one => one.supportReaction && one.supportReaction !== 0).length
            const center = technicalModel.centerOfMass || technicalModel.position

            if (needRotate) {
                let alphaSum = 0

                items.filter(one => one.supportReaction).forEach(item => {
                    const supportReactionVec = new Vector3(0, item.supportReaction, 0)

                    const leverVec = item.point.subtract(center)
                    const perpendicularVec = new Vector3(-leverVec.y, leverVec.x, 0)

                    const rotate = supportReactionVec.dot(perpendicularVec) / perpendicularVec.magnitude()

                    const alpha = Math.atan2(rotate, leverVec.magnitude())
                    item.alpha = alpha
                    alphaSum += alpha

                })


                const alphaSumDeg = alphaSum ? Math.round(radToDeg(alphaSum) * 1000000) / 1000000 : null
                if (alphaSumDeg/* && Math.abs(alphaSumDeg) > 0.0001*/) {

                    // console.log('rotate', alphaSumDeg)

                    // technicalModel.rotateZ(alphaSumDeg)

                    const matAlpha = new Matrix3().rotationZ(alphaSumDeg)


                    const selfOrient = technicalModel.getOBB().orientation
                    const newOrient = selfOrient.multiply(matAlpha)
                    const newOrientVector = newOrient.decomposeYawPitchRoll().round(5)

                    // console.log(`Angle (deg): ${alphaSumDeg}; selfOrient: ${selfOrient.decomposeYawPitchRoll().asArray}; newOrient: ${newOrientVector.asArray}; `)

                    // const itemsNotReaction =
                    let maxXItemNotReaction
                    noReactionItems.forEach(one => {
                        if (!maxXItemNotReaction) {
                            maxXItemNotReaction = one
                            return
                        }
                        if (Math.abs(one.point.x) > Math.abs(maxXItemNotReaction.point.x)) maxXItemNotReaction = one
                    })
                    const oldPos = maxXItemNotReaction ? new Vector3(...maxXItemNotReaction.point.asArray) : null

                    technicalModel.rotateTo(newOrientVector)

                    if (maxXItemNotReaction) {
                        items = technicalModel.supportGroupsAll.map(gr => gr.items).flat()
                        this.supportItemRays(items, technicalModel)

                        const maxXItemNotReactionNew = items.filter(one => one.id && one.id === maxXItemNotReaction.id)[0]
                        const newPos = maxXItemNotReactionNew ? new Vector3(...maxXItemNotReactionNew.point.asArray) : null
                        // if (oldPos && newPos) console.log('Position diff =', newPos.subtract(oldPos).asArray)
                        if (oldPos && newPos) {
                            // console.log('Position diff =', oldPos.asArray, newPos.asArray, newPos.subtract(oldPos).asArray)
                            const diff = newPos.subtract(oldPos)
                            technicalModel.move(new Vector3(-diff.x, -diff.y, 0))
                        }
                    }

                    // const newPos = maxXItemNotReaction ? new Vector3(...maxXItemNotReaction.asArray) : null
                    // if (oldPos && newPos) console.log('Position diff =', newPos.subtract(oldPos).asArray)
                    needRecursion = true
                }
            }

        }

        return isMove
    }


    /**
     * savePosition for each object
     * @param platformModel
     * @param params
     */
    savePositionAll(platformModel, params = {}){
        // Для каждого объекта на сцене (не платформы) сохранит позиции
        const rollback_key = uuidv1();
        this.objects.forEach(technicalModel => {
            if (technicalModel === platformModel) return
            if (!technicalModel.isTop()) return
            technicalModel.rollbacks[rollback_key] = {
                position: new Vector3(...technicalModel.position.asArray),
                rotation: new Vector3(...technicalModel.rotation.asArray)
            }
        })
        return rollback_key
    }

    /**
     * savePosition for each object
     * @param platformModel
     * @param rollback_key
     * @param params
     */
    loadPositionAll(platformModel, rollback_key, params = {}){
        // Для каждого объекта на сцене (не платформы) сохранит позиции
        this.objects.forEach(technicalModel => {
            if (technicalModel === platformModel) return
            if (!technicalModel.isTop()) return

            const saved = technicalModel.rollbacks[rollback_key]
            if (!saved){
                throw new MyError('technicalModel.rollbacks[rollback_key] is not defined', {rollback_key, technicalModel})
            }
            technicalModel.moveTo(...saved.position.asArray)
            technicalModel.rotateTo(...saved.rotation.asArray)
        })
    }

    /**
     * applySupportReaction for each object
     * @param platformModel
     * @param params
     */
    applySupportReactionAll(platformModel, params = {}){
        // Для каждого объекта на сцене (не платформы) просчитаем рейкасты и определим _checkOnAlias
        // (если еще не был установлен)
        this.objects.forEach(technicalModel => {
            if (technicalModel === platformModel) return
            if (!technicalModel.isTop()) return

            this.applySupportReaction(technicalModel, platformModel)
        })
    }

    /**
     * Fix checkOnAlias for each object
     * @param platformModel
     * @param params
     */
    isNotCheckOnAll(platformModel, params = {}){
        // Для каждого объекта на сцене (не платформы) просчитаем рейкасты и определим _checkOnAlias
        // (если еще не был установлен)
        const notOns = []
        this.objects.forEach(technicalModel => {
            if (technicalModel === platformModel) return
            if (!technicalModel.isTop()) return
            // if (typeof technicalModel._checkOnAlias !== "undefined") return

            let items = technicalModel.supportGroupsAll.map(gr => gr.items).flat()
            if (!items.length) return null
            this.supportItemRays(items, technicalModel)
            this.calcSupportReaction(items, 10)
            const isOn = technicalModel.checkOn()
            if (!isOn) notOns.push(technicalModel)
        })
        return notOns.length? notOns : false
    }

    /**
     * Check what after change State of transport all equipment keep their positions on the platform
     * @param platformModel
     * @param params
     */
    isChangedCheckOn(platformModel, params = {}){

        const beforeCheckOnAliasFull = this.objects.map(one=>one._checkOnAlias || '').join('')

        // Для каждого объекта на сцене (не платформы) обновим рейкасты, чтобы сравнить изменилось ли что то или нет
        this.objects.forEach(technicalModel => {
            if (technicalModel === platformModel) return
            if (!technicalModel.isTop()) return

            let items = technicalModel.supportGroupsAll.map(gr => gr.items).flat()
            if (!items.length) return null
            this.supportItemRays(items, technicalModel)
            this.calcSupportReaction(items, 10)
            technicalModel.checkOn()
        })



        const afterCheckOnAliasFull = this.objects.map(one=>one._checkOnAlias || '').join('')

        // console.log('\n', beforeCheckOnAliasFull, '\n', afterCheckOnAliasFull, '\nisChanged:', beforeCheckOnAliasFull !== afterCheckOnAliasFull)

        return beforeCheckOnAliasFull !== afterCheckOnAliasFull
    }

    /**
     * checkCollision for each object
     * @param platformModel
     * @param params
     */
    checkCollisionAll(platformModel, params = {}){
        // Для каждого объекта на сцене (не платформы) просчитаем рейкасты и определим _checkOnAlias
        // (если еще не был установлен)
        let collisions = []
        this.objects.forEach(technicalModel => {
            if (technicalModel === platformModel) return
            if (!technicalModel.isTop()) return

            const collision = this.checkCollision(technicalModel)
            if (collision) collisions.push(collision)
        })

        return collisions.length? collisions : false
    }

    destroy() {
        this.pEngine = undefined
    }


}


class OctreeNode {
    constructor(props) {

        this.bounds = null
        this.children = null
        this.models = []

    }

    insert(model) {
        const bounds = model.getOBB()
        if (this.bounds.obbIn(bounds)) {
            if (!this.children) {
                this.models.push(model)
            } else {
                this.children.forEach(child => {
                    child.insert(model)
                })
            }
        }
    }

    remove(model) {
        if (!this.children) {
            this.models = this.models.filter(one => one !== model)
        } else {
            this.children.forEach(child => {
                child.remove(model)
            })
        }
    }

    update(model) {
        this.remove(model)
        this.insert(model)
    }

    findClosest(models = [], ray) {
        if (!models.length) return 0
        let closest
        let closest_t = -1
        models.forEach(model => {
            const t = model.raycast(ray)
            if (t < 0) return
            if (closest_t < 0 || t < closest_t) {
                closest_t = t
                closest = model
            }
        })

        return closest
    }

    raycast(ray) {
        const t = this.bounds.raycast(ray)
        if (t >= 0) {
            if (!this.children) {
                return this.findClosest(this.models, ray)
            } else {
                const models = this.children.map(child => {
                    return child.raycast(ray)
                }).filter(one => one !== 0)
                return this.findClosest(models)
            }
        }

        return 0
    }

    query(primitiv) {

        let results = []
        if (primitiv.aabbIn(this.bounds)) {
            if (!this.children) {
                results = this.models.filter(model => {
                    const bounds = model.getOBB()
                    return (primitiv.obbIn(bounds))
                })
            } else {
                this.children.forEach(child => {
                    const childs = child.query(primitiv)
                    if (childs.length) {
                        results = [...results, ...childs]
                    }
                })
            }
        }
        return results

    }

}

const splitTree = (node, depth = 0) => {
    if (depth-- <= 0) return

    if (!node.children) {
        node.children = new Array(8).fill(new OctreeNode())

        const c = node.bounds.position
        const e = node.bounds.size.multiplyS(0.5)

        node.children[0].bounds = new AABB(c.add(new Vector3(-e.x, +e.y, -e.z)), e)
        node.children[1].bounds = new AABB(c.add(new Vector3(+e.x, +e.y, -e.z)), e)
        node.children[2].bounds = new AABB(c.add(new Vector3(-e.x, +e.y, +e.z)), e)
        node.children[3].bounds = new AABB(c.add(new Vector3(+e.x, +e.y, +e.z)), e)
        node.children[4].bounds = new AABB(c.add(new Vector3(-e.x, -e.y, -e.z)), e)
        node.children[5].bounds = new AABB(c.add(new Vector3(+e.x, -e.y, -e.z)), e)
        node.children[6].bounds = new AABB(c.add(new Vector3(-e.x, -e.y, +e.z)), e)
        node.children[7].bounds = new AABB(c.add(new Vector3(+e.x, -e.y, +e.z)), e)
    }

    if (node.children && node.models.length) {
        node.children.forEach(child => {
            child.models.forEach(model => {
                const bounds = model.getOBB()
                if (child.bounds.obbIn(bounds)) child.models.push(model)
            })
        })
        node.models = []

        node.children.forEach(child => {
            splitTree(child, depth)
        })
    }
}
