<?php
namespace App\EndpointControllers;

use App\Database;
use Firebase\JWT\JWT;
use App\ClientError;

class Dietary extends Endpoint
{
    public function __construct()
    {
        // First, validate the JWT token
        $userId = $this->validateToken();

        $dbConn = new Database(INFO_DATABASE);

        switch (\App\Request::method()) {
            case 'POST':
                // Handle POST request to insert new calorie intake record
                $inputData = json_decode(file_get_contents('php://input'), true);
                $caloriesAte = $inputData['calories_ate'] ?? null;
                $notes = $inputData['notes'] ?? null;

                if (empty($caloriesAte)) {
                    throw new ClientError(400, "Invalid input");
                }

                $insertSql = "INSERT INTO dietary (user_id, calories_ate, date_added, notes) VALUES (:user_id, :calories_ate, datetime('now'), :notes)";
                $dbConn->executeSQL($insertSql, [
                    ':user_id' => $userId,
                    ':calories_ate' => $caloriesAte,
                    ':notes' => $notes
                ]);

                $data = ['message' => 'Calorie intake record created successfully'];
                parent::__construct($data);
                break;
            case 'GET':
                // Handle GET request to retrieve calorie intake records
                $selectSql = "SELECT * FROM dietary WHERE user_id = :user_id ORDER BY date_added DESC";
                $records = $dbConn->executeSQL($selectSql, [':user_id' => $userId]);

                $data = ['records' => $records];
                parent::__construct($data);
                break;
            default:
                throw new ClientError(405, "Method not allowed");
                break;
        }
    }

    // Include your JWT validation method
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
