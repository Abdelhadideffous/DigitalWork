<?php

namespace App\Events;

use App\Models\Task;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class TaskUpdated
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public Task $task;
    public array $changes;
    public ?int $oldAssigneeId;
    public ?int $newAssigneeId;

    public function __construct(Task $task, array $changes, ?int $oldAssigneeId = null, ?int $newAssigneeId = null)
    {
        $this->task = $task;
        $this->changes = $changes;
        $this->oldAssigneeId = $oldAssigneeId;
        $this->newAssigneeId = $newAssigneeId;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('channel-name'),
        ];
    }
}
