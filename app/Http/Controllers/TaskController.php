<?php

namespace App\Http\Controllers;

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
    protected $notificationService;

    public function __construct(NotificationService $notificationService)
    {
        $this->notificationService = $notificationService;
    }

    public function index()
    {
        $user = Auth::user();
        if (!$user)
            return response()->json(['message' => 'Unauthenticated'], 401);

        Task::where('status_id', 1)                        // 1 = « à faire »
            ->whereDate('start_date', '<=', Carbon::today())
            ->update(['status_id' => 2]);

        if ($user->role === 'admin') {
            $tasks = Task::with(['project', 'status', 'priority', 'assignedUser'])->get();

        } else {
            // Cas manager + employé : on récupère toutes les tâches,
            // puis on filtre en fonction du projet ET du lien réel

            $tasks = Task::with(['project.team', 'status', 'priority', 'assignedUser'])
                ->get()
                ->filter(function ($task) use ($user) {
                    $project = $task->project;

                    // Si le projet est null → ignorer cette tâche
                    if (!$project)
                        return false;

                    // OK si manager du projet
                    if ($project->team && $project->team->manager_id === $user->id)
                        return true;

                    // OK si la tâche lui est assignée
                    return $task->assigned_to === $user->id;
                })
                ->values();
        }

        return response()->json([
            'success' => true,
            'data' => TaskResource::collection($tasks)
        ],200);
    }

    public function store(Request $request)
    {
        // try {
            $user = Auth::user();

            // if (!$user || !in_array($user->role, ['admin', 'manager'])) {
            //     return response()->json([
            //         'message' => 'Accès refusé : seuls les managers et administrateurs peuvent créer une tâche.'
            //     ], 403);
            // }

            $validated = $request->validate(app(TaskRequest::class)->rules());


            $task = Task::create($validated);

            // Notifications lors de la création d'une tâche
            // if ($task->assigned_to) {
            //     try {
            //         // Notification à l'utilisateur assigné
            //         $assignee = User::find($task->assigned_to);
            //         if ($assignee) {
            //             $this->notificationService->taskAssigned($task, $assignee);
            //         }

            //         // Notification au manager du projet
            //         $project = Project::find($task->project_id);
            //         if ($project && $project->manager_id) {
            //             $manager = User::find($project->manager_id);
            //             if ($manager) {
            //                 $this->notificationService->notifyManagerNewTask($task, $manager);
            //             }
            //         }
            //     } catch (\Exception $e) {
            //         Log::error('Erreur lors de l\'envoi des notifications: ' . $e->getMessage());
            //     }
            // }

            return response()->json([
                'success' => true,
                'message' => 'Tâche créée avec succès',
                'data' => new TaskResource($task)
            ], 201);

        // } catch (\Exception $e) {
        //     Log::error('Erreur lors de la création de la tâche: ' . $e->getMessage());
        //     return response()->json([
        //         'success' => false,
        //         'message' => 'Une erreur est survenue lors de la création de la tâche',
        //         'error' => $e->getMessage()
        //     ], 500);
        // }
    }

    public function show($id)
    {
        try {
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
        } catch (\Exception $e) {
            Log::error('Erreur lors de la récupération de la tâche: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Une erreur est survenue lors de la récupération de la tâche'
            ], 500);
        }
    }

    public function update($id, Request $request)
    {
        try {
            $task = Task::find($id);

            if (!$task) {
                return response()->json([
                    'success' => false,
                    'message' => 'Tâche non trouvée'
                ], 404);
            }

            $validated = $request->validate(app(TaskRequest::class)->rules());

            // Vérifier si l'assignation a changé
            $oldAssigneeId = $task->assigned_to;
            $newAssigneeId = $validated['assigned_to'] ?? null;

            // Vérifier si le statut a changé
            $oldStatusId = $task->status_id;
            $newStatusId = $validated['status_id'] ?? null;

            $task->update($validated);
            $task->load(['project', 'assignedUser', 'status', 'priority']);

            /* ——— LOGIQUE DE RETOUR AU STATUT 1 ——— */
            if (
                $task->status_id == 2 &&                                    // était « en cours »
                Carbon::parse($task->start_date)->gt(Carbon::today())       // nouvelle date > aujourd'hui
            ) {
                $task->status_id = 1;      // repasse à « à venir »
                $task->save();
            }

            try {
                // Notification de changement d'assignation
                if ($newAssigneeId && $oldAssigneeId !== $newAssigneeId) {
                    $assignee = User::find($newAssigneeId);
                    if ($assignee) {
                        $this->notificationService->taskAssigned($task, $assignee);
                    }
                }

                // Notification de changement de statut
                if ($newStatusId && $oldStatusId !== $newStatusId) {
                    $project = Project::find($task->project_id);
                    if ($project && $project->manager_id) {
                        $manager = User::find($project->manager_id);
                        if ($manager) {
                            $this->notificationService->notifyStatusChange($task, $manager);
                        }
                    }
                }

                // Notification générale de mise à jour
                $this->notificationService->taskUpdated($task);
            } catch (\Exception $e) {
                Log::error('Erreur lors de l\'envoi des notifications: ' . $e->getMessage());
            }

            return response()->noContent();

        } catch (\Exception $e) {
            Log::error('Erreur lors de la mise à jour de la tâche: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Une erreur est survenue lors de la mise à jour de la tâche'
            ], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $task = Task::find($id);

            if (!$task) {
                return response()->json([
                    'success' => false,
                    'message' => 'Tâche non trouvée'
                ], 404);
            }

            $task->delete();

            return response()->json([
                'success' => true,
                'message' => 'Tâche supprimée avec succès'
            ], 200);
        } catch (\Exception $e) {
            Log::error('Erreur lors de la suppression de la tâche: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Une erreur est survenue lors de la suppression de la tâche'
            ], 500);
        }
    }

    public function Taskterminer($id)
    {
        try {
            $task = Task::findOrFail($id);
            $task->status_id = 3; // ID du statut "terminé"
            $task->progress = 100; // Mettre la progression à 100%
            $task->save();

            try {
                // Notification de complétion à l'utilisateur
                $this->notificationService->taskCompleted($task);

                // Notification au manager du projet
                // $project = Project::find($task->project_id);
                // if ($project && $project->manager_id) {
                //     $manager = User::find($project->manager_id);
                //     if ($manager) {
                //         $this->notificationService->notifyTaskCompleted($task, $manager);
                //     }
                // }
            } catch (\Exception $e) {
                Log::error('Erreur lors de l\'envoi des notifications: ' . $e->getMessage());
            }

            return response()->json([
                'success' => true,
                'message' => 'Tâche terminée'
            ], 200);
        } catch (\Exception $e) {
            Log::error('Erreur lors de la finalisation de la tâche: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Une erreur est survenue lors de la finalisation de la tâche'
            ], 500);
        }
    }

    public function Taskanuule($id)
    {
        try {
            $task = Task::findOrFail($id);
            $task->status_id = 4; // ID du statut "annulé"
            $task->save();

            try {
                // Notification d'annulation à l'utilisateur
                $this->notificationService->taskUpdated($task);

                // // Notification au manager du projet
                // $project = Project::find($task->project_id);
                // if ($project && $project->manager_id) {
                //     $manager = User::find($project->manager_id);
                //     if ($manager) {
                //         $this->notificationService->notifyTaskCancelled($task, $manager);
                //     }
                // }
            } catch (\Exception $e) {
                Log::error('Erreur lors de l\'envoi des notifications: ' . $e->getMessage());
            }

            return response()->json([
                'success' => true,
                'message' => 'Tâche annulée'
            ], 200);
        } catch (\Exception $e) {
            Log::error('Erreur lors de l\'annulation de la tâche: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Une erreur est survenue lors de l\'annulation de la tâche'
            ], 500);
        }
    }

    public function calculateProgress($id)
    {
        try {
            $task = Task::find($id);

            if (!$task) {
                return response()->json(['success' => false, 'message' => 'Tâche non trouvée'], 404);
            }

            $oldProgress = $task->progress;
            $task->calculateProgress();
            $newProgress = $task->progress;

            try {
                // Notification si la progression a significativement changé
                if (abs($newProgress - $oldProgress) >= 10) {
                    $project = Project::find($task->project_id);
                    if ($project && $project->manager_id) {
                        $manager = User::find($project->manager_id);
                        if ($manager) {
                            $this->notificationService->notifyProgressUpdate($task, $manager);
                        }
                    }
                }

                // Notification générale de mise à jour
                $this->notificationService->taskUpdated($task);
            } catch (\Exception $e) {
                Log::error('Erreur lors de l\'envoi des notifications: ' . $e->getMessage());
            }

            return response()->json([
                'success' => true,
                'message' => 'Progression recalculée',
                'data' => new TaskResource($task)
            ], 200);
        } catch (\Exception $e) {
            Log::error('Erreur lors du calcul de la progression: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Une erreur est survenue lors du calcul de la progression'
            ], 500);
        }
    }
}
