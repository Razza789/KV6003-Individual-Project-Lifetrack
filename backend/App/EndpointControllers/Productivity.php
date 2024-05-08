<?php
namespace App\EndpointControllers;

use App\Database;
use Firebase\JWT\JWT;
use App\ClientError;

class Productivity extends Endpoint
{
    private $dbConn;

    public function __construct()
    {
        $this->dbConn = new Database(INFO_DATABASE);
        $userId = $this->validateToken();

        switch (\App\Request::method()) {
            case 'POST':
                $inputData = json_decode(file_get_contents('php://input'), true);
                $description = $inputData['description'] ?? '';
                $time_started = $inputData['time_started'] ?? '';
                $time_completed = $inputData['time_completed'] ?? '';

                if (empty($description) || empty($time_started) || empty($time_completed)) {
                    throw new ClientError(400, "Invalid input");
                }

                $insertSql = "INSERT INTO productivity (description, time_started, time_completed, user_id) VALUES (:description, :time_started, :time_completed, :user_id)";
                $this->dbConn->executeSQL($insertSql, [
                    ':description' => $description,
                    ':time_started' => $time_started,
                    ':time_completed' => $time_completed,
                    ':user_id' => $userId
                ]);

                $data = ['message' => 'Productivity session created successfully'];
                parent::__construct($data);
                break;
            case 'GET':
                $selectSql = "SELECT * FROM productivity WHERE user_id = :user_id";
                $sessions = $this->dbConn->executeSQL($selectSql, [':user_id' => $userId]);

                $data = ['sessions' => $sessions];
                parent::__construct($data);
                break;
            default:
                throw new ClientError(405, "Method not allowed");
                break;
        }
    }

    // Validates the JWT token and returns the user ID
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
}
?>
