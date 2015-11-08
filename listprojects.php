
<div style="width:60%;margin:auto;">
<br/>
<select id="projectlist" size="10" style="width:100%;" ondblclick='loadSelectedProject()'>
<?php
    $dir = "projects";
    $files = glob($dir."/*.json");

    foreach ($files as $f) {
        $path = pathinfo($f);
        $name = $path["filename"];
        echo "<option value=".$name.">".$name."</option>";
    }
?>
</select>
<br/><br/>
<input id="dialogloadbutton" type="button" value="Load" onclick="loadSelectedProject()">
</div>

<script>
function loadSelectedProject() {
    loadProject($('#projectlist').val());loadpopup.close();
}
</script>
