<?php

namespace App\Models;



use Illuminate\Database\Eloquent\Model;

class Project extends Model
{
    protected $fillable = [
        'title',
        'description',
        'start_date',
        'end_date',
        'priority_id',

        // 'manager_id',
        // 'progress',
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



}
