
function openFileAsDataUrl(file, callback) {
    var reader = new FileReader();
    reader.onloadend = function() {
        var url = reader.result;
        callback(url);
    }

    if (file) {
        reader.readAsDataURL(file);
    }
}
