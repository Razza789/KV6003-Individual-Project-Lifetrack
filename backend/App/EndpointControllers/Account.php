<?php
namespace App\EndpointControllers;

use App\Database;
use Firebase\JWT\JWT;
use App\ClientError;

class Account extends Endpoint
{

        private $dbConn;
    
        public function __construct()
        {
            $this->dbConn = new Database(USER_DATABASE);
            $userId = $this->validateToken();
    
            switch (\App\Request::method()) {
                case 'GET':
                    // Fetch and return user's account settings
                    $data = $this->getAccountSettings($userId);
                    parent::__construct($data);
                    break;
                
                case 'PUT':
                    // Update user's account settings
                    $this->updateAccountSettings($userId);
                    break;
                
                case 'DELETE':
                    // Delete user's account settings or account
                    $this->deleteAccount($userId);
                    break;
                
                default:
                    throw new ClientError(405, "Method not allowed");
                    break;
            }
        }

    private function validateToken()
    {
        $dbConn = new \App\Database(USER_DATABASE);
        $secretKey = SECRET; // Your actual secret key
        $jwt = \App\Request::getBearerToken();

        if (!$jwt) {
            throw new ClientError(401, "No token provided");
        }

        try {
            $decodedJWT = JWT::decode($jwt, new \Firebase\JWT\Key($secretKey, 'HS256'));
        } catch (\Exception $e) {
            throw new ClientError(401, "Invalid token");
        }

        if (!isset($decodedJWT->exp) || !isset($decodedJWT->sub) || $decodedJWT->exp < time()) {
            throw new ClientError(401, "Invalid token");
        }

        // Check if user exists in the database
        $checkUserSql = "SELECT id FROM account WHERE id = :user_id";
        $userExists = $dbConn->executeSQL($checkUserSql, [':user_id' => $decodedJWT->sub]);

        if (empty($userExists)) {
            throw new ClientError(404, "User not found");
        }

        return $decodedJWT->sub;
    }

    private function getAccountSettings($userId)
    {
        // SQL query to get user settings
        $query = "SELECT * FROM account WHERE id = :user_id";
        $result = $this->dbConn->executeSQL($query, [':user_id' => $userId]);
        
        // Check if the user exists
        if (!empty($result)) {
            return $result[0]; // Return the first (and only) item if available
        } else {
            throw new ClientError(404, "User settings not found");
        }
    }

    private function updateAccountSettings($userId)
    {
        // Get the input data
        $inputData = \App\Request::getJsonPayload();
    
        // Update the account details
        $updateParams = [
            ':first_name' => $inputData['first_name'],
            ':last_name' => $inputData['last_name'],
            ':email' => $inputData['email'],
            ':phone_number' => $inputData['phone_number'],
            ':user_id' => $userId
        ];
        
        // Initialize the SQL query
        $query = "UPDATE account SET first_name = :first_name, last_name = :last_name, email = :email, phone_number = :phone_number";
        
        // Check if a new password is provided
        if (!empty($inputData['password'])) {
            // Hash the new password
            $passwordHash = password_hash($inputData['password'], PASSWORD_DEFAULT);
            $query .= ", password = :password";
            $updateParams[':password'] = $passwordHash;
        }
    
        $query .= " WHERE id = :user_id";
        
        // Execute the SQL query
        $this->dbConn->executeSQL($query, $updateParams);
    
        parent::__construct(['message' => 'Account settings updated successfully']);
    }

    private function deleteAccount($userId)
    {
        // SQL query to delete the user account
        $query = "DELETE FROM account WHERE id = :user_id";
        $this->dbConn->executeSQL($query, [':user_id' => $userId]);

        parent::__construct(['message' => 'Account deleted successfully']);
    }
}
?>
