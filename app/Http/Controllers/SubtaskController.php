<?php

namespace App\Http\Controllers;

use App\Models\Subtask;
use App\Models\Task;
use App\Http\Requests\SubtaskRequest;
use App\Http\Requests\SubtasksRequst;
use App\Http\Resources\SubtasksResource;
use App\Http\Resources\TaskResource;
use App\Services\NotificationService;
use Illuminate\Http\Request;

class SubtaskController extends Controller
{


    private NotificationService $notifier;

    public function __construct(NotificationService $notifier)
    {
        $this->notifier = $notifier;    // Service dispo partout dans le contrôleur
    }

    public function index()
    {
        $subtasks = Subtask::with(['task'])->get();
        return SubtasksResource::collection($subtasks);
    }

    public function store(SubtasksRequst $request, $taskId)
    {
        $task = Task::find($taskId);

        if (!$task) {
            return response()->json([
                'success' => false,
                'message' => 'Tâche non trouvée'
            ], 404);
        }

        $subtask = $task->subtasks()->create($request->validated());
        $task->calculateProgress();

        $this->notifier->subtaskCreated($subtask);

        return response()->json([
            'success' => true,
            'message' => 'Sous-tâche créée avec succès',
            'data' => new SubtasksResource($subtask)
        ], 201);
    }

    public function show($id)
    {
        $task = Task::with(['project', 'assignedUser', 'status', 'priority'])->find($id);

        if (!$task) {
            return response()->json([
                'success' => false,
                'message' => 'Tâche non trouvée'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => new TaskResource($task)
        ], 200);
    }


    public function update(Request $request, $id)
    {
        $subtask = Subtask::find($id);

        // Vérification de l'existence de la sous-tâche
        if (!$subtask) {
            return response()->json([
                'success' => false,
                'message' => 'Sous-tâche non trouvée'
            ], 404);
        }

        // Validation des données avec messages personnalisés
        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'progress' => 'nullable|integer|min:0|max:100',
        ]);

        // // Mise à jour conditionnelle du progrès
        // if (isset($validated['status_id']) && $validated['status_id'] == 3) {
        //     $validated['progress'] = 100;
        // }

        $subtask->update($validated);


        // $this->notifier->subtaskProgressUpdated($subtask);

        if ($subtask->task && method_exists($subtask->task, 'calculateProgress')) {
            $subtask->task->calculateProgress();
        }

        return response()->json([
            'success' => true,
            'message' => 'Sous-tâche mise à jour avec succès',
            'data' => new SubtasksResource($subtask->load('task'))
        ], 200);
    }


    public function destroy($id)
    {
        $subtask = Subtask::find($id);

        if (!$subtask) {
            return response()->json([
                'success' => false,
                'message' => 'Sous-tâche non trouvée'
            ], 404);
        }

        $task = $subtask->task;
        $subtask->delete();

        // Mise à jour de la progression après suppression
        if ($task && method_exists($task, 'calculateProgress')) {
            $task->calculateProgress();
        }

        // $this->notifier->subtaskDeleted($subtask);   // ← NEW

        return response()->json([
            'success' => true,
            'message' => 'Sous-tâche supprimée avec succès',
        ], 200);
    }


    public function completeSubtask($id)
    {
        $subtask = Subtask::find($id);

        if (!$subtask) {
            return response()->json([
                'success' => false,
                'message' => 'Sous-tâche non trouvée'
            ], 404);
        }

        $subtask->status_id = '3'; // ID du statut "terminé"
        $subtask->progress = 100; // Très important ici
        $subtask->save();
        
        $task = $subtask->task;
        if ($task && method_exists($task, 'calculateProgress')) {
            $task->calculateProgress();
        }

        // $this->notifier->subtaskCompleted($subtask);   // ← NEW


        return response()->json([
            'success' => true,
            'message' => 'Sous-tâche marquée comme Terminé',
            'data' => new SubtasksResource($subtask)
        ], 200);
    }

    public function cancelSubtask($id)
    {

        $subtask = Subtask::findOrFail($id);


        if (!$subtask) {
            return response()->json([
                'success' => false,
                'message' => 'Sous-tâche non trouvée'
            ], 404);
        }

        $subtask->status_id = '4'; // ID du statut "annulé"
        $subtask->progress = 0; // Réinitialiser le progrès
        $subtask->save();

        return response()->json([
            'success' => true,
            'message' => 'Sous-tâche annulée avec succès',
            'data' => new SubtasksResource($subtask)
        ], 200);


    }


}
