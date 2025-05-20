<?php

namespace App\Http\Controllers;

use App\Events\TaskCancelled;
use App\Events\TaskCompleted;
use App\Events\TaskCreated;
use App\Events\TaskDeleted;
use App\Events\TaskUpdated;
use App\Http\Requests\TaskRequest;
use App\Http\Resources\TaskResource;
use App\Models\Task;
use App\Models\User;
use App\Models\Project;
use App\Services\TasktStatusUpdater;
use App\Services\NotificationService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;


class TaskController extends Controller
{



    public function index()
    {
        $user = Auth::user();
        if (!$user)
            return response()->json(['message' => 'Unauthenticated'], 401);

        Task::where('status_id', 1)
            ->whereDate('start_date', '<=', Carbon::today())
            ->update(['status_id' => 2]);

        if ($user->role === 'admin') {
            $tasks = Task::with(['project', 'status', 'priority', 'assignedUser'])->get();

        } else {

            $tasks = Task::with(['project.team', 'status', 'priority', 'assignedUser'])
                ->get()
                ->filter(function ($task) use ($user) {
                    $project = $task->project;

                    if (!$project)
                        return false;

                    if ($project->team && $project->team->manager_id === $user->id)
                        return true;

                    return $task->assigned_to === $user->id;
                })
                ->values();
        }

        return response()->json([
            'success' => true,
            'data' => TaskResource::collection($tasks)
        ], 200);
    }

    public function store(Request $request)
    {




        $validated = $request->validate(app(TaskRequest::class)->rules());


        $task = Task::create($validated);

        event(new TaskCreated($task));



        return response()->json([
            'success' => true,
            'message' => 'Tâche créée avec succès',
            'data' => new TaskResource($task)
        ], 201);


    }

    public function show($id)
    {
        $task = Task::find($id);

        if (!$task) {
            return response()->json([
                'success' => false,
                'message' => 'Tâche non trouvée'
            ], 404);
        }

        $task->load(['project', 'assignedUser', 'status', 'priority']);

        return response()->json([
            'success' => true,
            'data' => new TaskResource($task)
        ], 200);


    }

    public function update($id, Request $request)
    {

        /** @var \App\Models\Task $task */

        $task = Task::find($id);
        $oldAssigneeId = $task->assigned_to;

        if (!$task) {
            return response()->json([
                'success' => false,
                'message' => 'Tâche non trouvée'
            ], 404);
        }

        $validated = $request->validate(app(TaskRequest::class)->rules());

        $old = $task->only(['status_id', 'priority_id', 'start_date', 'end_date']);

        $task->update($validated);
        $task->load(['project', 'assignedUser', 'status', 'priority']);


        $newAssigneeId = $validated['assigned_to'] ?? null;

        // Auto-ajustement du statut
        if (
            $task->status_id == 2 &&
            Carbon::parse($task->start_date)->gt(Carbon::today())
        ) {
            $task->status_id = 1;
            $task->save();
        }

        // Comparer les champs à notifier
        $changes = [];
        foreach (['status_id', 'priority_id', 'start_date', 'end_date'] as $field) {
            if ($validated[$field] ?? null && $task->$field != $old[$field]) {
                $changes[$field] = [$old[$field], $task->$field];
            }
        }

        if ($oldAssigneeId !== $newAssigneeId) {
            $changes['assigned_to'] = [$oldAssigneeId, $newAssigneeId];
        }

        if (!empty($changes)) {
            event(new TaskUpdated($task, $changes, $oldAssigneeId, $newAssigneeId));
        }

        return response()->noContent();


    }

    public function destroy($id)
    {

        /** @var \App\Models\Task $task */
        $task = Task::find($id);

        if (!$task) {
            return response()->json([
                'success' => false,
                'message' => 'Tâche non trouvée'
            ], 404);
        }


        // Charger les relations nécessaires AVANT suppression
        $task->load(['assignedUser']); // facultatif

        // Lancer l'event
        event(new TaskDeleted($task));

        $task->delete();

        return response()->json([
            'success' => true,
            'message' => 'Tâche supprimée avec succès'
        ], 200);

    }

    public function Taskterminer($id)
    {
        

        $user = Auth::user();
        /** @var \App\Models\Task $task */
        $task = Task::findOrFail($id);
        $task->status_id = 3; // ID du statut "terminé"
        $task->progress = 100; // Mettre la progression à 100%
        $task->save();

        event(new TaskCompleted($task, $user->id));



        return response()->json([
            'success' => true,
            'message' => 'Tâche terminée'
        ], 200);


    }

    public function Taskanuule($id)
    {
        /** @var \App\Models\Task $task */
        $task = Task::findOrFail($id);
        $task->status_id = 4;
        $task->save();
        event(new TaskCancelled($task));

        return response()->json([
            'success' => true,
            'message' => 'Tâche annulée'
        ], 200);

    }

    public function calculateProgress($id)
    {

        $task = Task::find($id);

        if (!$task) {
            return response()->json(['success' => false, 'message' => 'Tâche non trouvée'], 404);
        }

        $oldProgress = $task->progress;
        $task->calculateProgress();
        $newProgress = $task->progress;



        return response()->json([
            'success' => true,
            'message' => 'Progression recalculée',
            'data' => new TaskResource($task)
        ], 200);

    }






    public function getUpcomingTasks()
    {
        $today = Carbon::today();
        $limitDate = Carbon::today()->addDays(5);

        $tasks = Task::whereDate('end_date', '>=', $today)
            ->whereDate('end_date', '<=', $limitDate)
            ->where('status_id', '!=', '3')
            ->get();

        return response()->json([
            'count' => $tasks->count(),
            'message' => 'Tâches avec une échéance dans les 5 prochains jours',
        ]);
    }



}
