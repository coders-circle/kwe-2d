
function addSpriteFile() {
    var fileInput = document.querySelector('#sprite_file_selector');
    var file = fileInput.files[0];
    openFileAsDataUrl(file, function(url) {
        fileInput.value = "";
        var exists;
        do {
            var sprite_name = prompt("Enter sprite's name.", getNewSpriteName(1));
            if (sprite_name == null)
                return;
            
            // TODO: check sprite name validity here

            exists = existSprite(sprite_name);
            if (exists)
                alert("Sprite name already exists");
        } while (exists);


        addSprite(sprite_name, url);
        refreshSidebar();
    });
}

function deleteSelectedSprite() {
    //var target = rightSideBar.selected;
    var target = currentSelection;
    if (target.startsWith('sprite:')) {
        deleteSprite(target.substring('sprite:'.length));

        currentSelection = "";

        refreshSidebar();
        rerenderall();
    }
}

function renameSelectedSprite() {
    var target = currentSelection;
    if (target.startsWith('sprite:')) {
        var names = target.substring('sprite:'.length);
        var exists;
        do {
            var sprite_name = prompt("Enter new sprite name.", names);
            if (sprite_name == null || sprite_name == names)
                return;
            
            // TODO: check sprite name validity here

            exists = existSprite(sprite_name);
            if (exists)
                alert("Sprite name already exists");
        } while (exists);
        
        renameSprite(names, sprite_name);
        currentSelection = 'sprite:'+sprite_name;

        refreshSidebar();
        rerenderall();
    }
}

function getSpriteContent(id) {
    var content = "";
    // for the sprite, display the collision shape properties
    
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
