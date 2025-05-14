<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Hash;
use App\Models\Project;
use App\Models\Team;
use App\Models\Notification;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

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
    public function managedTeams(): HasMany
    {
        return $this->hasMany(Team::class, 'manager_id');
    }

    // Équipes dont l'utilisateur est membre
    public function teams(): BelongsToMany
    {
        return $this->belongsToMany(Team::class);   // ← table pivot par défaut : team_user
    }

    // Projets auxquels l'utilisateur participe (via les équipes)
    public function projects(): BelongsToMany
    {
        return $this->belongsToMany(Project::class, 'project_teams', 'user_id', 'project_id');
    }

    public function comments(): HasMany
    {
        return $this->hasMany(CommentsProject::class);
    }

    public function edbs(): HasMany
    {
        return $this->hasMany(Edb::class);
    }

    /**
     * Vérifie si l'utilisateur est un administrateur
     */
    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    /**
     * Vérifie si l'utilisateur est un manager
     */
    public function isManager(): bool
    {
        return $this->role === 'manager';
    }

    /**
     * Vérifie si l'utilisateur est un employé
     */
    public function isEmployee(): bool
    {
        return $this->role === 'employee';
    }

    /**
     * Vérifie si l'utilisateur a un rôle spécifique
     */
    public function hasRole(string $role): bool
    {
        return $this->role === $role;
    }

    /**
     * Check if the user is the manager of a given project.
     *
     * @param \App\Models\Project $project
     * @return bool
     */
    public function isManagerOfProject(Project $project): bool
    {
        if (!$project->team) {
            return false;
        }
        return $project->team->manager_id === $this->id;
    }

    /**
     * Check if the user is a member of a given project.
     *
     * @param \App\Models\Project $project
     * @return bool
     */
    public function isMemberOfProject(Project $project): bool
    {
        if (!$project->team) {
            return false;
        }

        // Vérifie si l'utilisateur est membre de l'équipe du projet
        return $project->team->members()->where('users.id', $this->id)->exists();
    }

    public function notifications(): HasMany
    {
        return $this->hasMany(Notification::class);
    }

    public function unreadNotifications(): HasMany
    {
        return $this->notifications()->where('is_read', false);
    }
}