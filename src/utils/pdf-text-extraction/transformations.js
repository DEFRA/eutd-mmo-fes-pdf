// Matrix index constants (PDF transformation matrices are 6-element arrays: [a,b,c,d,tx,ty])
const M_A = 0;
const M_B = 1;
const M_C = 2;
const M_D = 3;
const M_TX = 4;
const M_TY = 5;
// Box index constants (axis-aligned bounding boxes: [minX,minY,maxX,maxY])
const BOX_MIN_X = 0;
const BOX_MIN_Y = 1;
const BOX_MAX_X = 2;
const BOX_MAX_Y = 3;
const BOX_CORNERS = 4;
const BOX_LAST_CORNER = BOX_CORNERS - 1;

module.exports = {
        transformVector : function(inVector,inMatrix) {
            if(!inMatrix) {
                return inVector;
            }
            const fX = inMatrix[M_A]*inVector[0] + inMatrix[M_C]*inVector[1] + inMatrix[M_TX];
            const fY = inMatrix[M_B]*inVector[0] + inMatrix[M_D]*inVector[1] + inMatrix[M_TY];
            return [fX,fY];
        },

        inverseMatrix: function(inMatrix)
        {
            if(!inMatrix) {
                return inMatrix;
            }
            const a = inMatrix[M_A];
            const b = inMatrix[M_B];
            const c = inMatrix[M_C];
            const d = inMatrix[M_D];
            const t1 = inMatrix[M_TX];
            const t2 = inMatrix[M_TY];
            const det = a*d-b*c;
            return [
              d/det,
              -b/det,
              -c/det,
              a/det,
              (c*t2-d*t1)/det,
              (b*t1-a*t2)/det
            ];
        },

        determinante : function(inMatrix)
        {
            if(!inMatrix) {
                return 1;
            }
            return inMatrix[M_A]*inMatrix[M_D]-inMatrix[M_B]*inMatrix[M_C];
        },

        multiplyMatrix: function(inMatrixA,inMatrixB)
        {
            if(!inMatrixA) {
                return inMatrixB;
            }
            if(!inMatrixB) {
                return inMatrixA;
            }
            return [
                inMatrixA[M_A]*inMatrixB[M_A] + inMatrixA[M_B]*inMatrixB[M_C],
                inMatrixA[M_A]*inMatrixB[M_B] + inMatrixA[M_B]*inMatrixB[M_D],
                inMatrixA[M_C]*inMatrixB[M_A] + inMatrixA[M_D]*inMatrixB[M_C],
                inMatrixA[M_C]*inMatrixB[M_B] + inMatrixA[M_D]*inMatrixB[M_D],
                inMatrixA[M_TX]*inMatrixB[M_A] + inMatrixA[M_TY]*inMatrixB[M_C] + inMatrixB[M_TX],
                inMatrixA[M_TX]*inMatrixB[M_B] + inMatrixA[M_TY]*inMatrixB[M_D] + inMatrixB[M_TY],
            ];
        },

        transformBox: function(inBox,inMatrix)
        {
            if(!inMatrix) {
                return inBox;
            }
            const t = Array.from({length: BOX_CORNERS});
            t[0] = this.transformVector([inBox[BOX_MIN_X],inBox[BOX_MIN_Y]],inMatrix);
            t[1] = this.transformVector([inBox[BOX_MIN_X],inBox[BOX_MAX_Y]],inMatrix);
            t[2] = this.transformVector([inBox[BOX_MAX_X],inBox[BOX_MAX_Y]],inMatrix);
            t[BOX_LAST_CORNER] = this.transformVector([inBox[BOX_MAX_X],inBox[BOX_MIN_Y]],inMatrix);

            let minX,minY,maxX,maxY;
            minX = maxX = t[0][0];
            minY = maxY = t[0][1];

            for(let i=1;i<BOX_CORNERS;++i)
            {
                if(minX > t[i][0]) { minX = t[i][0]; }
                if(maxX < t[i][0]) { maxX = t[i][0]; }
                if(minY > t[i][1]) { minY = t[i][1]; }
                if(maxY < t[i][1]) { maxY = t[i][1]; }
            }

            return [minX,minY,maxX,maxY];
        }

    };
    