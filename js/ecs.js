
var components = {
                    "Sprite": { "Sprite":[] }, 
                    "Transformation": { "Translate-X":0.0, "Translate-Y":0.0, "Scale-X":1.0, "Scale-Y":1.0, "Angle":0.0 },
                    "BoxShape": { "Width": 0.0, "Height": 0.0 },
                    "PolygonShape": { "Points": "" },
                    "RigidBody": { "Density": 0.0, "Friction":0.2, "Restitution":0 },

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
    sprites[sprite_name] = { "file": file_name, "width": 64, "height": 64 };
    components["Sprite"]["Sprite"].push(sprite_name);
}

function addWorld(world_name) {
    var world = { "entities": {}, };
    worlds[world_name] = world;
    return world;
}

function addEntity(world, entity_name) {
    var entity = { "components": {}, "name":entity_name };
    world.entities[entity_name] = entity;
    return entity;
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

    if (component_name == "BoxShape" && "Sprite" in entity.components) {
        var sprite = sprites[entity.components["Sprite"]["Sprite"]];
        newcomponent["Width"] = sprite.width;
        newcomponent["Height"] = sprite.height;
    }

    entity.components[component_name] = newcomponent;
}

function delComponent(entity, component_name) {
    if (component_name in entity.components)
        delete entity.components[component_name];
}
