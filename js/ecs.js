
var components = {
                    "Sprite": { "Sprite":[] }, 
                    "Transformation": { "Translate-X":0.0, "Translate-Y":0.0, "Scale-X":1.0, "Scale-Y":1.0, "Angle":0.0 },
                    "RigidBody": { "Type":["Static", "Dynamic", "Kinematic"], "Density": 0.0, "Friction":0.2, "Restitution":0 },

                    // Definition is of form:
                    // "Component-Name": { "Property-Name": "Property-Type", "Choice-Property": [ "Value1", "Value2", ...], ... },
                 };

var sprites = {};

var worlds = {};

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
    components["Sprite"]["Sprite"].sort();
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

function renameSprite(currentName, newName) {
    sprites[newName] = sprites[currentName];
    delete sprites[currentName];

    components["Sprite"]["Sprite"].splice(components["Sprite"]["Sprite"].indexOf(currentName), 1);
    components["Sprite"]["Sprite"].push(newName);
    components["Sprite"]["Sprite"].sort();
    for (var w in worlds)
        for (var e in worlds[w].entities) {
            var entity = worlds[w].entities[e];
            if ("Sprite" in entity.components  && entity.components.Sprite.Sprite == currentName) 
                entity.components.Sprite.Sprite = newName;
        }
}

function reloadSpriteImage(sprite) {
    fabric.Image.fromURL(sprite.file, function(img) {
        sprite.img = img;
    });
}

function reloadSprites() {
    for (var s in sprites) {
        var sprite = sprites[s];
        reloadSpriteImage(sprite);
    }
}

function getSprites() {
    var list = [];
    for (var s in sprites)
        list.push(s);
    list.sort();
    return list;
}

function addWorld(world_name) {
    var world = { "entities": {}, };
    worlds[world_name] = world;
    return world;
}

function deleteWorld(world_name) {
    delete worlds[world_name];
}

function renameWorld(currentName, newName) {
    if (currentName != newName) {
        worlds[newName] = worlds[currentName];
        delete worlds[currentName];
    }
}

function addEntity(world, entity_name) {
    var entity = { "components": {}, "name":entity_name };
    world.entities[entity_name] = entity;
    return entity;
}

function deleteEntity(world, entity_name) {
    delete world.entities[entity_name];
}

function renameEntity(world, currentName, newName) {
    if (currentName != newName) {
        world.entities[newName] = world.entities[currentName];
        world.entities[newName].name = newName;
        delete world.entities[currentName];
    }
}

function getEntities(world) {
    var list = [];
    for (var e in world.entities)
        list.push(e);
    list.sort();
    return list;
}

// add an entity with sprite and transformation
function addSpriteEntity(world, entity_name, sprite_name, spritesheet) {
    var sprite = sprites[sprite_name];
    var spritecomp = { "Sprite":sprite_name };

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
