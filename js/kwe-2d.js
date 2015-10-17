// Sidebars
var leftSideBar;
var rightSideBar
var canvas;

var currentSelection;
var currentWorld = "World1"; // Change this to change the world


// Refresh trees on the sidebars
function refreshSidebar() {
    leftSideBar.nodes = [];
    rightSideBar.nodes = [];

    // for each world, add the world to the left sidebar
    // and for each entity in that world, add the entities as the world's children
    for (var world in worlds) {
        var enNodes = [];
        for (var entity in worlds[world].entities) {
            var enNode = { id: "entity:" + world+":"+entity, text: entity, icon: 'fa fa-paper-plane-o', nodes:[] };
            enNodes.push(enNode);
        }
        var node = { id: "world:" + world, text: world, icon: 'fa fa-folder', expanded:true, group:true, nodes: enNodes };
        leftSideBar.nodes.push(node);
    };


    var spNodes = [];

    // for each sprite, add it to the right sidebar
    for (var sprite in sprites) {
        var spNode = { id: "sprite:" + sprite, text: sprite, icon: 'fa fa-file-image-o', nodes:[] };
        spNodes.push(spNode);
    }

    rightSideBar.nodes = [
        { id: 'resources', text: 'Resources', icon: 'fa fa-folder', expanded: true, group: true,
            nodes: [
                { id: 'resource-sprites', text: 'Sprites', icon: 'fa fa-folder-o', expanded: true, nodes: spNodes }
            ]
        }
    ];

    rightSideBar.onDblClick = function(event) {
        if (event.target.startsWith('sprite:')) {
            var spr = event.target.substring("sprite:".length);
            var entity_name = prompt("Enter new entity name.");

            // TODO: Check validity of entity_name.

            addSpriteEntity(worlds[currentWorld], entity_name, spr);
            refreshSidebar();
            rerenderall();
        }

    }

    leftSideBar.refresh();
    rightSideBar.refresh();
}

function changeProperty(world, entityName, component, property, value) {
    var comp = components[component];
    var entity = worlds[world].entities[entityName];

    if (comp[property] == "Number")
        entity.components[component][property] = Number(value);
    else
        entity.components[component][property] = value;

    if (component == "Transformation" && entity.img != undefined) {
        if (property == "Translate-X")
            entity.img.left = Number(value);
        else if (property == "Translate-Y")
            entity.img.top = Number(value);
        else if (property == "Scale-X")
            entity.img.scaleX = Number(value);
        else if (property == "Scale-Y")
            entity.img.scaleY = Number(value);
        else if (property == "Angle")
            entity.img.rotate(Number(value));
        canvas.renderAll();
    }
}

// get the content to display in the bottom "Properties" pane
function getContent(id) {
    var content = "";

    // for the entity, display the components
    if (id.startsWith("entity:")) {

        var names = id.substring("entity:".length).split(':');

        // names[0] is world name, names[1] is entity name
        var entity = worlds[names[0]].entities[names[1]];

        var content = '<b>' + names[1] + '</b><br/>';
        for (var c in entity.components) {
            content += '<u>' + c + ':</u> ';
            var component = entity.components[c]
            var compdef = components[c];


            if (c != "Sprite" && c != "Transformation") {
                var delcompevent = "delComponent(worlds['" + names[0] + "'].entities['" + names[1] + "'],'" + c + "');"
                                + "w2ui['layout'].content('preview', getContent(currentSelection));";
                content += "<button onclick=\"" + delcompevent + "\"> Remove </button><br/>";
            }
            else
                content += "<br/>"

            for (var prop in component) {
                // For each property of the component, we add a label and an input control

                var property = component[prop];
                var propcontent = "";

                var eventstr = "oninput='changeProperty(\"" + names[0] + "\", \"" + names[1] + "\", \""
                            + c + "\", \"" + prop + "\", this.value)'";

                var propdef = compdef[prop];

                if (typeof propdef === 'string')
                    propcontent = "<input " + eventstr + " type='text' value='" + property + "'>";

                else if (typeof propdef === 'number')
                    propcontent = "<input " + eventstr + " type='number' value='" + property + "' step='0.1' style='width: 90px;'>";

                else if (Array.isArray(propdef)) {
                    propcontent = "<select " + eventstr + ">";
                    for (k in propdef) {
                        val = propdef[k];
                        propcontent += "<option value='" + val + "'"
                        if (val == property)
                            propcontent += ' selected';
                        propcontent += ">" + val + "</option>";
                    }
                    propcontent += "</select>";
                }

                content += prop + ": " + propcontent + " ";
            }
            content += "<br/><br/>"
        }

        var addcompevent = "addComponent(worlds['" + names[0] + "'].entities['" + names[1] + "'],selectedComponent);"
                            + "w2ui['layout'].content('preview', getContent(currentSelection));";
        excontent = "<select oninput=\"selectedComponent=this.value;\">";
        selectedComponent = "";
        for (comp in components) {
            if (!(comp in entity.components)) {
                if (selectedComponent == "")
                    selectedComponent = comp;
                excontent += "<option value='" + comp + "'>" + comp + "</option>";
            }
        }
        excontent += "</select>";
        excontent += "<button onclick=\"" + addcompevent + "\">Add Component</button><br/>"
        if (selectedComponent != "")
            content += excontent;
    }
    return content;
}

var selectedComponent;

$(function () {
    var pstyle = 'background-color: #F5F6F7; border: 1px solid #dfdfdf; padding: 5px;';
    var toolbar = '<div id="toolbar"></div>'
    var drawingContent = '<canvas id="c"  width="1200" height="450"></canvas>';
    $('#homepage').w2layout({
        name: 'layout',
        panels: [
            { type: 'top',  size: 50, resizable: true, content: toolbar },
            { type: 'left', size: 200, resizable: true, style: pstyle, content: '' },
            { type: 'main', style: pstyle, content: drawingContent },
            { type: 'preview', size: '35%', resizable: true, style: pstyle, content: '' },
            { type: 'right', size: 200, resizable: true, style: pstyle, content: '' },
            { type: 'bottom', size: 50, resizable: true, style: pstyle, content: 'Katana World Editor - 2D' }
        ]
    });

    $('#toolbar').w2toolbar({
        name: 'toolbar',
        items: [
            { type: 'menu',   id: 'menu-file', caption: 'File', icon: 'fa fa-navicon', items: [
                { text: 'New Project', icon: 'fa fa-home' },
                { text: 'Open Project', icon: 'icon-page' },
                { text: 'Close Project', icon: 'icon-page' }
            ]}
        ]
    });

    leftSideBar = $().w2sidebar({
        name: 'sidebar-left',
        img: null,
        nodes: [],
        onClick: function (event) {
            currentSelection = event.target;
            w2ui['layout'].content('preview', getContent(event.target));
        }
    });
    w2ui['layout'].content('left', leftSideBar);

    rightSideBar = $().w2sidebar({
        name: 'sidebar-right',
        img: null,
        nodes: [],
        onClick: function (event) {
            currentSelection = event.target;
            w2ui['layout'].content('preview', getContent(event.target));
        }
    });
    rightlayout = $().w2layout({
        name: 'right-layout',
        panels: [
            { type: 'top', size: '75%', resizable: true },
            { type: 'bottom', size: '25%', resizable: true }
        ]
    });
    w2ui['right-layout'].content('top', rightSideBar);
    w2ui['right-layout'].content('bottom', 'Add Sprite:<br/><input type="file" id="sprite_file_selector" onchange="addSpriteFile()">');
    w2ui['layout'].content('right', rightlayout);


    addSprite("Player", "assets/katana.png");
    addSprite("Ground", "assets/katana.png");

    var w1 = addWorld("World1");
    addSpriteEntity(w1, "Player", "Player");
    addSpriteEntity(w1, "Ground", "Ground");

    var w2 = addWorld("World2");
    addEntity(w2, "Player");

    refreshSidebar();

    canvas = new fabric.Canvas('c', {
        hoverCursor: 'pointer',
        selection: false
    });

    canvas.on({
        'object:moving': function(e) {
            e.target.opacity = 0.5;
        },
        'object:selected': function(e) {
            if (e.target.entity != undefined) {
                currentSelection = "entity:" + currentWorld + ":" + e.target.entity.name;
                w2ui['layout'].content('preview', getContent(currentSelection));
            }
        },
        'object:modified': function(e) {
            e.target.opacity = 1;

            if (e.target.entity != undefined) {
                var tcomp = e.target.entity.components["Transformation"];
                tcomp["Translate-X"] = e.target.left;
                tcomp["Translate-Y"] = e.target.top;
                tcomp["Scale-X"] = e.target.scaleX;
                tcomp["Scale-Y"] = e.target.scaleY;
                tcomp["Angle"] = e.target.angle;

                if (currentSelection != undefined)
                    w2ui['layout'].content('preview', getContent(currentSelection));
            }
        }
    });

    rerenderall();
});

function createImage(entity) {
    var sprite = sprites[entity.components["Sprite"]["Sprite"]];
    fabric.Image.fromURL(sprite.file, function(img) {
        var sprComp = entity.components["Sprite"];
        var transComp = entity.components["Transformation"];
        img.set({
            left: transComp["Translate-X"],
            top: transComp["Translate-Y"],
            angle: transComp["Angle"],
            scaleX: transComp["Scale-X"],
            scaleY: transComp["Scale-Y"],
            originX: "center",
            originY: "center",
            perPixelTargetFind: true,
            targetFindTolerance: 4,
            hasControls: true,
            hasBorders: true,
        });

        img.entity = entity;
        entity.img = img;
        canvas.add(img);
    });
}

function rerenderall() {
    canvas.clear();

    for (var entityName in worlds[currentWorld].entities) {
        var entity = worlds[currentWorld].entities[entityName];

        if ("Sprite" in entity.components && "Transformation" in entity.components) {
            createImage(entity);
        }
    }

    canvas.renderAll();
}

function addSpriteFile() {
    var fileInput = document.querySelector('#sprite_file_selector');
    var file = fileInput.files[0];
    openFileAsDataUrl(file, function(url) {
        var sprite_name = prompt("Enter sprite's name.");

        // TODO: check sprite name validity here: valid identified, if it already exists etc.

        addSprite(sprite_name, url);
        refreshSidebar();
        fileInput.value = "";
    });
}



if (typeof String.prototype.startsWith != 'function') {
    String.prototype.startsWith = function (str){
        return this.indexOf(str) === 0;
    };
}
