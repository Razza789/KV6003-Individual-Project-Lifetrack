<?php
namespace App\EndpointControllers;

use App\Database;
use Firebase\JWT\JWT;
use App\ClientError;

class FinancialData extends Endpoint
{
    public function __construct()
    {
        // Validate the JWT token and get the user ID
        $userId = $this->validateToken();

        $dbConn = new Database(INFO_DATABASE);

        switch (\App\Request::method()) {
            case 'POST':
                // Handle POST request to insert new financial data record
                $inputData = json_decode(file_get_contents('php://input'), true);
                $description = $inputData['description'] ?? null;
                $amountSpent = $inputData['amount_spent'] ?? null;
                $dateMade = $inputData['date_made'] ?? null;

                if (empty($description) || empty($amountSpent) || empty($dateMade)) {
                    throw new ClientError("Invalid input");
                }

                $insertSql = "INSERT INTO financial_info (user_id, description, amount_spent, date_made) VALUES (:user_id, :description, :amount_spent, :date_made)";
                $dbConn->executeSQL($insertSql, [
                    ':user_id' => $userId,
                    ':description' => $description,
                    ':amount_spent' => $amountSpent,
                    ':date_made' => $dateMade
                ]);

                $data = ['message' => 'Financial data record created successfully'];
                parent::__construct($data);
                break;
            case 'GET':
                // Handle GET request to retrieve financial data records
                $selectSql = "SELECT * FROM financial_info WHERE user_id = :user_id ORDER BY date_made DESC";
                $records = $dbConn->executeSQL($selectSql, [':user_id' => $userId]);

                $data = ['records' => $records];
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
