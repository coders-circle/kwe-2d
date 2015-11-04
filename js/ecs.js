
var components = {
                    "Sprite": { "Sprite":[] }, 
                    "Transformation": { "Translate-X":0.0, "Translate-Y":0.0, "Scale-X":1.0, "Scale-Y":1.0, "Angle":0.0 },
//                     "BoxShape": { "Width": 0.0, "Height": 0.0 },
//                     "PolygonShape": { "Points": "" },
                    "RigidBody": { "Type":["Static", "Dynamic", "Kinematic"], "Density": 0.0, "Friction":0.2, "Restitution":0 },

                    // Definition is of form:
                    // "Component-Name": { "Property-Name": "Property-Type", "Choice-Property": [ "Value1", "Value2", ...], ... },
                 };

var sprites = {};

var worlds = {};

function saveProject() {
    var filename = $("#projectname").val();
    var data = { "components": components, "sprites":sprites, "worlds":worlds };
    var text = JSON.stringify(data);

    $.post("upload.php", {filename:filename, data:text}, 
        function(data) {
            alert(data);
        });

    //var blob = new Blob([text], {type: "application/json"});
    //var url  = URL.createObjectURL(blob);
    //
    //var a = document.createElement('a');
    //a.download    = filename + ".json";
    //a.href        = url;
    //a.click();
}

function exportProject(filename) {
    newsprites = {};
    for (s in sprites) {
        spr = {}
        for (k in sprites[s]) {
            if (k != "file" && k != "img")
                spr[k] = sprites[s][k];
        }
        newsprites[s] = spr;
    }

    newworlds = {};
    for (w in worlds) {
        wld = {};
        for (k in worlds[w]) {
            if (k == "entities") {
                wld[k] = {}
                for (e in worlds[w][k]) {
                    newe = {};
                    for (ek in worlds[w][k][e])
                        if (ek != "img")
                            newe[ek] = worlds[w][k][e][ek];
                    wld[k][e] = newe;
                }
            }
            else
                wld[k] = worlds[w][k];
        }
        newworlds[w] = wld;
    }

    data = { "sprites":newsprites, "worlds":newworlds };
    text = JSON.stringify(data);
    var blob = new Blob([text], {type: "application/json"});
    var url  = URL.createObjectURL(blob);
    
    var a = document.createElement('a');
    a.download    = filename + ".json";
    a.href        = url;
    a.click();
}

function loadProject(filename) {
    $.post("loadproject.php", {filename:filename}, 
        function(data) {
            if (data.startsWith("Invalid"))
                alert(data);
            else {
                try {
                    var result = JSON.parse(data);
        
                    components = result.components;
                    sprites = result.sprites;
                    worlds = result.worlds;
                    refreshSidebar();
                    rerenderall();

                    $("#projectname").val(filename);
                } catch(e) {
                    alert("Error loading project");
                }
            }
        });
}

//function loadProject(file) {
//    var reader = new FileReader();
//    reader.onload = function() {
//        var result = JSON.parse(reader.result);
//
//        components = result.components;
//        sprites = result.sprites;
//        worlds = result.worlds;
//        refreshSidebar();
//        rerenderall();
//    }
//    reader.readAsText(file);
//}

function loadCDF(jsonFile) {
    var reader = new FileReader();
    reader.onload = function(){
        var result = JSON.parse(reader.result);
        components = components.concat(result);
    }
    reader.readAsText(jsonFile);
}

function addSprite(sprite_name, file_name) {
    var sprite = { "file": file_name, "width": 64, "height": 64,
                             "shape":{"type":"box", "width":64, "height":64} };
    components["Sprite"]["Sprite"].push(sprite_name);
    //sprite.img = new Image;
    //sprite.onload = function() {
    //    sprite.width = this.width;
    //    sprite.height = this.height;
    //    sprite.shape.width = this.width;
    //    sprite.shape.height = this.height;
    //}
    //sprite.src = file_name;
    fabric.Image.fromURL(file_name, function(img) {
        sprite.img = img;
        var w = img.getWidth();
        var h = img.getHeight();
        sprite.width = w;
        sprite.height = h;
        sprite.shape.width = w;
        sprite.shape.height = h;
        sprite.shape.radius = (w>h)?w/2:h/2;
        sprite.shape.points = "(0,0), (0,"+h+"), ("+w+","+h+"), ("+w+",0)";
    });
    sprites[sprite_name] = sprite;
}

function deleteSprite(sprite_name) {
    delete sprites[sprite_name];
}

function addWorld(world_name) {
    var world = { "entities": {}, };
    worlds[world_name] = world;
    return world;
}

function deleteWorld(world_name) {
    delete worlds[world_name];
}

function addEntity(world, entity_name) {
    var entity = { "components": {}, "name":entity_name };
    world.entities[entity_name] = entity;
    return entity;
}

function deleteEntity(world, entity_name) {
    delete world.entities[entity_name];
}

// add an entity with sprite and transformation
function addSpriteEntity(world, entity_name, sprite_name, spritesheet) {
    var sprite = sprites[sprite_name];
    var spritecomp = { "Sprite":sprite_name };
//     if (spritesheet)
//         spritecomp["Spritesheet data"] =
//             {
//                 "offset-x":0, "offset-y":0, "hspace":0, "vspace":0, "num-rows":1, "num-cols":1,
//                 "img-width":sprite.width, "img-height":sprite.height
//             };

    var transcomp = {"Translate-X":sprite.width/2, "Translate-Y":sprite.height/2, "Scale-X":1, "Scale-Y":1, "Angle":0};

    var entity = { "components": {"Sprite":spritecomp, "Transformation":transcomp}, "name":entity_name };
    world.entities[entity_name] = entity;

    addComponent(entity, "RigidBody");
    return entity;
}

function addComponent(entity, component_name) {
    var component = components[component_name];

    var newcomponent = {};
    for (var prop in component) {
        var value = component[prop];
        if (Array.isArray(component[prop].isArray))
            value = component[prop][0];

        newcomponent[prop] = value;
    }

    entity.components[component_name] = newcomponent;
}

function delComponent(entity, component_name) {
    if (component_name in entity.components)
        delete entity.components[component_name];
}
