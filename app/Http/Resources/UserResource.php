<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id, // Ajout de l'ID qui est essentiel
            'name' => $this->name,
            'email' => $this->email,
            // 'password' => $this->password,
            
           
        ];
    }
}