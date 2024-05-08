<?php
namespace App\EndpointControllers;

class Endpoint
{
    private $data;
    /** 
     * $allowedParams 
     * 
     * Set a default as an empty array. This can be
     * overridden in the child class when needed.
     */
    protected $allowedParams = [];
 
    public function __construct($data = ["message" => []])
    {
        $this->setData($data);
    }
 
    public function setData($data)
    {
        $this->data = $data;
    }
 
    public function getData()
    {
        return $this->data;
    }
 
 
    /**
     * checkAllowedParams
     * 
     * This method can be called in the child class. If
     * the allowedParams property is defined in the child 
     * it will use those. Otherwise it will use the default
     * set in this class. 
     */
    protected function checkAllowedParams()
    {
        foreach (\App\REQUEST::params() as $key => $value) 
        {
            if (!in_array($key, $this->allowedParams))
            {
                throw new \App\ClientError(422);
            }
        }
    }

}
?>