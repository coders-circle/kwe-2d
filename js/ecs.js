
var components = {
                    "Sprite": { "Sprite":[] }, 
                    "Transformation": { "Translate-X":"Number", "Translate-Y":"Number", "Scale-X":"Number", "Scale-Y":"Number", "Angle":"Number" },

                    // Definition is of form:
                    // "Component-Name": { "Property-Name": "Property-Type", "Choice-Property": [ "Value1", "Value2", ...], ... },
                 };

var sprites = {};

var worlds = {};

function loadCDF(jsonFile) {
    var reader = new FileReader();
    reader.onload = function(){
        result = JSON.parse(reader.result);
        all_components = all_components.concat(result);
    }
    reader.readAsText(jsonFile);
}

function addSprite(sprite_name, file_name) {
    sprites[sprite_name] = { "file": file_name };
    components["Sprite"]["Sprite"].push(sprite_name);
}

function addWorld(world_name) {
    world = { "entities": {}, };
    worlds[world_name] = world;
    return world;
}

function addEntity(world, entity_name) {
    entity = { "components": {} };
    world.entities[entity_name] = entity;
    return entity;
}

// add an entity with sprite and transformation
function addSpriteEntity(world, entity_name, sprite_name, spritesheet) {
    sprite = sprites[sprite_name];
    spritecomp = { "Sprite":sprite_name };
    if (spritesheet)
        spritecomp["Spritesheet data"] =
            {
                "offset-x":0, "offset-y":0, "hspace":0, "vspace":0, "num-rows":1, "num-cols":1,
                "img-width":sprite.width, "img-height":sprite.height
            };

    transcomp = {"Translate-X":0, "Translate-Y":0, "Scale-X":1, "Scale-Y":1, "Angle":0};

    entity = { "components": {"Sprite":spritecomp, "Transformation":transcomp} };
    world.entities[entity_name] = entity;
    return entity;
}

function addComponent(entity, component_name) {
    component = components[component_name];

    newcomponent = {};
    for (prop in component) {
        value = "";
        if (component[prop] == "Number")
            value = 0.0;
        else if (Array.isArray(component[prop].isArray))
            value = component[prop][0];

        newcomponent[prop] = value;
    }
    entity.components[component_name] = newcomponent;
}
