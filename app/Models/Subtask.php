<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Subtask extends Model
{
    protected $fillable = ['task_id', 'title', 'progress'];

    protected $guarded = ['status_id'];


    public function task()
    {
        return $this->belongsTo(Task::class);
    }
    public function status()
    {
        return $this->belongsTo(Statuses::class);
    }


    protected static function booted()
    {
        static::saved(function ($subtask) {
            if ($subtask->task) {
                $subtask->task->calculateProgress();
            }
        });

        static::deleted(function ($subtask) {
            if ($subtask->task) {
                $subtask->task->calculateProgress();
            }
        });
    }
}
