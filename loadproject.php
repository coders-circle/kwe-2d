<?php
    
    $filename = $_REQUEST['filename'];
    $fullpath = "projects/".$filename.'.json';
    $contents = file_get_contents($fullpath) or die('Invalid project: '.$filename);
    echo $contents;

?>
