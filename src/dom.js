var createTree = (player) => {
    let root = document.querySelector(player.options.targetElement),
        dom = {},
        docFrag = document.createDocumentFragment();
    dom.container = newNode("div", docFrag, {
        id: "nsycontainer" +  player.id,
        class: "video-container"
    });
    dom.video = newNode("video", dom.container, {
        id: "nsyvideo" +  player.id,
        class: "video"
    });
    dom.controls = newNode("div", dom.container, {
        id: "nsycontrols" +  player.id,
        class: "video-control-bar"
    });
    dom.play = newNode("button", dom.controls, {
        id: "nsyplay" +  player.id,
        class: "play-control video-control",
        tabindex: "0",
        role: "button",
        type: "button",
        'aria-live': "polite"
    });
    dom.mute = newNode("button", dom.controls, {
        id: "nsymute" +  player.id,
        class: "sound-control video-control low",
        tabindex: "0",
        role: "button",
        type: "button",
        'aria-live': "polite"
    });
    
    dom.volume = newNode("input", dom.controls, {
        id: "nsyvolume" +  player.id,
        class: "input-range video-control volume-bar",
        'type': "range",
        'value': "0",
        'min': "0",
        'max': "100"
    });
    dom.progress = newNode("input", dom.controls, {
        id: "nsyprogress" +  player.id,
        class: "input-range video-control seek-bar",
        'type': "range",
        'value': "0",
        'min': "0",
        'max': "100"
    });
    dom.fullScreen = newNode("button", dom.controls, {
        id: "fullScreen" +  player.id,
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
