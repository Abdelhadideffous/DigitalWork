<?php

namespace App\Http\Controllers;

use App\Http\Requests\TaskRequest;
use App\Http\Resources\TaskResource;
use App\Models\Task;
use Illuminate\Http\Request;

class TaskController extends Controller
{
    /**
     * Display a listing of the tasks.
     *
     * @return \Illuminate\Http\Resources\Json\AnonymousResourceCollection
     */
    public function index()
    {
        $tasks = Task::with(['project', 'assignedUser', 'status', 'priority'])->get();
        return TaskResource::collection($tasks);
    }

    /**
     * Store a newly created task in storage.
     *
     * @param  \App\Http\Requests\TaskRequest  $request
     * @return \App\Http\Resources\TaskResource
     */
    public function store(TaskRequest $request)
    {
        $task = Task::create($request->validated());
        $task->load(['project', 'assignedUser', 'status', 'priority']);
        return new TaskResource($task);
    }

    /**
     * Display the specified task.
     *
     * @param  \App\Models\Task  $task
     * @return \App\Http\Resources\TaskResource
     */
    public function show(Task $task)
    {
        $task->load(['project', 'assignedUser', 'status', 'priority']);
        return new TaskResource($task);
    }

    /**
     * Update the specified task in storage.
     *
     * @param  \App\Http\Requests\TaskRequest  $request
     * @param  \App\Models\Task  $task
     * @return \App\Http\Resources\TaskResource
     */
    public function update(TaskRequest $request, Task $task)
    {
        $task->update($request->validated());
        $task->load(['project', 'assignedUser', 'status', 'priority']);
        return new TaskResource($task);
    }

    /**
     * Remove the specified task from storage.
     *
     * @param  \App\Models\Task  $task
     * @return \Illuminate\Http\Response
     */
    public function destroy(Task $task)
    {
        $task->delete();
        return response()->noContent();
    }
}