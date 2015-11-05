<?php

    $filename = $_REQUEST['filename'];
    $fullpath = "projects/".$filename.'.json';
    try {
        $fh = fopen($fullpath, 'w');
        fwrite($fh, $_REQUEST['data']);
        fclose($fh);
    } catch (Exception $e) {
        die("Couldn't save project");
    }
    
    echo 'Saved succesfully: '.$filename;
?>
