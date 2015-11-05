
function changeWorld(world) {
    currentWorld = world;
    refreshSidebar();
    rerenderall();
}

function addNewEntity(spr) {
    var exists;
    do {
        var entity_name = prompt("Enter new entity name.", getNewEntityName(1));
        if (entity_name == null)
            return;
        
        // TODO: check entity name validity here

        exists = existEntity(entity_name);
        if (exists)
            alert("Couldn't add, entity name already exists");
    } while (exists);
    
    addSpriteEntity(worlds[currentWorld], entity_name, spr);
    refreshSidebar();
    rerenderall();
}

function addNewWorld() {
    var exists;
    do {
        var world_name = prompt("Enter new world name.", getNewWorldName(1));
        if (world_name == null)
            return;
        
        // TODO: check world name validity here

        exists = existWorld(world_name);
        if (exists)
            alert("Couldn't add, world name already exists");
    } while (exists);
    
    addWorld(world_name);
    refreshSidebar();
    rerenderall();
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

function getEntityContent(id) {
    var content = "";
    // for the entity, display the components

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

    return content;
}

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
            // lockScalingX: true,
            // lockScalingY: true,
        });

        img.entity = entity;
        entity.img = img;
        canvas.add(img);
    });
}
