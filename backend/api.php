<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);



include 'config/exceptionHandler.php';
set_exception_handler('exceptionHandler');
 
include("config/autoloader.php");
spl_autoload_register("autoloader");

include 'config/settings.php';

$response = new App\Response();
$endpoint = App\Router::routeRequest();
$data = $endpoint->getData();
$response->outputJSON($data);
?>