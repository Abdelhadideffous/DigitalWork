<?php

namespace App\Models;

use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Task extends Model
{
    use HasFactory;


    protected $fillable = [
        'title',
        'description',
        'project_id',
        'assigned_to',
        'status_id',
        'priority_id',
        'start_date',
        'end_date',
        'progress',
    ];


    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
    ];


    protected $with = ['assignedUser'];


    public function project()
    {
        return $this->belongsTo(Project::class);
    }


    public function assignedUser()
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }


    public function status()
    {
        return $this->belongsTo(Statuses::class);
    }


    public function priority()
    {
        return $this->belongsTo(Priority::class);
    }

    public function subtasks()
    {
        return $this->hasMany(Subtask::class);
    }

    // Ajouter cette méthode
    public function calculateProgress()
    {
        $this->progress = round($this->subtasks()->avg('progress') ?? 0.0, 1);
        $this->save();

        if ($this->project) {
            $this->project->calculateProgress();
        }
    }


    protected static function booted()
    {
        static::saved(function ($task) {
            if ($task->project) {
                $task->project->calculateProgress();
            }
        });

        static::deleted(function ($task) {
            if ($task->project) {
                $task->project->calculateProgress();
            }
        });
    }


  

}