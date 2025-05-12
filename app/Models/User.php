<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens; // Ajout de l'import
use Illuminate\Database\Eloquent\Relations\HasMany; // Import HasMany
use Illuminate\Support\Facades\Hash; // Import Hash facade

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable; // Ajout de HasApiTokens ici

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'number',

    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
    ];


    public function setPasswordAttribute($value)
    {
        $this->attributes['password'] = Hash::make($value);
    }

    // Équipes que l'utilisateur gère
    public function managedTeams()
    {
        return $this->hasMany(Team::class, 'manager_id');
    }

    // Équipes dont l'utilisateur est membre
    public function teams(): BelongsToMany
    {
        return $this->belongsToMany(Team::class);   // ← table pivot par défaut : team_user
    }




    // Projets auxquels l'utilisateur participe (via les équipes)
    public function projects()
    {
        return $this->belongsToMany(Project::class, 'project_teams', 'user_id', 'project_id');
    }

    public function comments(): HasMany
    {
        return $this->hasMany(CommentsProject::class);
    }



    public function edbs()
    {
        return $this->hasMany(Edb::class);
    }

    public function isAdmin()
    {
        return $this->hasRole('admin');
    }
    public function isManager()
    {
        return $this->hasRole('manager');
    }
    public function isEmployee()
    {
        return $this->hasRole('employee');
    }

    public function hasRole($role)
    {
        return $this->role === $role;
    }



   /**
     * Check if the user is the manager of a given project.
     *
     * @param \App\Models\Project $project
     * @return bool
     */
    public function isManagerOfProject($project)
    {
        // Assumes Project has a 'team' relationship and Team has 'manager_id'
        return $project->team && $project->team->manager_id === $this->id;
    }

    /**
     * Check if the user is a member of a given project.
     *
     * @param \App\Models\Project $project
     * @return bool
     */
    public function isMemberOfProject($project)
    {
        // Assumes Project has a 'team' relationship and Team has 'members' relationship
        return $project->team && $project->team->members->contains('id', $this->id);
    }

    

}