<?php

namespace App;

//Router for the endpoints and allows the user to type the endpoint into the url without needing to have the starting letter as a capital letter
abstract class Router
{
    public static function routeRequest()
    {
        try {
            switch (\App\Request::endpointName()) {
                case 'token': 
                    $endpoint = new \App\EndpointControllers\Token();
                    break;
                case 'signup': 
                    $endpoint = new \App\EndpointControllers\SignUp();
                    break;
                case 'dietary': 
                    $endpoint = new \App\EndpointControllers\Dietary();
                    break;
                case 'financial': 
                    $endpoint = new \App\EndpointControllers\FinancialData();
                    break;
                case 'productivity': 
                    $endpoint = new \App\EndpointControllers\Productivity();
                    break;
                case 'account': 
                    $endpoint = new \App\EndpointControllers\Account();
                    break;                    
                default:
                    throw new \App\ClientError(404, "Endpoint Not Found");
            }
        } catch (\App\ClientError $e) {
            $data['message'] = $e->getMessage();
            $endpoint = new \App\EndpointControllers\Endpoint($data);
        }
        return $endpoint;
     }
}

?>