// Sidebars
var leftSideBar;
var rightSideBar
var canvas;
var spritePreviewCanvas;

var currentSelection;
var currentWorld; // Change this to change the world
var selectedComponent;

var canvasWidth = 2500;
var canvasHeight = 350;

var drawingPath = false;
var pathEntity;

// Refresh trees on the sidebars
function refreshSidebar() {
    leftSideBar.nodes = [];
    rightSideBar.nodes = [];

    var world = currentWorld;
    var enNodes = [];
    var elist = getEntities(worlds[world]);
    for (var entity of elist) {
        var enNode = { id: "entity:" + world+":"+entity, text: entity, icon: 'fa fa-paper-plane-o', nodes:[] };
        enNodes.push(enNode);
    }
    var node = { id: "world:" + world, text: world, icon: 'fa fa-folder', expanded:true, group:true, nodes: enNodes };
    leftSideBar.nodes.push(node);


    var spNodes = [];

    // for each sprite, add it to the right sidebar
    var slist = getSprites();
    for (var sprite of slist) {
        var spNode = { id: "sprite:" + sprite, text: sprite, icon: 'fa fa-file-image-o', nodes:[], expanded: true };
        spNodes.push(spNode);
    }

    rightSideBar.nodes = [
        { id: 'resource-sprites', text: 'Sprites', icon: 'fa fa-folder', expanded: true, group: true, nodes: spNodes }
    ];

    rightSideBar.onDblClick = function(event) {
        if (event.target.startsWith('sprite:')) {
            addNewEntity(event.target.substring("sprite:".length));
        }

    }

    leftSideBar.refresh();
    rightSideBar.refresh();

    $("#worlds").empty();
    $.each(worlds, function(key, value) {
        $("#worlds")
            .append($("<option></option>")
                .attr("value", key)
                .text(key)
            );
    });

    $("#worlds").val(currentWorld);

    if (currentSelection != undefined) {
        if (currentSelection.startsWith('sprite:')) {
            selectSprite(currentSelection.substring('sprite:'.length));
            rightSideBar.select(currentSelection);
        }
        else if (currentSelection.startsWith('entity')) {
            spritePreviewCanvas.clear();
            spritePreviewCanvas.renderAll();
            var names = currentSelection.substring("entity:".length).split(':');
            if (names[0] != currentWorld)
                w2ui['layout'].content('preview', '');
            else {
                w2ui['layout'].content('preview', getContent(currentSelection));
                leftSideBar.select(currentSelection);
            }
        }
        else {
            spritePreviewCanvas.clear();
            spritePreviewCanvas.renderAll();
            w2ui['layout'].content('preview', '');
        }
    }
}

// get the content to display in the bottom "Properties" pane
function getContent(id) {
    if (id.startsWith("sprite:"))
        return getSpriteContent(id);
    else if (id.startsWith("entity:"))
        return getEntityContent(id);
}

var resizePopup;
function resizeCanvas() {
    canvasWidth = Number($("#canvasWidth").val());
    canvasHeight = Number($("#canvasHeight").val());
    document.getElementById('c').width = canvasWidth;
    canvas.setWidth(canvasWidth);
    document.getElementById('c').height = canvasHeight;
    canvas.setHeight(canvasHeight);
    resizePopup.close();
    rerenderall();
}

$(function () {
    var pstyle = 'background-color: #F5F6F7; border: 1px solid #dfdfdf; padding: 5px;';
    var toolbar = '<div id="toolbar"></div>'
    var drawingContent = '<canvas id="c"  width="'+canvasWidth+'" height="'+canvasHeight+'"></canvas>';
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
            { type: 'button', id:'menu-export', caption:'Export', icon:'fa fa-share-square-o'},
            { type: 'break'},
            { type: 'html', html:' Project name: <input id="projectname">'},
            { type: 'break'},
            { type: 'html', html:' Worlds: <select id="worlds" oninput="changeWorld(this.value);"></select>'},
            { type: 'button', id:'add-world', icon: 'fa fa-plus', hint: 'Add new world'},
            { type: 'button', id:'remove-world', icon: 'fa fa-minus', hint: 'Remove world'},
            { type: 'button', id:'rename-world', icon: 'fa fa-file-text-o', hint: 'Rename world'},
            { type: 'break'},
            { type: 'button', id:'menu-resize-canvas', caption:'Resize Canvas', icon: 'fa fa-expand'}
        ],
        onClick: function(event) {
            switch(event.target){
                case 'menu-load-project':
                    loadDialog();
                    break;
                case 'menu-save-project':
                    saveProject();
                    break;
                case 'menu-export':
                    var filename = $("#projectname").val();
                    exportProject(filename);
                    break;
                case 'add-world':
                    addNewWorld();
                    break;
                case 'remove-world':
                    deleteWorld(currentWorld);
                    $("#worlds option[value='" + currentWorld + "']").remove();
                    currentWorld = $("#worlds").val();
                    refreshSidebar();
                    rerenderall();
                    break;
                case 'rename-world':
                    var exists = false;
                    do {
                        var newName = prompt('Enter new name for current world', currentWorld);
                        if (!newName || newName == currentWorld) {
                            return;
                        }
                        exists = existWorld(newName);
                        if (exists)
                            alert("World with that name already exists");
                    } while(exists);
                    renameWorld(currentWorld, newName);
                    currentWorld = newName;
                    refreshSidebar();
                    rerenderall();
                    break;
                case 'menu-resize-canvas':
                    var resizeDialogHtml = "<br/><div style='width:60%;margin:auto;text-align:right;'>"
                                          + "Width: <input id='canvasWidth' type='Number' value='" + canvasWidth + "'><br/>"
                                          +"<br/>Height: <input id='canvasHeight' type='Number' value='" + canvasHeight + "'><br/>"
                                          +"<br/><input style='' type='button' onclick='resizeCanvas()' value='Resize'></div>";
                    resizePopup = w2popup.open({
                        title: 'Resize canvas',
                        body: resizeDialogHtml,
                        height: '200',
                    });
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
            selectEntity(currentSelection, "sidebar");
        },
        topHTML: '<br/>&nbsp;<label style="cursor:pointer"><i class="fa fa-plus"></i><input style="display:none" type="button" id="entity_add" onclick="addNewEntity()"></label> &nbsp;&nbsp;'
            + '&nbsp;<label style="cursor:pointer"><i class="fa fa-minus"></i><input style="display:none" type="button" id="entity_delete" onclick="deleteSelectedEntity()"></label> &nbsp;&nbsp;'
            + '&nbsp;<label style="cursor:pointer"><i class="fa fa-file-text-o"></i><input style="display:none" type="button" id="entity_rename" onclick="renameSelectedEntity()"></label>',
    });
    w2ui['layout'].content('left', leftSideBar);

    rightSideBar = $().w2sidebar({
        name: 'sidebar-right',
        img: null,
        nodes: [],
        onClick: function (event) {
            selectSprite(event.target);
        },
        topHTML: '<br/>&nbsp;<label style="cursor:pointer"><i class="fa fa-plus"></i><input style="display:none"type="file" id="sprite_file_selector" onchange="addSpriteFile()"></label> &nbsp;&nbsp;'
            + '&nbsp;<label style="cursor:pointer"><i class="fa fa-minus"></i><input style="display:none" type="button" id="sprite_delete" onclick="deleteSelectedSprite()"></label> &nbsp;&nbsp;'
            + '&nbsp;<label style="cursor:pointer"><i class="fa fa-file-text-o"></i><input style="display:none" type="button" id="sprite_rename" onclick="renameSelectedSprite()"></label>',
    });
    rightlayout = $().w2layout({
        name: 'right-layout',
        panels: [
            { type: 'top', size: '50%', resizable: true },
            { type: 'main', },
        ]
    });

    w2ui['right-layout'].content('top', rightSideBar);
    w2ui['right-layout'].content('main','<canvas id="canvas-sprite-preview" style="width:100%;" height="140px"></canvas>');


    w2ui['layout'].content('right', rightlayout);


    currentWorld = getNewWorldName(1);
    var w1 = addWorld(currentWorld);

    refreshSidebar();

    w2ui['right-layout'].on('refresh', function(event) {
        event.onComplete = function() {
            spritePreviewCanvas = new fabric.StaticCanvas('canvas-sprite-preview');
        }
    });

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
                selectEntity(currentSelection, "canvas");
                //w2ui['layout'].content('preview', getContent(currentSelection));

                //spritePreviewCanvas.clear();
                //spritePreviewCanvas.renderAll();
            }
        },
        'object:modified': function(e) {
            e.target.opacity = 1;

            if (e.target.entity != undefined) {
                var tcomp = e.target.entity.components["Transformation"];
                if (tcomp) {
                    tcomp["Translate-X"] = e.target.left;
                    tcomp["Translate-Y"] = e.target.top;
                    tcomp["Scale-X"] = e.target.scaleX;
                    tcomp["Scale-Y"] = e.target.scaleY;
                    tcomp["Angle"] = e.target.angle;
                }

                if (currentSelection != undefined)
                    w2ui['layout'].content('preview', getContent(currentSelection));
            }
        },
        'mouse:up': function(e) {
            if (drawingPath && pathEntity && "Path" in pathEntity.components) {
                var path = pathEntity.components.Path;
                var point = canvas.getPointer(e.e);
                if (e.e.shiftKey) {
                    var points = parsePoints(path.Points);
                    path.Points = "";
                    for (var p of points) {
                        if (Math.abs(p.x-point.x)>5 || Math.abs(p.y-point.y)>5)
                            path.Points = path.Points + "(" + p.x + "," + p.y+") ";
                    }
                }
                else {
                    path.Points = path.Points + "(" + point.x + "," + point.y + ") ";
                }
                rerenderall();
                if (currentSelection == 'entity:' + currentWorld+':'+pathEntity.name)
                    selectEntity(currentSelection);
            }
        }
    });
    rerenderall();

    $('#projectname').val("untitled");
});

function rerenderall() {
    canvas.clear();

    for (var entityName in worlds[currentWorld].entities) {
        var entity = worlds[currentWorld].entities[entityName];

        if ("Sprite" in entity.components && "Transformation" in entity.components) {
            createImage(entity);
        }
        else if ("Path" in entity.components)
            createPath(entity);
    }

    canvas.renderAll();
}

function onOpenFileDialogChange(){
    var fileInput = document.querySelector('#open-file-dialog');
    loadProject(fileInput.files[0]);
}

// prompt before user leaves the page
window.onbeforeunload = function() {
    return 'Any unsaved changes will be lost.';
}
