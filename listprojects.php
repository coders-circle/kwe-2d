
<div style="width:60%;margin:auto;">
<br/>
<select id="projectlist" size="10" style="width:100%;">
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
<input id="dialogloadbutton" type="button" value="Load" onclick="loadProject($('#projectlist').val());loadpopup.close();">
</div>
