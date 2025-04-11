<?php


// app/Models/Status.php - Inchangé
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Statuses extends Model
{
    protected $fillable = ['name'];

    // public function projects()
    // {
    //     return $this->hasMany(Project::class);
    // }

    // public function tasks()
    // {
    //     return $this->hasMany(Task::class);
    // }

    // public function subtasks()
    // {
    //     return $this->hasMany(Subtask::class);
    // }



    // public function changeRequests()
    // {
    //     return $this->hasMany(ChangeRequest::class);
    // }
}