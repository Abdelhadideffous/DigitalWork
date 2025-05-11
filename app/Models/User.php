<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens; // Ajout de l'import
use Illuminate\Database\Eloquent\Relations\HasMany; // Import HasMany

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


}