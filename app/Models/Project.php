<?php

namespace App\Models;



use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Project extends Model
{
    protected $fillable = [
        'title',
        'description',
        'start_date',
        'end_date',
        'priority_id',
        'progress',


        // 'manager_id',
    ];

    protected $guarded = ['status_id'];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',

    ];

    public function status()
    {
        return $this->belongsTo(Statuses::class);
    }

    public function priority()
    {
        return $this->belongsTo(Priority::class);
    }

    // Équipes associées au projet
    public function teams()
    {
        return $this->hasMany(Team::class);
    }

    // Tous les membres des équipes associées au projet
    public function teamMembers()
    {
        return $this->belongsToMany(User::class, 'project_teams', 'project_id', 'user_id');
    }

    public function tasks()
    {
        return $this->hasMany(Task::class);
    }

    /**
     * Get all comments associated with the project.
     */
    public function comments(): HasMany
    {
        return $this->hasMany(CommentsProject::class);
    }


    public function calculateProgress()
    {
        $avgProgress = $this->tasks()->avg('progress');
        $this->progress = $avgProgress ?? 0.00; // Définit à 0.00 si null
        return $this->save(); // Retourne le résultat de save pour vérification
    }



}
