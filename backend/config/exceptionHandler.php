<?php
 
function exceptionHandler($e) {
   $output['message'] = "Internal Server Error";
   $output['details']['exception'] = $e->getMessage();
   $output['details']['file'] = $e->getFile();
   $output['details']['line'] = $e->getLine();
   echo json_encode($output);
   exit();
}
?>