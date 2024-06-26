<?php

namespace App;

/**
 * 
 * @author Ryan Field
 */

abstract class Request 
{
    public static function method()
    {
        return $_SERVER['REQUEST_METHOD'];
    }
// Used with the note endpoint which allows the user to login with the bearer token
    public static function getBearerToken()
    {
        $allHeaders = getallheaders();
        $authorizationHeader = "";
                
        if (array_key_exists('Authorization', $allHeaders)) {
            $authorizationHeader = $allHeaders['Authorization'];
        } elseif (array_key_exists('authorization', $allHeaders)) {
            $authorizationHeader = $allHeaders['authorization'];
        }
                
        if (substr($authorizationHeader, 0, 7) != 'Bearer ') {
            throw new ClientError(401);
        }
        
        return trim(substr($authorizationHeader, 7));  
    }
 
    /**
     * Endpoint
     * 
     * Return the name of the requested endpoint. 
     * ﻿Ensure that $basepath is correct for your environment.
     */
    public static function endpointName()
    {
            $url = $_SERVER["REQUEST_URI"];
            $path = parse_url($url, PHP_URL_PATH);
            // Remove BASEPATH from the URI path
            return ltrim(str_replace(BASEPATH, '', $path), '/');
    }

    //This was generated by CHATGPT to help get my note endpoint working as it wouldn't work without it. 
    public static function getJsonPayload() {
        $json = file_get_contents('php://input');
        return json_decode($json, true); // true to get an associative array
    }
 
    public static function params()
    {
        return $_REQUEST;
    }
    
}
?>