<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class TaskResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'assigned_to' => $this->assigned_to,
            'assigned_user' => $this->assignedUser ? [
                'id' => $this->assignedUser->id,
                'name' => $this->assignedUser->name,
                'email' => $this->assignedUser->email,
            ] : null,
            'project' => $this->project ? [
                'id' => $this->project->id,
                'title' => $this->project->title,
            ] : null,
            'status' => $this->status ? [
                'id' => $this->status->id,
                'name' => $this->status->name,
            ] : null,
            'priority' => $this->priority ? [
                'id' => $this->priority->id,
                'name' => $this->priority->name,
            ] : null,
            'start_date' => $this->start_date->format('Y-m-d'),
            'end_date' => $this->end_date->format('Y-m-d'),
        ];
    }
}
