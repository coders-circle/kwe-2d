function saveProject() {
    var filename = $("#projectname").val();
    var data = { "components": components, "sprites":sprites, "worlds":worlds };
    var text = JSON.stringify(data);

    $.post("saveproject.php", {filename:filename, data:text}, 
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
                    reloadSprites();
                    worlds = result.worlds;
                    refreshSidebar();
                    rerenderall();

                    $("#projectname").val(filename);
                } catch(e) {
                    alert("Error loading project: " + filename);
                }
            }
        });
}

var loadpopup;
function loadDialog() {
    $.post("listprojects.php", function(data) {
        loadpopup = w2popup.open({
            title : 'Load Project',
            body: data
        });
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


