<?php
namespace App\EndpointControllers;

/**
 * Token endpoint accepts a username and password that is in the database. It will return a JWT if they are valid and will not return one if it isnt and the token will expire after 30 mins. 
 * Params are that the username and password are transmitted via authorisation headers
 * @author Ryan Field
 */

use Firebase\JWT\JWT;

class Token extends Endpoint
{
    private $sql = "SELECT id, password FROM account WHERE email = :email";
    private $sqlParams = [];

    public function __construct()
    {
        switch (\App\Request::method()) {
            case 'GET':
            case 'POST':
                $this->checkAllowedParams();

                $dbConn = new \App\Database(USER_DATABASE);

                //Checks if the user and password are set and throws a 401 error if not. 
                if (!isset($_SERVER['PHP_AUTH_USER']) || !isset($_SERVER['PHP_AUTH_PW'])) {
                    throw new \App\ClientError(401);
                }

                if (empty(trim($_SERVER['PHP_AUTH_USER'])) || empty(trim($_SERVER['PHP_AUTH_PW']))) {
                    throw new \App\ClientError(401);
                }

                //Sets the email parameter for the SQL query and executes to receive it. 
                $dbConn = new \App\Database(USER_DATABASE);
                $this->sqlParams[":email"] = $_SERVER['PHP_AUTH_USER'];
                $data = $dbConn->executeSQL($this->sql, $this->sqlParams);

                //Checks if 1 user is found
                if (count($data) != 1) {
                    throw new \App\ClientError(401);
                }
                //Verifies the password against the hashed password in the database
                if (!password_verify($_SERVER['PHP_AUTH_PW'], $data[0]['password'])) {
                    throw new \App\ClientError(401);
                }
                // Calls the JWT based on the user id and constructs an array
                $token = $this->generateJWT($data[0]['id']);
                $data = ['token' => $token];

                parent::__construct($data);
                break;
            default:
                throw new \App\ClientError(405);
                break;
        }
    }
//Method for generating a JWT and uses the JWT class to encode a payload with the user ID, expiration time, issued time and issuer
    private function generateJWT($id)
    {
        $secretKey = SECRET;
        $payload = [
            'sub' => $id,
            'exp' => strtotime('+1440 mins'),
            'iat' => time(),
            'iss' => $_SERVER['HTTP_HOST']
        ];

        $jwt = JWT::encode($payload, $secretKey, 'HS256');

        return $jwt;
    }
}
?>