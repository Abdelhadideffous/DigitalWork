<?php

namespace App\Models;

use App\Services\NotificationService;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\App;

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
        static::created(function ($subtask) {
            if ($subtask->task) {
                $subtask->task->calculateProgress();
                // Notification de création
                App::make(NotificationService::class)->subtaskCreated($subtask);
            }
        });

        static::updated(function ($subtask) {
            if ($subtask->task) {
                $subtask->task->calculateProgress();
                
                // Notification de mise à jour
                App::make(NotificationService::class)->subtaskUpdated($subtask);

                // Notification si la progression a changé
                if ($subtask->isDirty('progress')) {
                    App::make(NotificationService::class)->subtaskProgressUpdated($subtask);
                }

                // Notification si la sous-tâche est terminée
                if ($subtask->isDirty('status_id') && $subtask->status_id === 3) { // 3 = terminé
                    App::make(NotificationService::class)->subtaskCompleted($subtask);
                }
            }
        });

        static::deleted(function ($subtask) {
            if ($subtask->task) {
                $subtask->task->calculateProgress();
                // Notification de suppression
                App::make(NotificationService::class)->subtaskDeleted($subtask);
            }
        });
    }
}
