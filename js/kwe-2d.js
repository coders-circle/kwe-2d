// Sidebars
var leftSideBar;
var rightSideBar
var canvas;
var spritePreviewCanvas;

var currentSelection;
var currentWorld = "World1"; // Change this to change the world
var selectedComponent;


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
                { id: 'resource-sprites', text: 'Sprites', icon: 'fa fa-folder-o', expanded: true, nodes: spNodes },
            ]
        }
    ];

    rightSideBar.onDblClick = function(event) {
        if (event.target.startsWith('sprite:')) {
            var spr = event.target.substring("sprite:".length);
            var entity_name = prompt("Enter new entity name.", "my_entity");
            if (entity_name == null)
                return;

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
    
    // for the sprite, display the collision shape properties
    if (id.startsWith("sprite:")) {
        var name = id.substring("sprite:".length);

        var sprite = sprites[name];

        content = '<b>' + name + '</b><br/>';

        content += 'Width: ' + sprite.width + '&nbsp;&nbsp;&nbsp;';
        content += 'Height: ' + sprite.height + '<br/><br/>';

        content += 'Shape: <br/>';
        
        var changeshape = "sprites." + name + ".shape.type=this.value;"
                        + "selectSprite(currentSelection);";
        content += "<input type='radio' name='shape_type' value='box' onclick=\"" + changeshape + "\" "
                    + (sprite.shape.type=="box"?"checked='checked'":"")    + ">Box &nbsp;"
        content += "<input type='radio' name='shape_type' value='polygon' onclick=\"" + changeshape + "\" "
                    + (sprite.shape.type=="polygon"?"checked='checked'":"")    + ">Polygon &nbsp;";
        content += "<input type='radio' name='shape_type' value='circle' onclick=\"" + changeshape + "\" "
                    + (sprite.shape.type=="circle"?"checked='checked'":"")    + ">Circle &nbsp;";
        
        content += "<br/><br/>";
        if (sprite.shape.type == "box") {
            var eventstr = "oninput='sprites." + name + ".shape.width=Number(this.value); refreshSpritePreview();'";
            content += "Width: <input " + eventstr + " type='number' value='" + sprite.shape.width + "' step='0.1' style='width: 90px;'>";
            eventstr = "oninput='sprites." + name + ".shape.height=Number(this.value); refreshSpritePreview();'";
            content += " Height: <input " + eventstr + " type='number' value='" + sprite.shape.height + "' step='0.1' style='width: 90px;'>";
        }
        else if (sprite.shape.type == "circle") {
            var eventstr = "oninput='sprites." + name + ".shape.radius=Number(this.value); refreshSpritePreview();'";
            content += "Radius: <input " + eventstr + " type='number' value='" + sprite.shape.radius + "' step='0.1' style='width: 90px;'>";
        }
        else if (sprite.shape.type == "polygon") {
            var eventstr = "oninput='sprites." + name + ".shape.points=this.value; refreshSpritePreview();'";
            content += "Points: <input " + eventstr + " value='" + sprite.shape.points + "' style='width: 390px;'>";
        }
        // var eventstr = "oninput='sprites." + name + ".width=this.value;'";
        // content += "<input " + eventstr + " type='number' value='" + sprite.width + "' step='0.1' style='width: 90px;'>"
    }
    // for the entity, display the components
    else if (id.startsWith("entity:")) {

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

function parsePoints(pstr) {
    points = [];
    pstr_array = pstr.match(/\([\d|\.|,]*\)/g);
    for (var i in pstr_array) {
        var str = pstr_array[i];
        var point = {x:0, y:0};
        
        vals = str.match(/[\d|\.]+/g);
        point.x = Number(vals[0]);
        point.y = Number(vals[1]);
        points.push(point);
    }
    return points;
}

function refreshSpritePreview() {
    if (currentSelection.startsWith('sprite:')) {
        var sprite = sprites[currentSelection.substring('sprite:'.length)];
        spritePreviewCanvas.clear();
        spritePreviewCanvas.add(sprite.img);

        if (sprite.shape.type == 'box') {
            var rect = new fabric.Rect({
                left: sprite.width/2, top: sprite.height/2,
                width: sprite.shape.width,
                height: sprite.shape.height,
                originX: 'center', originY: 'center',
                fill: 'transparent',
                stroke: 'black', strokeWidth:2,
            });
            spritePreviewCanvas.add(rect);
        }
        else if (sprite.shape.type == 'circle') {
            var circle = new fabric.Circle({
                left: sprite.width/2, top:sprite.height/2,
                radius: sprite.shape.radius,
                originX: 'center', originY: 'center',
                fill: 'transparent',
                stroke: 'black', strokeWidth:2,
            });
            spritePreviewCanvas.add(circle);
        }
        else if (sprite.shape.type == 'polygon') {
            var circle = new fabric.Polygon(parsePoints(sprite.shape.points),{
                left: sprite.width/2, top:sprite.height/2,
                originX: 'center', originY: 'center',
                fill: 'transparent',
                stroke: 'black', strokeWidth:2,
            });
            spritePreviewCanvas.add(circle);
        }

        spritePreviewCanvas.renderAll();
    }
}

function selectSprite(target) {
    currentSelection = target;
    w2ui['layout'].content('preview', getContent(target));
    refreshSpritePreview();
}

$(function () {
    var pstyle = 'background-color: #F5F6F7; border: 1px solid #dfdfdf; padding: 5px;';
    var toolbar = '<div id="toolbar"></div>'
    var drawingContent = '<canvas id="c"  width="1200" height="350"></canvas>';
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
            { type: 'button', id: 'menu-load-project', caption: 'Load Project', icon: 'fa fa-share-square-o rotate-90-clockwise'},
            { type: 'button', id:'menu-save-project', caption:'Save Project', icon: 'fa fa-floppy-o'},
            { type: 'button', id:'menu-export', caption:'Export', icon:'fa fa-share-square-o'}
        ],
        onClick: function(event) {
            switch(event.target){
                case 'menu-load-project':
                    $('#open-file-dialog').trigger('click');
                    break;
                case 'menu-save-project':
                    var filename = prompt('Enter save file name', "Untitled");
                    saveProject(filename);
                    break;
                case 'menu-export':
                    var filename = prompt('Enter export file name', "Untitled");
                    exportProject(filename);
                    break;
            }
        }
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
            selectSprite(event.target);
        }
    });
    rightlayout = $().w2layout({
        name: 'right-layout',
        panels: [
            { type: 'top', size: '90%', resizable: true },
            { type: 'preview', size: '200px', style:pstyle, resizable: true },
            { type: 'bottom', size: '10%', resizable: true }
        ]
    });
    w2ui['right-layout'].content('top', rightSideBar);
    w2ui['right-layout'].content('bottom', '<label style="cursor:pointer"><i class="fa fa-plus"></i> Add Sprite<input style="display:none"type="file" id="sprite_file_selector" onchange="addSpriteFile()"></label>');
    w2ui['right-layout'].content('preview','<canvas id="canvas-sprite-preview" width="140px" height="140px"></canvas>');


    w2ui['layout'].content('right', rightlayout);


    var w1 = addWorld("World1");

    refreshSidebar();
    
    w2ui.layout.on('refresh', function(event) {
        event.onComplete = function() {
            canvas = new fabric.Canvas('c', {
                hoverCursor: 'pointer',
                selection: false
            });

            spritePreviewCanvas = new fabric.Canvas('canvas-sprite-preview');

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
        }
    });

    w2ui['layout'].refresh();
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
        fileInput.value = "";
        var sprite_name = prompt("Enter sprite's name.", "my_sprite");
        if (sprite_name == null)
            return;

        // TODO: check sprite name validity here: valid identified, if it already exists etc.

        addSprite(sprite_name, url);
        refreshSidebar();
    });
}


if (typeof String.prototype.startsWith != 'function') {
    String.prototype.startsWith = function (str){
        return this.indexOf(str) === 0;
    };
}

function onOpenFileDialogChange(){
    var fileInput = document.querySelector('#open-file-dialog');
    loadProject(fileInput.files[0]);
}

// prompt before user leaves the page
window.onbeforeunload = function() {
    return 'Any unsaved changes will be lost.';
}
