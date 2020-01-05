/* @(#)VirtualCubeMain.mjs 
 * Copyright (c) 2018 Werner Randelshofer, Switzerland. MIT License.
 */

/** Integrates a virtual cube into a HTML page.
 */

import WebglPlayerApplet from './WebglPlayerApplet.mjs';
import TwoDPlayerApplet from './TwoDPlayerApplet.mjs';
import CubeMarkup from './CubeMarkup.mjs';

let logger = {
    log: (false && console != null && console.log != null) ? console.log : () => {
    },
    info: (true && console != null && console.info != null) ? console.info : () => {
    },
    warning: (true && console != null && console.warn != null) ? console.warn : () => {
    },
    error: (true && console != null && console.error != null) ? console.error : () => {
    }
}

let nextId = 0;

/**
 * Returns a new parameters object which contains all parameters
 * in the given parameters object plus all data from a CubeMarkup XML
 * file, if the parameters file contains a reference to such a file.
 */
async function loadCubeMarkupParameters(parameters) {
    let p = Object.assign({}, parameters);
    if (parameters.resourcefile != null) {
        let resourceUrl = document.URL+"/../"+parameters.resourcefile;
        let data = await new CubeMarkup.CubeMarkupReader().loadFromUrl(resourceUrl);
        if (data != null) {
            let notationData = data.findNotation(parameters.notation);
            if (notationData != null) {
                p.scriptNotationObject = notationData.getNotation();
            }
            let cubeData = data.findCube(parameters.cube);
            if (cubeData != null) {
                p.cubeAttributesObject = cubeData.getAttributes();
            }
        }
    }
    return p;
}

function instantiateVirtualCube(canvasElem, parameters) {
    let vr = new VirtualCube(canvasElem);
    vr.parameters = Object.assign({}, parameters);
    vr.init();
    canvasElem.virtualcube = vr;   
}

function appendToolbar(element, id, parameters) {
            let toolbarElem = document.createElement("div");
            toolbarElem.setAttribute("class", "button-toolbar");
            element.append(toolbarElem);
            let buttonElem;
            
            if (parameters.script == null) {
                buttonElem = document.createElement("button");
                buttonElem.setAttribute("type", "button");
                buttonElem.setAttribute("class", "scramble-button");
                buttonElem.setAttribute("onclick", "document.getElementById('" + id + "').virtualcube.scramble();");
                buttonElem.append(document.createTextNode("Scramble"));
                toolbarElem.append(buttonElem);
                
                buttonElem = document.createElement("button");
                buttonElem.setAttribute("type", "button");
                buttonElem.setAttribute("class", "reset-button");
                buttonElem.setAttribute("onclick", "document.getElementById('" + id + "').virtualcube.reset();");
                buttonElem.append(document.createTextNode("Reset"));
                toolbarElem.append(buttonElem);

                buttonElem = document.createElement("button");
                buttonElem.setAttribute("type", "button");
                buttonElem.setAttribute("class", "undo-button");
                buttonElem.setAttribute("onclick", "document.getElementById('" + id + "').virtualcube.undo();");
                buttonElem.append(document.createTextNode("Undo"));
                toolbarElem.append(buttonElem);

                buttonElem = document.createElement("button");
                buttonElem.setAttribute("type", "button");
                buttonElem.setAttribute("class", "redo-button");
                buttonElem.setAttribute("onclick", "document.getElementById('" + id + "').virtualcube.redo();");
                buttonElem.append(document.createTextNode("Redo"));
                toolbarElem.append(buttonElem);

            } else {
                /*
                buttonElem = document.createElement("button");
                buttonElem.setAttribute("type", "button");
                buttonElem.setAttribute("class", "scramble-button");
                buttonElem.setAttribute("onclick", "document.getElementById('" + id + "').virtualcube.scramble();");
                buttonElem.append(document.createTextNode("☆"));
                toolbarElem.append(buttonElem);
            */
                buttonElem = document.createElement("button");
                buttonElem.setAttribute("type", "button");
                buttonElem.setAttribute("class", "reset-button");
                buttonElem.setAttribute("onclick", "document.getElementById('" + id + "').virtualcube.reset();");
                buttonElem.append(document.createTextNode("▯◁"));
                toolbarElem.append(buttonElem);
                
                buttonElem = document.createElement("button");
                buttonElem.setAttribute("type", "button");
                buttonElem.setAttribute("class", "play-button");
                buttonElem.setAttribute("onclick", "document.getElementById('" + id + "').virtualcube.play();");
                buttonElem.append(document.createTextNode("▷"));
                toolbarElem.append(buttonElem);

                buttonElem = document.createElement("button");
                buttonElem.setAttribute("type", "button");
                buttonElem.setAttribute("class", "step-backward-button");
                buttonElem.setAttribute("onclick", "document.getElementById('" + id + "').virtualcube.stepBackward();");
                buttonElem.append(document.createTextNode("◁▯"));
                toolbarElem.append(buttonElem);

                buttonElem = document.createElement("button");
                buttonElem.setAttribute("type", "button");
                buttonElem.setAttribute("class", "step-forward-button");
                buttonElem.setAttribute("onclick", "document.getElementById('" + id + "').virtualcube.stepForward();");
                buttonElem.append(document.createTextNode("▯▷"));
                toolbarElem.append(buttonElem);
            }
            
            
            
            
            /*
             buttonElem = document.createElement("button");
             buttonElem.setAttribute("type","button");
             buttonElem.setAttribute("onclick","document.getElementById('"+id+"').virtualcube.wobble();");  
             buttonElem.append(document.createTextNode("Wobble"));
             toolbarElem.append(buttonElem);
             buttonElem = document.createElement("button");
             buttonElem.setAttribute("type","button");
             buttonElem.setAttribute("onclick","document.getElementById('"+id+"').virtualcube.explode();");  
             buttonElem.append(document.createTextNode("Explode"));
             toolbarElem.append(buttonElem);
             */
    
}

/** 
 * Attaches a VirtualCube object to the specified <div> or <canvas> element.
 *
 * If a <div>-Element is specified, then the following child elements
 * are added to it:
 *
 * <canvas class="cube-canvas"/>
 * <div class="button-toolbar">
 *    <div class="reset-button" />
 *    <div class="undo-button" />
 *    <div class="redo-button" />
 *    <div class="scramble-button" />
 * </div>
 *
 * @param parameters applet parameters (key,names)
 * @param element 
 *               Optional <div>, <canvas> or <applet> element on the HTML page.
 *               If element is null, a rubik's cube is attached to all
 *               <div> and <canvas>  elements in the document with 
 *               class "virtualcube",
 *               and to all <applet> elements in the document with
 *               code="RubikPlayer.*".
 *               If a <canvas>-Element is specified, then a VirtualCube
 *               object is added to it as the property virtualcube.
 */
function attachVirtualCube(parameters, element) {
    logger.log("attaching virtual cube")
    if (parameters == null) {
        parameters = {};
    }

    if (element == null) {
        // => no element was provided, attach to all elements with class "virtualcube"
        let htmlCollection = [];
        try {
            for (let elem of document.getElementsByClassName("virtualcube")) {
                htmlCollection.push(elem);
            }
        } catch (err) {
            // => IE does not support getElementsByClassName
            return;
        }
        
        // => also attach to all applet elements
        for (let elem of document.getElementsByTagName("APPLET")) {
           let code = elem.getAttribute("code");
           if (code !=null && code.startsWith("RubikPlayer")) {
               htmlCollection.push(elem);
           }
        }
        
        if (htmlCollection.length == 0) {
            logger.error('no canvas or div element with class name "virtualcube" found, and no RubikPlayer applets found.');
            return;
        }
        for (let elem of htmlCollection) {
            // Note: we have to clone the parameters, because we add additional values to it for each
            //         virtual cube that we create.
            attachVirtualCube(Object.assign({}, parameters), elem);
        }
    } else {
        // => an element was provided, attach VirtualCube to it
        let canvasElem = null;
        if (element.tagName == "CANVAS") {
            // => A <canvas> element was provided, attach to it
            canvasElem = element;
        } else if (element.tagName == "DIV") {
            // => A <div> element was provided, remove content, then insert a canvas element and buttons
            while (element.lastChild) {
                element.removeChild(element.lastChild);
            }
            let divElem = element;
            let attrwidth = divElem.getAttribute("width") != null ? divElem.getAttribute("width") : "220";
            let attrheight = divElem.getAttribute("height") != null ? divElem.getAttribute("height") : "220";

            let id = "virtualcube_" + nextId++;
            canvasElem = document.createElement("canvas");
            canvasElem.setAttribute("class", "cube-canvas");
            canvasElem.setAttribute("id", id);
            canvasElem.setAttribute("width", attrwidth);
            canvasElem.setAttribute("height", attrheight);

            // copy attributes from element over to the canvasElem
            for (let i = 0; i < element.attributes.length; i++) {
                let attr = element.attributes[i];
                if (attr.name != "id" && attr.name != "class") {
                    logger.log('.attachVirtualCube copying attribute attr.name:' + attr.name + ' attr.value:' + attr.value);
                    canvasElem.setAttribute(attr.name, attr.value);
                    parameters[attr.name.toLowerCase()] = attr.value;
                }
            }
            if (!element.hasAttribute("kind")) {
                canvasElem.setAttribute("kind", element.getAttribute("kind"));
            }
            if (!element.hasAttribute("debug")) {
                canvasElem.setAttribute("debug", "");
            }

            element.append(canvasElem);
            appendToolbar(divElem, id, parameters);

        } else if (element.tagName == "APPLET") {
            // => A <applet> element was provided, remove element, then insert a div element with
            //     a canvas child and buttons
            let appletElem = element;
            
            var divElem = document.createElement("div");
            divElem.setAttribute("class","virtualcube");
            
            let attrwidth = appletElem.getAttribute("width") != null ? appletElem.getAttribute("width") : "220";
            let attrheight = appletElem.getAttribute("height") != null ? appletElem.getAttribute("height") : "220";

            let id = "virtualcube_" + nextId++;
            canvasElem = document.createElement("canvas");
            canvasElem.setAttribute("class", "cube-canvas");
            canvasElem.setAttribute("id", id);
            canvasElem.setAttribute("width", attrwidth);
            canvasElem.setAttribute("height", attrheight);
            canvasElem.setAttribute("debug", "");
            divElem.append(canvasElem);
            
            // copy applet parameters over to the canvasElem and into parameters map
            for (let param of Array.from(appletElem.children)) {
                if (param.tagName == "PARAM") {
                    let name = param.getAttribute("name");
                    let value = param.getAttribute("value");
                    canvasElem.setAttribute(name, value);
                    parameters[name.toLowerCase()] = value;
                }
            }
            
            appendToolbar(divElem, id, parameters);
            
            // replace the applet with our div element
            element.parentNode.replaceChild(divElem, appletElem);
        } else {
            logger.error('element ' + element + ' is not a canvas or a div. tagName=' + element.tagName);
            return;
        }
        
        for (let i = 0; i < element.attributes.length; i++) {
            let attr = element.attributes[i];
            if (attr.name != "id" && attr.name != "class") {
                logger.log('.attachVirtualCube copying parameter attr.name:' + attr.name + ' attr.value:' + attr.value);
                parameters[attr.name] = attr.value;
            }
        }
        loadCubeMarkupParameters(parameters).then(
          p=>instantiateVirtualCube(canvasElem, p),
          reason=>console.error("Couldn't load file "+parameters.resourcefile+". "+reason)
          );
    }
}


/** Constructor.
 * 
 * Creates a virtual rubik's cube and attaches it to the specified canvas
 * object. 
 * init() must be called after construction.
 */
class VirtualCube {
    constructor(canvas) {
        this.canvas = canvas;
        this.parameters = {baseurl: 'lib'};
    }

    /** Initializes the virtual cube. */
    init() {
        let rendercontext = this.parameters.rendercontext;
        logger.log('reading parameter rendercontext:' + rendercontext);
        if (rendercontext == "2d") {
            this.canvas3d = new TwoDPlayerApplet.TwoDPlayerApplet();
        } else if (rendercontext == null || rendercontext == "webgl") {
            this.canvas3d = new WebglPlayerApplet.WebglPlayerApplet();
        } else {
            logger.error('illegal rendercontext:' + rendercontext);
            this.canvas3d = new WebglPlayerApplet.WebglPlayerApplet();
        }
        for (let k in this.parameters) {
            this.canvas3d.parameters[k] = this.parameters[k];
        }
        
        let s = this.canvas3d.setCanvas(this.canvas);
        if (!s) {
            logger.log("Could not instantiate WebGL Context, falling back to 2D Context");
            for (let k in this.parameters) {
                this.canvas3d.parameters[k] = this.parameters[k]
            }
            this.canvas3d = new TwoDPlayerApplet.TwoDPlayerApplet();
            for (let k in this.parameters) {
                this.canvas3d.parameters[k] = this.parameters[k];
            }
            s = this.canvas3d.setCanvas(this.canvas);
        }
    }
    reset() {
        this.canvas3d.reset();
    }
    scramble(scrambleCount, animate) {
        this.canvas3d.scramble(scrambleCount, animate);
    }
    undo() {
        this.canvas3d.undo();
    }
    redo() {
        this.canvas3d.redo();
    }
    play() {
        this.canvas3d.play();
    }
    stepForward() {
        this.canvas3d.stepForward();
    }
    stepBackward() {
        this.canvas3d.stepBackward();
    }
    wobble() {
        this.canvas3d.wobble();
    }
    explode() {
        this.canvas3d.explode();
    }
    setAutorotate(newValue) {
        this.canvas3d.setAutorotate(newValue);
    }
}

// ------------------
// MODULE API    
// ------------------
export default {
    attachVirtualCube: attachVirtualCube
};

