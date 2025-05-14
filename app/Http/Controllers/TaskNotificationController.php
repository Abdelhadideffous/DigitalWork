<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Models\User;
use App\Services\NotificationService;
use Illuminate\Http\Request;

class TaskNotificationController extends Controller
{
    protected $notificationService;

    public function __construct(NotificationService $notificationService)
    {
        $this->notificationService = $notificationService;
    }

    public function taskAssigned(Task $task, User $assignee)
    {
        $this->notificationService->taskAssigned($task, $assignee);
    }

    public function taskCompleted(Task $task)
    {
        $this->notificationService->taskCompleted($task);
    }

    public function taskUpdated(Task $task)
    {
        $this->notificationService->taskUpdated($task);
    }
} 