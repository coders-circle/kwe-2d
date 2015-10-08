// Sidebars
var leftSideBar;
var rightSideBar

// Refresh trees on the sidebars
function refreshSidebar() {
    leftSideBar.nodes = [];

    // for each world, add the world to the left sidebar
    // and for each entity in that world, add the entities as the world's children
    for (var world in worlds) {
        enNodes = [];
        for (var entity in worlds[world].entities) {
            enNode = { id: "entity:" + world+":"+entity, text: entity, img: 'icon-page', nodes:[] };
            enNodes.push(enNode);
        }
        node = { id: "world:" + world, text: world, img: 'icon-folder', expanded:true, group:true, nodes: enNodes };
        leftSideBar.nodes.push(node);
    };


    spNodes = [];

    // for each sprite, add it to the right sidebar
    for (var sprite in sprites) {
        spNode = { id: "sprite:" + sprite, text: sprite, img: 'icon-page', nodes:[] };
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

function changeProperty(world, entity, component, property, value) {
    comp = components[component];
    if (comp[property] == "Number")
        worlds[world].entities[entity].components[component][property] = Number(value);
    else
        worlds[world].entities[entity].components[component][property] = value;
}


// get the content to display in the bottom "Properties" pane
function getContent(id) {
    var content = "";

    // for the entity, display the components
    if (id.startsWith("entity:")) {

        var names = id.substring("entity:".length).split(':');

        // names[0] is world name, names[1] is entity name
        entity = worlds[names[0]].entities[names[1]];

        content = '<b>' + names[1] + '</b><br/>';
        for (var c in entity.components) {
            content += '<u>' + c + ':</u><br/>';
            component = entity.components[c]
            compdef = components[c];

            for (var prop in component) {
                // For each property of the component, we add a label and an input control

                property = component[prop];
                propcontent = "";

                eventstr = "oninput='changeProperty(\"" + names[0] + "\", \"" + names[1] + "\", \""
                            + c + "\", \"" + prop + "\", this.value)'";

                propdef = compdef[prop];

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
            w2ui['layout'].content('preview', getContent(event.target));
        }
    });
    w2ui['layout'].content('left', leftSideBar);

    rightSideBar = $().w2sidebar({
        name: 'sidebar-right',
        img: null,
        nodes: [],
        onClick: function (event) {
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

});



$(function() {
  var canvas = this.__canvas = new fabric.Canvas('c', {
    hoverCursor: 'pointer',
    selection: false
  });

  canvas.on({
    'object:moving': function(e) {
      e.target.opacity = 0.5;
    },
    'object:modified': function(e) {
      e.target.opacity = 1;
    }
  });

  for (var i = 0, len = 15; i < len; i++) {
    fabric.Image.fromURL('assets/katana.png', function(img) {
      img.set({
        left: fabric.util.getRandomInt(0, 600),
        top: fabric.util.getRandomInt(0, 500),
        angle: fabric.util.getRandomInt(0, 90)
      });

      img.perPixelTargetFind = true;
      img.targetFindTolerance = 4;
      img.hasControls = img.hasBorders = true;

      img.scale(fabric.util.getRandomInt(50, 100) / 100);

      canvas.add(img);
    });
  }
});


if (typeof String.prototype.startsWith != 'function') {
    String.prototype.startsWith = function (str){
        return this.indexOf(str) === 0;
    };
}
