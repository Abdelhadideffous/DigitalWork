<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Task extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'title',
        'description',
        'project_id',
        'assigned_to',
        'status_id',
        'priority_id',
        'start_date',
        'end_date',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array
     */
    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
    ];

    /**
     * Les relations à charger automatiquement.
     *
     * @var array
     */
    protected $with = ['assignedUser'];

    /**
     * Get the project that owns the task.
     */
    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    /**
     * Get the user that is assigned to the task.
     */
    public function assignedUser()
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    /**
     * Get the status of the task.
     */
    public function status()
    {
        return $this->belongsTo(Statuses::class);
    }

    /**
     * Get the priority of the task.
     */
    public function priority()
    {
        return $this->belongsTo(Priority::class);
    }
}