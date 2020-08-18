import {Vector2} from './Vector2'
import {Matrix2} from './Matrix2'

export class Geometry2D {
    constructor(props) {
        this.deviation = 1 / (props ? (props.round || 1000) : 1000)

        this.degToRad = (deg) => {
            return deg / 180 * Math.PI
        }
        this.radToDeg = (rad) => {
            return rad / Math.PI * 180
        }

        // this.pointOnLine = (point, line) => {
        //     return line.pointOnLine(point);
        // };

        // this.pointInCircle = (point, circle) => {
        //     return circle.pointInCircle(point);
        // };

        // this.pointInRectangle = (point, rectangle) => {
        //     return rectangle.pointInRectangle(point);
        // };

        // this.pointInOrientedRectangle = (point, rectangle) => {
        //     const rotVector = point.subtract(rectangle.position);
        //     const theta = -this.degToRad(rectangle.rotation);
        //     const zRotation2x2 = new Matrix2(
        //         Math.cos(theta), Math.sin(theta),
        //         -Math.sin(theta), Math.cos(theta)
        //     );
        //     const rotVector_m = rotVector.getMatrix().multiply(zRotation2x2);
        //     // Multiply(rotVector.asArray,
        //     //     vec2(rotVector.x, rotVector.y).asArray,
        //     //     1, 2, zRotation2x2, 2, 2);
        //
        //     const localRectangle = new Rectangle2D(new Point2D(), rectangle.halfExtents * 2);
        //     const localPoint = new Point2D(...rotVector_m.asArray).add(rectangle.halfExtents);
        //     return this.pointInRectangle(localPoint, localRectangle);
        // };

        this.lineCircle = (line, circle) => {
            const ab = line.end.subtract(line.start)
            let t = circle.position.subtract(line.start).dot(ab) / ab.dot(ab)
            // const t = Dot(c.position - l.start, ab) / Dot(ab, ab);
            // if (t < 0 || t > 1) {
            //     return false;
            // }
            t = Math.max(t, 0) // Clamp to 0
            t = Math.min(t, 1) // Clamp to 1

            const closestPoint = line.start.add(ab.multiplyS(t))

            const circleToClosest = new Line2D(circle.position, closestPoint)
            return (circleToClosest.lengthSq() < circle.radius * circle.radius)
        }

        this.lineRectangle = (l, r) => {
            if (r.pointInRectangle(l.start) ||
                r.pointInRectangle(l.end)) {
                return true
            }
            const norm = l.end.subtract(l.start).normalize()
            norm.x = (norm.x !== 0) ? 1 / norm.x : 0
            norm.y = (norm.y !== 0) ? 1 / norm.y : 0
            const min = r.getMin().subtract(l.start).multiply(norm)
            const max = r.getMax().subtract(l.start).multiply(norm)

            const tmin = Math.max(
                Math.min(min.x, max.x),
                Math.min(min.y, max.y)
            )
            const tmax = Math.min(
                Math.max(min.x, max.x),
                Math.max(min.y, max.y)
            )
            if (tmax < 0 || tmin > tmax) {
                return false
            }
            const t = (tmin < 0) ? tmax : tmin
            return t > 0 && t * t < l.lengthSq()
        }

        this.lineOrientedRectangle = (line, rectangle) => {
            const theta = -this.degToRad(rectangle.rotation)

            const zRotation2x2 = new Matrix2(
                Math.cos(theta), Math.sin(theta),
                -Math.sin(theta), Math.cos(theta)
            )


            let rotVector = line.start.subtract(rectangle.position)
            let rotVector_m = rotVector.getMatrix().multiply(zRotation2x2)
            const start = new Point2D(...rotVector_m.asArray).add(rectangle.halfExtents)

            rotVector = line.end.subtract(rectangle.position)
            rotVector_m = rotVector.getMatrix().multiply(zRotation2x2)
            const end = new Point2D(...rotVector_m.asArray).add(rectangle.halfExtents)
            const localRectangle = new Rectangle2D(new Point2D(), rectangle.halfExtents.multiplyS(2))
            const localLine = new Line2D(start, end)

            return this.lineRectangle(localLine, localRectangle)
        }

        this.circleCircle = (c1, c2) => {
            const line = new Line2D(c1.position, c2.position)
            const radiiSum = c1.radius + c2.radius

            return line.lengthSq() <= radiiSum * radiiSum
        }

        this.circleRectangle = (circle, rect) => {
            const min = rect.getMin()
            const max = rect.getMax()

            let closestPoint = circle.position

            let x, y

            // if (closestPoint.x < min.x) {
            //             //     x = min.x;
            //             // } else if (closestPoint.x > max.x) {
            //             //     x = max.x;
            //             // }
            //             //
            //             // if (closestPoint.y < min.y) {
            //             //     y = min.y;
            //             // } else if (closestPoint.y > max.y) {
            //             //     y = max.y;
            //             // }

            x = (closestPoint.x < min.x) ? min.x :
                ((closestPoint.x > max.x) ? max.x : closestPoint.x)
            y = (closestPoint.y < min.y) ? min.y :
                ((closestPoint.y > max.y) ? max.y : closestPoint.y)


            closestPoint = new Point2D(x, y)

            const line = new Line2D(circle.position, closestPoint)
            ctx.beginPath()
            ctx.moveTo(line.start.x, line.start.y)
            ctx.lineTo(line.end.x, line.end.y)
            ctx.stroke()
            ctx.closePath()
            return line.lengthSq() <= circle.radius * circle.radius
        }

        this.circleOrientedRectangle = (circle, rect) => {
            const r = circle.position.subtract(rect.position)
            const theta = -this.degToRad(rect.rotation)

            const zRotation2x2 = new Matrix2(
                Math.cos(theta), Math.sin(theta),
                -Math.sin(theta), Math.cos(theta)
            )
            const r_ = r.getMatrix().multiply(zRotation2x2)
            const lCircle = new Circle(new Point2D(...r_.asArray).add(rect.halfExtents), circle.radius)
            const lRect = new Rectangle2D(new Point2D(), rect.halfExtents.multiplyS(2))
            return this.circleRectangle(lCircle, lRect)
        }

        this.rectangleRectangle = (rect1, rect2) => {
            const aMin = rect1.getMin()
            const aMax = rect1.getMax()
            const bMin = rect2.getMin()
            const bMax = rect2.getMax()

            const overX = ((bMin.x <= aMax.x) && (aMin.x <= bMax.x))
            const overY = ((bMin.y <= aMax.y) && (aMin.y <= bMax.y))

            return overX && overY
        }

        this.rectangleRectangleSAT = (rect1, rect2) => {
            const axisToTest = [new Vector2(1, 0), new Vector2(0, 1)]

            var intervalInstance = new Interval2D()
            for (let i = 0; i < 2; ++i) {
                // Intervals don't overlap,seperating axis found
                if (!intervalInstance.overlapOnAxis(rect1, rect2, axisToTest[i])) {
                    return false // No collision has taken place
                }
            }
            // All intervals overlapped, seperating axis not found
            return true // We have a collision
        }

        this.rectangleOrientedRectangle = (rect1, rect2) => {
            const axisToTest = new Matrix2(
                new Vector2(1, 0), new Vector2(0, 1),
                new Vector2(), new Vector2()
            )

            let t = this.degToRad(rect2.rotation)
            const zRot = new Matrix2(
                Math.cos(t), Math.sin(t),
                -Math.sin(t), Math.cos(t)
            )
            let axis = new Vector2(rect2.halfExtents.x, 0).normalize()
            axisToTest._21 = new Vector2(...axis.getMatrix().multiply(zRot).asArray)

            axis = new Vector2(0, rect2.halfExtents.y).normalize()
            axisToTest._22 = new Vector2(...axis.getMatrix().multiply(zRot).asArray)
            const intervalInstance = new Interval2D()
            for (let i = 0; i < 4; ++i) {
                if (!intervalInstance.overlapOnAxis(rect1, rect2, axisToTest.asArray[i])) {
                    return false // No collision has taken place
                }
            }
            return true // We have a collision

        }

        this.orientedRectangleOrientedRectangle = (r1, r2) => {
            const local1 = new Rectangle2D(new Point2D(), r1.halfExtents.multiplyS(2))
            const r = r2.position.subtract(r1.position)

            let rotation = r2.rotation - r1.rotation
            let t = -this.degToRad(r1.rotation)
            const z = new Matrix2(
                Math.cos(t), Math.sin(t),
                -Math.sin(t), Math.cos(t)
            )

            const r_ = new Vector2(...r.getMatrix().multiply(z).asArray)
            let position = r_.add(r1.halfExtents)

            const local2 = new OrientedRectangle(position, r2.halfExtents, rotation)
            return this.rectangleOrientedRectangle(local1, local2)
        }

        this.containingCircle = (pArray) => {
            if (!pArray.length) return new Circle(null, 0)
            let center = new Point2D()
            pArray.forEach(one_point => {
                center = center.add(one_point)
            })
            center = center.multiplyS(1 / pArray.length)
            let radius = center.subtract(pArray[0]).magnitudeSq()

            pArray.forEach(one_point => {
                const distance = center.subtract(one_point).magnitudeSq()
                if (distance > radius) {
                    radius = distance
                }
            })
            radius = Math.sqrt(radius)
            return new Circle(center, radius)
        }

        this.containingRectangle = (pArray) => {
            if (!pArray.length) return new Rectangle2D(null, new Vector2(0, 0))
            const min = pArray[0]
            const max = pArray[0]

            pArray.forEach(one_point => {
                min.x = one_point.x < min.x ? one_point.x : min.x
                min.y = one_point.y < min.y ? one_point.y : min.y
                max.x = one_point.x > max.x ? one_point.x : max.x
                max.y = one_point.y > max.y ? one_point.y : max.y
            })
            const rectInstance = new Rectangle2D()
            return rectInstance.fromMinMax(min, max)
        }
    }
}

export const getHypotenuse = (a, b) => {
    return Math.sqrt(a * a + b * b)
}

export const getAngleRightTriangle = (a, c) => {
    return Math.asin(a / c)
}

export class Point2D extends Vector2 {
    constructor(x, y) {
        super(x, y)

    }
}

export class Line2D {
    constructor(start, end) {
        this.start = start || new Point2D()
        this.end = end || new Point2D()

        this.deviation = 1

    }

    length() {
        return this.end.subtract(this.start).magnitude()
        // return this.end.magnitude(this.start);
    }

    lengthSq() {
        return this.end.subtract(this.start).magnitudeSq()
        // return this.end.magnitudeSq(this.start);
    }

    pointOnLine(point) {
        // Find the slope
        const dy = (this.end.y - this.start.y)
        const dx = (this.end.x - this.start.x)
        if (!dx) {
            return this.start.x === point.x
        }
        const M = dy / dx
        const B = this.start.y - M * this.start.x
        const diff = Math.abs(point.y - (M * point.x + B))
        console.log('diff', diff)
        return (diff < this.deviation)
    };

}

export class Circle {
    constructor(position, radius) {
        this.position = position || new Point2D()
        this.radius = radius || 1
    }

    pointInCircle(point) {
        const line = new Line2D(point, this.position)
        return (line.lengthSq() < this.radius * this.radius)
    };
}

export class Rectangle2D {
    constructor(origin, size) {
        this.origin = origin || new Point2D()
        this.size = size || new Vector2(50, 50)

        this.degToRad = (deg) => {
            return deg / 180 * Math.PI
        }
        this.radToDeg = (rad) => {
            return rad / Math.PI * 180
        }

        this.fromMinMax = (min, max) => {
            return new Rectangle2D(min, max.subtract(min))
        }
    }


    getMin() {
        let p1 = this.origin.add(this.size)
        let p2 = this.origin.subtract(this.size)

        return new Vector2(Math.min(p1.x, p2.x), Math.min(p1.y, p2.y))
    }

    getMax() {
        let p1 = this.origin.add(this.size)
        let p2 = this.origin.subtract(this.size)

        return new Vector2(Math.max(p1.x, p2.x), Math.max(p1.y, p2.y))
    }

    pointInRectangle(point) {
        const min = this.getMin()
        const max = this.getMax()

        return min.x <= point.x &&
            min.y <= point.y &&
            point.x <= max.x &&
            point.y <= max.y
    };

}

export class OrientedRectangle extends Rectangle2D {
    constructor(center = new Point2D(), halfExtents = new Vector2(), rotation = 0) {
        super(new Point2D(center.x - halfExtents.x, center.y - halfExtents.y), new Vector2(halfExtents.x + halfExtents.x, halfExtents.y + halfExtents.y))
        this.position = center || new Point2D()
        this.halfExtents = halfExtents || new Vector2(1, 1)
        this.rotation = rotation || 0
    }

    pointInRectangle(point) {
        const rotVector = point.subtract(this.position)
        const theta = -this.degToRad(this.rotation)
        const zRotation2x2 = new Matrix2(
            Math.cos(theta), Math.sin(theta),
            -Math.sin(theta), Math.cos(theta)
        )
        const rotVector_m = rotVector.getMatrix().multiply(zRotation2x2)

        const localRectangle = new Rectangle2D(new Point2D(), this.halfExtents.multiplyS(2))
        const localPoint = new Point2D(...rotVector_m.asArray).add(this.halfExtents)
        return localRectangle.pointInRectangle(localPoint)
    };
}

export class Interval2D {
    constructor(min, max) {
        this.min = min || 0
        this.max = max || 0

        this.degToRad = (deg) => {
            return deg / 180 * Math.PI
        }
        this.radToDeg = (rad) => {
            return rad / Math.PI * 180
        }

        this.getIntervalRect = (rect, axis) => {
            const min = rect.getMin()
            const max = rect.getMax()

            let verts = [
                new Vector2(min.x, min.y), new Vector2(min.x, max.y),
                new Vector2(max.x, max.y), new Vector2(max.x, min.y)
            ]
            let min_ = axis.dot(verts[0])
            let max_ = min_

            for (let i = 1; i < 4; ++i) {
                let projection = axis.dot(verts[i])
                if (projection < min_) {
                    min_ = projection
                }
                if (projection > max_) {
                    max_ = projection
                }
            }
            return new Interval2D(min_, max_)

        }

        this.getIntervalOrientedRect = (rect, axis) => {

            const r = new Rectangle2D(new Point2D(rect.position.subtract(rect.halfExtents)), rect.halfExtents.multiplyS(2))

            const min = r.getMin()
            const max = r.getMax()

            let verts = [
                min, max,
                new Vector2(min.x, max.y), new Vector2(max.x, min.y)
            ]
            const t = this.degToRad(rect.rotation)
            const zRot = new Matrix2(
                Math.cos(t), Math.sin(t),
                -Math.sin(t), Math.cos(t)
            )

            for (let i = 0; i < 4; ++i) {
                const r_ = verts[i].subtract(rect.position)
                const m = r_.getMatrix().multiply(zRot)
                verts[i] = new Point2D(...m.asArray).add(rect.position)
            }

            let min_ = axis.dot(verts[0])
            let max_ = min_

            for (let i = 1; i < 4; ++i) {
                let projection = axis.dot(verts[i])
                if (projection < min_) {
                    min_ = projection
                }
                if (projection > max_) {
                    max_ = projection
                }
            }
            return new Interval2D(min_, max_)

        }

        this.getInterval = (rect, axis) => {
            if (rect instanceof Rectangle2D) return this.getIntervalRect(rect, axis)
            if (rect instanceof OrientedRectangle) return this.getIntervalOrientedRect(rect, axis)
            throw 'Неизвестный тип прямоугольника'
        }

        this.overlapOnAxis = (rect1, rect2, axis) => {
            const a = this.getInterval(rect1, axis)
            const b = this.getInterval(rect2, axis)
            return ((b.min <= a.max) && (a.min <= b.max))
        }

    }


}

export class BoundingShape {
    constructor(circles, rectangles) {
        this.circles = circles || []
        this.rectangles = rectangles || []
    }

    pointInShape(point) {
        for (let i1 in this.circles) {
            if (this.circles[i1].pointInCircle(point)) return true
        }
        for (let i2 in this.rectangles) {
            if (this.rectangles[i2].pointInRectangle(point)) return true
        }
        return false

    }

}


