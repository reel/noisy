var createTree = (target, active, id) => {
    let root = document.querySelector(target),
        dom = {},
        docFrag = document.createDocumentFragment(),
        display = active ? '' : ' hidden';
    dom.container = newNode("div", docFrag, {
        id: "nsycontainer" +  id,
        class: "video-container" + display,
    });
    dom.video = newNode("video", dom.container, {
        id: "nsyvideo" +  id,
        class: "video"
    });
    dom.timeleft = newNode("div", dom.container, {
        id: "nsytimeleft" +  id,
        class: "video-timeleft"
    });
    dom.timeleftvalue = newNode("p", dom.timeleft, {
        id: "nsytimeleftinner" +  id
    });
    dom.visit = newNode("div", dom.container, {
        id: "nsyvisit/" +  id,
        class: "video-visit"
    });
    dom.visitvalue = newNode("p", dom.visit, {
        id: "nsytimeleftinner" +  id
    });
    dom.controls = newNode("div", dom.container, {
        id: "nsycontrols" +  id,
        class: "video-control-bar"
    });
    dom.play = newNode("button", dom.controls, {
        id: "nsyplay" +  id,
        class: "play-control video-control",
        tabindex: "0",
        role: "button",
        type: "button",
        'aria-live': "polite"
    });
    dom.mute = newNode("button", dom.controls, {
        id: "nsymute" +  id,
        class: "sound-control video-control low",
        tabindex: "0",
        role: "button",
        type: "button",
        'aria-live': "polite"
    });

    dom.volume = newNode("input", dom.controls, {
        id: "nsyvolume" +  id,
        class: "input-range video-control volume-bar",
        'type': "range",
        'value': "0",
        'min': "0",
        'max': "100"
    });
    dom.progress = newNode("input", dom.controls, {
        id: "nsyprogress" +  id,
        class: "input-range video-control seek-bar",
        'type': "range",
        'value': "0",
        'min': "0",
        'max': "100"
    });
    dom.fullScreen = newNode("button", dom.controls, {
        id: "fullScreen" +  id,
        class: "fullScreen-control video-control",
        tabindex: "0",
        role: "button",
        type: "button",
        'aria-live': "polite"
    });

    root.appendChild(docFrag);
    return dom;
};

var newNode = (type = "div", target = null, opts = null, evts = null) => {
    let element = document.createElement(type);
    if (opts !== null) {
        for (let key in opts) {
            if (opts.hasOwnProperty(key)) {
                element.setAttribute(key, opts[key]);
            }
        }
    }
    target.appendChild(element);
    if (evts && evts.length) {
        for (let key in evts) {
            element.addEventListener(key, evts[key]);
        }
    }
    return element;
};
export {
    createTree
};
