<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProjectResource extends JsonResource
{

    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'start_date' => $this->start_date->format('Y-m-d'),
            'end_date' => $this->end_date->format('Y-m-d'),
            'priority_id' => $this->priority_id,
            'status_id' => $this->status_id,
            'priority' => ['name' => $this->priority->name],
            'status' => $this->status ? ['name' => $this->status->name] : null,
            'progress' => $this->progress,
            // 'team_members' => ProjectTeamResource::collection($this->whenLoaded('teamMembers')),
        ];
    }


}