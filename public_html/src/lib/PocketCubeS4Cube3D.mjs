/* @(#)PocketCubeS4Cube3D.mjs
 * Copyright (c) 2018 Werner Randelshofer, Switzerland. MIT License.
 */

import AbstractPocketCubeCube3D from './AbstractPocketCubeCube3D.mjs';
import CubeAttributes from './CubeAttributes.mjs';
import PreloadPocketCubeS4 from './PreloadPocketCubeS4.mjs';


let module = {
    log: (false) ? console.log : () => {
    },
    info: (true) ? console.info : () => {
    },
    warning: (true) ? console.warning : () => {
    },
    error: (true) ? console.error : () => {
    }
}

/** Constructor
 * Creates the 3D geometry of a Rubik's Cube.
 * Subclasses must call initPocketCubeS4Cube3D(). 
 */
class PocketCubeS4Cube3D extends AbstractPocketCubeCube3D.AbstractPocketCubeCube3D {
    constructor() {
        super(1.8);
    }
    loadGeometry() {
        super.loadGeometry();
        this.isDrawTwoPass = false;
    }

    getModelUrl() {
        return this.baseUrl + '/' + this.relativeUrl;
    }

    createAttributes() {
        let a = new CubeAttributes.CubeAttributes(this.partCount, 6 * 4, [4, 4, 4, 4, 4, 4]);
        let partsPhong = [0.5, 0.6, 0.4, 16.0];//shiny plastic [ambient, diffuse, specular, shininess]
        for (let i = 0; i < this.partCount; i++) {
            a.partsFillColor[i] = [24, 24, 24, 255];
            a.partsPhong[i] = partsPhong;
        }
        a.partsFillColor[this.centerOffset] = [240, 240, 240, 255];

        let faceColors = [//Right, Up, Front, Left, Down, Back
            [255, 210, 0, 155], // Yellow
            [0, 51, 115, 255], // Blue
            [140, 0, 15, 255], // Red
            [248, 248, 248, 255], // White
            [0, 115, 47, 255], // Green
            [255, 70, 0, 255], // Orange
        ];

        let stickersPhong = [0.8, 0.2, 0.1, 8.0];//shiny paper [ambient, diffuse, specular, shininess]

        for (let i = 0; i < 6; i++) {
            for (let j = 0; j < 4; j++) {
                a.stickersFillColor[i * 4 + j] = faceColors[i];
                a.stickersPhong[i * 4 + j] = stickersPhong;
            }
        }

        a.faceCount = 6;
        a.stickerOffsets = [0, 4, 8, 12, 16, 20];
        a.stickerCounts = [4, 4, 4, 4, 4, 4];

        return a;
    }
}

PocketCubeS4Cube3D.prototype.relativeUrl = 'models/pocketcubes4/';
PocketCubeS4Cube3D.prototype.baseUrl = 'lib/';


// ------------------
// MODULE API    
// ------------------
export default {
    Cube3D: PocketCubeS4Cube3D
};

