import { Matrix3x3, Vector2D, Vector3D } from "./types.js";

export enum RotateAxis{
    X_AXIS = "x_axis",
    Y_AXIS = "Y_axis",
    Z_AXIS = "Z_axis",
}

class EngineMath{
    public toPixel(x: number, y: number, width: number, height :number) : Vector2D;
    public toPixel(point: Vector2D, canvasSize: Vector2D) : Vector2D;

    public toPixel(a: any, b: any, c?: number, d?: number): Vector2D {

        if (a instanceof Vector2D && b instanceof Vector2D) {
            return this.toPixel(a.x, a.y, b.x, b.y);
        }

        const x = a as number;
        const y = b as number;
        const width = c as number;
        const height = d as number;

        const ndcX = (x + 1) * 0.5 * width;
        const ndcY = (1 - y) * 0.5 * height;

        return new Vector2D(ndcX, ndcY);
    }

    public project(cameraRotation: Vector3D, cameraPosition: Vector3D, x: number, y: number, z:number) : Vector2D | null;
    public project(cameraRotation: Vector3D, cameraPosition: Vector3D, point: Vector3D) : Vector2D | null;

    public project(cameraRotation: Vector3D, cameraPosition: Vector3D, a: number | Vector3D, b?: number, c?: number) : Vector2D | null{
        if(a instanceof Vector3D){
            return this.project(cameraRotation, cameraPosition, a.x, a.y, a.z);
        }

        const x = a as number;
        const y = b as number;
        const z = c as number;
        let relative = new Vector3D(
            x - cameraPosition.x,
            y - cameraPosition.y,
            z - cameraPosition.z
        );

        const yaw = cameraRotation.y * Math.PI / 180;
        const pitch = cameraRotation.x * Math.PI / 180;
            
        const forward = new Vector3D(
            Math.cos(pitch) * Math.sin(yaw),
            -Math.sin(pitch),
            Math.cos(yaw) * Math.cos(pitch)
        ).normalize();
        
        const right = new Vector3D(
            Math.cos(yaw),
            0,
            -Math.sin(yaw)
        ).normalize();
        
        const up = forward.cross(right).normalize();


        {      
            const x = relative.dot(right);  
            const y = relative.dot(up);  
            const z = relative.dot(forward);  

            const NEAR_PLANE = 0.1;
            
            if(z <= NEAR_PLANE)
                return null;

            return new Vector2D(
                x/z,
                y/z
            )
        }
    }

    public rotate(axis: RotateAxis, point: Vector3D, angle: number, center?: Vector3D){

        const realCenter = center ?? new Vector3D(0,0,0);

        let result: Vector3D;

        switch(axis){
            case RotateAxis.X_AXIS:
                result = this.rotateAroundX(point, realCenter, angle);
            break;
            case RotateAxis.Y_AXIS:
                result = this.rotateAroundY(point, realCenter, angle);
            break;
            case RotateAxis.Z_AXIS:
                result = this.rotateAroundZ(point, realCenter, angle);
            break;
            default:
                throw new Error(`Provided invalid parameter ${axis}.`);
            break;
        }

        return result;
    }

    private rotateX(point: Vector3D, angle: number): Vector3D{
        const rotationSignature = [
            [1, 0, 0],
            [0, Math.cos(angle), -Math.sin(angle)],
            [0, Math.sin(angle), Math.cos(angle)]
        ];

        const rotationMatrix: Matrix3x3 = new Matrix3x3(rotationSignature);

        return rotationMatrix.multiply3DVector(point);
    }
    private rotateY(point: Vector3D, angle: number){
      const rotationSignature = [
            [Math.cos(angle), 0, Math.sin(angle) ],
            [   0,            1,         0        ],
            [-Math.sin(angle), 0, Math.cos(angle)  ]
        ];

        const rotationMatrix: Matrix3x3 = new Matrix3x3(rotationSignature);

        return rotationMatrix.multiply3DVector(point);
    }
    private rotateZ(point: Vector3D, angle: number){
        const rotationSignature = [
            [Math.cos(angle), -Math.sin(angle), 0],
            [Math.sin(angle), Math.cos(angle), 0],
            [0, 0, 1]
        ];

        const rotationMatrix: Matrix3x3 = new Matrix3x3(rotationSignature);

        return rotationMatrix.multiply3DVector(point);
    }

    private rotateAroundX(point: Vector3D, center: Vector3D, angle: number){
        let result = point.subtract(center);

        result = this.rotateX(result, angle);

        return result.add(center);
    }

    private rotateAroundY(point: Vector3D, center: Vector3D, angle: number){
        let result = point.subtract(center);

        result = this.rotateY(result, angle);

        return result.add(center);
    }

    private rotateAroundZ(point: Vector3D, center: Vector3D, angle: number){
        let result = point.subtract(center);

        result = this.rotateZ(result, angle);

        return result.add(center);
    }

}

class EngineDraw{
    private context: CanvasRenderingContext2D | null = null;

    public setContext(context: CanvasRenderingContext2D){
        this.context = context;
    }

    public drawPoint(x: number, y:number, radius: number) : void;
    public drawPoint(point: Vector2D, radius: number) : void;

    public drawPoint(a: any, b: any, c?: any) : void {

        const ctx = this.context;

        if(!ctx){
            return;
        }
        
        if(a instanceof Vector2D)
        {
            return this.drawPoint(a.x, a.y, b);
        }

        const x = a as number;
        const y = b as number;
        const radius = c as number;

        const FULL_ROTATION = Math.PI * 2;

        ctx.beginPath();
        ctx.arc(x,y,radius,0,FULL_ROTATION);
        ctx.fill();
    }

    public drawLine(from: Vector2D, to: Vector2D) : void {
        const ctx = this.context;

        if(!ctx)
            return;

        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
        ctx.stroke();
    }
}

export class EngineFunctions{
    mathFunctions: EngineMath;
    drawFunctions: EngineDraw;

    constructor(){
        this.mathFunctions = new EngineMath;
        this.drawFunctions = new EngineDraw;
    }

    public setContext(context: CanvasRenderingContext2D){
        this.drawFunctions.setContext(context);
    }
} 

export const engineFunctions = new EngineFunctions();