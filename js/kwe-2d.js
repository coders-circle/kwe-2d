// Sidebars
var leftSideBar;
var rightSideBar
var canvas;

// Refresh trees on the sidebars
function refreshSidebar() {
    leftSideBar.nodes = [];

    // for each world, add the world to the left sidebar
    // and for each entity in that world, add the entities as the world's children
    for (var world in worlds) {
        var enNodes = [];
        for (var entity in worlds[world].entities) {
            var enNode = { id: "entity:" + world+":"+entity, text: entity, img: 'icon-page', nodes:[] };
            enNodes.push(enNode);
        }
        var node = { id: "world:" + world, text: world, img: 'icon-folder', expanded:true, group:true, nodes: enNodes };
        leftSideBar.nodes.push(node);
    };


    var spNodes = [];

    // for each sprite, add it to the right sidebar
    for (var sprite in sprites) {
        var spNode = { id: "sprite:" + sprite, text: sprite, img: 'icon-page', nodes:[] };
        spNodes.push(spNode);
    }

    rightSideBar.nodes = [
        { id: 'resources', text: 'Resources', img: 'icon-folder', expanded: true, group: true,
            nodes: [
                { id: 'resource-sprites', text: 'Sprites', img: 'icon-folder', expanded: true, nodes: spNodes }
            ]
        }
    ];
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


var currentSelection;

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
            content += '<u>' + c + ':</u><br/>';
            var component = entity.components[c]
            var compdef = components[c];

            for (var prop in component) {
                // For each property of the component, we add a label and an input control

                var property = component[prop];
                var propcontent = "";

                var eventstr = "oninput='changeProperty(\"" + names[0] + "\", \"" + names[1] + "\", \""
                            + c + "\", \"" + prop + "\", this.value)'";

                var propdef = compdef[prop];

                if (propdef == 'String')
                    propcontent = "<input " + eventstr + " type='text' value='" + property + "'>";

                else if (propdef == 'Number')
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
            content += "<br/>"
        }
    }
    return content;
}

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
            { type: 'menu',   id: 'menu-file', caption: 'File', img: 'icon-folder', items: [
                { text: 'New Project', icon: 'icon-page' },
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
    })
    w2ui['layout'].content('right', rightSideBar);


    addSprite("Player");
    addSprite("Ground");

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
        'object:modified': function(e) {
            e.target.opacity = 1;

            var tcomp = e.target.entity.components["Transformation"];
            tcomp["Translate-X"] = e.target.left;
            tcomp["Translate-Y"] = e.target.top;
            tcomp["Scale-X"] = e.target.scaleX;
            tcomp["Scale-Y"] = e.target.scaleY;
            tcomp["Angle"] = e.target.angle;

            if (currentSelection != undefined)
                w2ui['layout'].content('preview', getContent(currentSelection));
        }
    });

    rerenderall();
});

function createImage(entity) {
    fabric.Image.fromURL('assets/katana.png', function(img) {
        var sprComp = entity.components["Sprite"];
        var transComp = entity.components["Transformation"];
        img.set({
            left: transComp["Translate-X"],
            top: transComp["Translate-Y"],
            angle: transComp["Angle"],
            scaleX: transComp["Scale-X"],
            scaleY: transComp["Scale-Y"],
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

    var currentWorld = "World1"; // Change this to change the world
    for (var entityName in worlds[currentWorld].entities) {
        var entity = worlds[currentWorld].entities[entityName];

        if ("Sprite" in entity.components && "Transformation" in entity.components) {
            createImage(entity);
        }
    }

    canvas.renderAll();
}



$(function() {

  // for (var i = 0, len = 15; i < len; i++) {
  //   fabric.Image.fromURL('assets/katana.png', function(img) {
  //     img.set({
  //       left: fabric.util.getRandomInt(0, 600),
  //       top: fabric.util.getRandomInt(0, 500),
  //       angle: fabric.util.getRandomInt(0, 90)
  //     });

  //     img.perPixelTargetFind = true;
  //     img.targetFindTolerance = 4;
  //     img.hasControls = img.hasBorders = true;

  //     img.scale(fabric.util.getRandomInt(50, 100) / 100);

  //     canvas.add(img);
  //   });
  // }
});


if (typeof String.prototype.startsWith != 'function') {
    String.prototype.startsWith = function (str){
        return this.indexOf(str) === 0;
    };
}
