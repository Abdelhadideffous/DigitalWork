<?php

namespace App\Providers;

use App\Events\ProjectDeleted;
use App\Events\ProjectUpdated;
use App\Events\TaskCancelled;
use App\Events\TaskCompleted;
use App\Events\TaskCreated;
use App\Events\TaskDeleted;
use App\Events\TaskUpdated;
use App\Listeners\SendProjectDeletedNotification;
use App\Listeners\SendProjectUpdatedNotification;
use App\Listeners\SendTaskCancelledNotification;
use App\Listeners\SendTaskCompletedNotification;
use App\Listeners\SendTaskCreatedNotification;
use App\Listeners\SendTaskDeletedNotification;
use App\Listeners\SendTaskUpdatedNotification;
use Illuminate\Support\ServiceProvider;

class EventServiceProvider extends ServiceProvider
{
    



    protected $listen = [

        TaskCreated::class => [
            SendTaskCreatedNotification::class,
        ],

        TaskUpdated::class => [
            SendTaskUpdatedNotification::class,
        ],

        TaskDeleted::class => [
            SendTaskDeletedNotification::class,
        ],

        TaskCompleted::class => [
            SendTaskCompletedNotification::class,
        ],
        
        TaskCancelled::class => [
            SendTaskCancelledNotification::class,
       
        ],


    ProjectUpdated::class => [
        SendProjectUpdatedNotification::class,
    ],
                ProjectDeleted::class => [
        SendProjectDeletedNotification::class,
    ],

    ];



    public function register(): void
    {
        //
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        //
    }
}
