<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Team extends Model
{
    protected $fillable = [
        'name',
        'description',
        'manager_id',
        'project_id'
    ];

    // Relation avec le manager (un utilisateur)
    public function manager()
    {
        return $this->belongsTo(User::class, 'manager_id');
    }

    // Relation avec le projet
    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    // Relation avec les membres de l'équipe
    public function members()
    {
        return $this->belongsToMany(User::class, 'team_user');
    }

    public function users()
    {
        return $this->belongsToMany(User::class, 'team_user', 'team_id', 'user_id');
    }


    

}