<?php
namespace App\EndpointControllers;

use App\Database;
use App\ClientError;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class SignUp extends Endpoint

{
    private Database $dbConn;
    public function __construct()
    {
        $this->dbConn = new Database(USER_DATABASE);
        switch (\App\Request::method()) {
            case 'POST':
            case 'GET':
                $inputData = json_decode(file_get_contents('php://input'), true);
                $first_name = $inputData['first_name'] ?? '';
                $last_name = $inputData['last_name'] ?? '';
                $email = $inputData['email'] ?? '';
                $phone_number = $inputData['phone_number'] ?? '';
                $password = $inputData['password'] ?? '';

                if (empty($first_name) || empty($last_name) || empty($email) || empty($phone_number) || empty($password)) {
                    throw new ClientError(400, "Invalid input");
                }

                $passwordHash = password_hash($password, PASSWORD_DEFAULT);
                $insertUserSql = "INSERT INTO account (first_name, last_name, email, phone_number, password) VALUES (:first_name, :last_name, :email, :phone_number, :password)";
                
                $dbConn = new Database(USER_DATABASE);
                $dbConn->executeSQL($insertUserSql, [
                    ':first_name' => $first_name,
                    ':last_name' => $last_name,
                    ':email' => $email,
                    ':phone_number' => $phone_number,
                    ':password' => $passwordHash
                ]);

                $data = ['message' => 'User created successfully'];
                parent::__construct($data);
                break;
                case 'PUT':
                    // Assuming user ID is being passed as part of the request
                    // Update account settings logic
                    $inputData = json_decode(file_get_contents('php://input'), true);
                    $userId = $inputData['user_id'] ?? null; // Ensure this is securely obtained, possibly from a session or validated token
    
                    $firstName = $inputData['first_name'] ?? null;
                    $lastName = $inputData['last_name'] ?? null;
                    $email = $inputData['email'] ?? null;
                    $phoneNumber = $inputData['phone_number'] ?? null;
    
                    $updateSql = "UPDATE account SET first_name = :first_name, last_name = :last_name, email = :email, phone_number = :phone_number WHERE id = :user_id";
                    $this->dbConn->executeSQL($updateSql, [
                        ':first_name' => $firstName,
                        ':last_name' => $lastName,
                        ':email' => $email,
                        ':phone_number' => $phoneNumber,
                        ':user_id' => $userId
                    ]);
    
                    $data = ['message' => 'Account updated successfully'];
                    parent::__construct($data);
                    break;
    
                case 'DELETE':
                    // Assuming user ID is being passed as part of the request
                    $inputData = json_decode(file_get_contents('php://input'), true);
                    $userId = $inputData['user_id'] ?? null; // Ensure this is securely obtained
    
                    $deleteSql = "DELETE FROM account WHERE id = :user_id";
                    $this->dbConn->executeSQL($deleteSql, [':user_id' => $userId]);
    
                    $data = ['message' => 'Account deleted successfully'];
                    parent::__construct($data);
                    break;
                
                default:
                    throw new ClientError(405, "Method not allowed");
                    break;
            }
        }
    }
    ?>