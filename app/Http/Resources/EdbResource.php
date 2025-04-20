<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class EdbResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'objectif' => $this->objectif,
            'contrainte' => $this->contrainte,
            'user_id' => $this->user_id,
            'user' => ['name' => $this->user->name,],
            'status_id' => $this->status_id,
            'status' => $this->status ? ['name' => $this->status->name] : null,
            'priority_id' => $this->priority_id,
            'priority' => ['name' => $this->priority->name],
            'date_demande' => $this->created_at->format('Y-m-d'),

        ];
    }
}
