

if (typeof String.prototype.startsWith != 'function') {
    String.prototype.startsWith = function (str){
        return this.indexOf(str) === 0;
    };
}


function existSprite(sprite_name) {
    for (var s in sprites)
        if (s == sprite_name)
            return true;

    return false;
}

function existEntity(entity_name) {
    for (var e in worlds[currentWorld].entities)
        if (e == entity_name)
            return true;
    return false;
}

function existWorld(world_name) {
    for (var w in worlds)
        if (w == world_name)
            return true;
    return false;
}

function getNewSpriteName(i) {
    var name = "sprite" + i;
    if (existSprite(name))
        name = getNewSpriteName(i+1);
    return name;
}

function getNewEntityName(i) {
    var name = "entity" + i;
    if (existEntity(name))
        name = getNewEntityName(i+1);
    return name;
}

function getNewWorldName(i) {
    var name = "world" + i;
    if (existWorld(name))
        name = getNewWorldName(i+1);
    return name;
}


function parsePoints(pstr) {
    points = [];
    pstr_array = pstr.match(/\([\-|\d|\.|,]*\)/g);
    for (var i in pstr_array) {
        var str = pstr_array[i];
        var point = {x:0, y:0};
        
        vals = str.match(/[\-|\d|\.]+/g);
        point.x = Number(vals[0]);
        point.y = Number(vals[1]);
        points.push(point);
    }
    return points;
}
