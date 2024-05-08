<?php

namespace App;

class ClientError extends \Exception
{
    public function __construct($code)
    {
        parent::__construct($this->errorResponses($code));
    }
 // List of the HTML error reponse codes
    public function errorResponses($code)
    {
        switch ($code) {
            case 404:
                $message = 'Endpoint Not Found';
                http_response_code(404);
                break;
            case 405:
                $message = 'Method Not Allowed';
                http_response_code(405);
                break;
            case 422:
                $message = 'Unprocessable Entity';
                http_response_code(422);
                break;
            case 401:
                $message = 'Unauthorised Access';
                http_response_code(401);
                break;
            case 409:
                $message = 'User exists';
                http_response_code(409);
                break;
                case 400:
                $message = 'Bad Request';
                http_response_code(400);
                break;
            default:
                throw new \Exception('Unknown Error Code');
        }
        return $message;
    }
}


?>