export class Vector3D{
    x: number;
    y: number;
    z: number;

    constructor(x = 0, y = 0, z = 0){
        this.x = x;
        this.y = y;
        this.z = z;
    };

    dot(vector: Vector3D){
        const result = new Vector3D(
            this.x * vector.x,
            this.y * vector.y,
            this.z * vector.z
        );

        return result.x + result.y + result.z;
    }

    length(){
        const hypotenuseXZ = (this.x * this.x + this.z * this.z);
        return Math.sqrt(hypotenuseXZ + this.y * this.y);
    }

    add(vector: Vector3D): Vector3D{
        return new Vector3D(
            this.x + vector.x,
            this.y + vector.y,
            this.z + vector.z
        )
    };

    multiply(scalar: number): Vector3D{
        return new Vector3D(
            this.x * scalar,
            this.y * scalar,
            this.z * scalar
        )
    };

    subtract(vector: Vector3D): Vector3D{
        return new Vector3D(
            this.x - vector.x,
            this.y - vector.y,
            this.z - vector.z
        )
    }

    cross(v: Vector3D): Vector3D {
        return new Vector3D(
            this.y * v.z - this.z * v.y,
            this.z * v.x - this.x * v.z,
            this.x * v.y - this.y * v.x
        );
    }

    normalize(): Vector3D {
        const len = this.length();
        if(len === 0) return new Vector3D(0,0,0);
        return new Vector3D(this.x/len, this.y/len, this.z/len);
    }
}

export class Vector2D{
    x: number;
    y: number;

    constructor(x = 0, y = 0){
        this.x = x;
        this.y = y;
    };


    public dotProduct(vector: Vector2D){
        const result = new Vector2D(
            this.x * vector.x,
            this.y * vector.y,
        );

        return result.x + result.y;
    }

    add(vector: Vector2D): Vector2D{
        return new Vector2D(
            this.x + vector.x,
            this.y + vector.y
        )
    };

    subtract(vector: Vector2D): Vector2D{
        return new Vector2D(
            this.x - vector.x,
            this.y - vector.y
        )
    }
}

export class Matrix3x3{
    public m: number[][];

    constructor(matrix?: number[][]){
        if(!matrix){
            this.m = [
                [1,0,0],
                [0,1,0],
                [0,0,1]
            ]
        }
        else{
            this.m = matrix;
        }
    }

    public multiply3DVector(vector: Vector3D) : Vector3D {
        const result = new Vector3D(
            this.m[0][0] * vector.x + this.m[0][1] * vector.y + this.m[0][2] * vector.z,
            this.m[1][0] * vector.x + this.m[1][1] * vector.y + this.m[1][2] * vector.z,
            this.m[2][0] * vector.x + this.m[2][1] * vector.y + this.m[2][2] * vector.z,
        );

        return result;
    }
}

export class Matrix2x2{
    public m: number[][];

    constructor(matrix?: number[][]){
        if(!matrix){
            this.m = [
                [1,0],
                [0,1]
            ]
        }
        else{
            this.m = matrix;
        }
    }

    public multiply2DVector(vector: Vector2D) : Vector2D {
        const result = new Vector2D(
            this.m[0][0] * vector.x + this.m[0][1] * vector.y,
            this.m[1][0] * vector.x + this.m[1][1] * vector.y,
        );

        return result;
    }
}