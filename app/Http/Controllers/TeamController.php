<?php

namespace App\Http\Controllers;

use App\Http\Requests\TeamRequest;
use App\Http\Resources\TeamResource;
use App\Http\Resources\UserResource;
use App\Models\Project;
use App\Models\Team;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class TeamController extends Controller
{
    protected $notificationController;

    public function __construct(TeamNotificationController $notificationController)
    {
        $this->notificationController = $notificationController;
    }

    public function index()
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        if ($user->role === 'admin') {
            // Admin : toutes les équipes
            $teams = Team::with(['project', 'members', 'manager'])->get();

        } else {
            // Manager : équipes qu'il gère
            $managedTeams = Team::where('manager_id', $user->id)->with(['project', 'members', 'manager'])->get();

            // Membre : équipes où il est dans team_user
            $memberTeams = Team::whereHas('members', function ($query) use ($user) {
                $query->where('user_id', $user->id);
            })->with(['project', 'members', 'manager'])->get();

            // Fusionner sans doublons
            $teams = $managedTeams->merge($memberTeams)->unique('id')->values();
        }

        return response()->json([
            'success' => true,
            'data' => TeamResource::collection($teams)
        ]);
    }

    public function store(TeamRequest $request)
    {
        $validated = $request->validated();

        $manager = User::findOrFail($validated['manager_id']);

        if ($manager->role !== 'manager') {
            $manager->role = 'manager';
            $manager->save();
        }

        $team = Team::create($validated);

        // if (isset($validated['members']) && is_array($validated['members'])) {
        //     $memberIds = collect($validated['members'])->pluck('user_id')->toArray();
        //     $team->members()->attach($memberIds);
        // }

        $this->notificationController->teamCreated($team);

        return response()->json([
            'success' => true,
            'message' => 'Équipe créée avec succès',
            'data' => new TeamResource($team)
        ], 201);
    }

    public function show($id)
    {
        $team = Team::with(['manager', 'project', 'members'])->find($id);

        if (!$team) {
            return response()->json([
                'success' => false,
                'message' => 'Équipe non trouvée'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => new TeamResource($team)
        ]);
    }

    public function update($id, TeamRequest $request)
    {
        /** @var \App\Models\Team $team */
        $team = Team::find($id);

        if (!$team) {
            return response()->json([
                'success' => false,
                'message' => 'Équipe non trouvée'
            ], 404);
        }

        $validated = $request->validated();
        $changes = array_diff_assoc($validated, $team->toArray());



        if (isset($validated['manager_id']) && $team->manager_id != $validated['manager_id']) {
            /** @var \App\Models\User $oldManager */

            $oldManager = User::find($team->manager_id);
            /** @var \App\Models\User $newManager */
            $newManager = User::findOrFail($validated['manager_id']);

            $newManagerWasMember = $team->members()
                ->where('user_id', $validated['manager_id'])
                ->exists();

            if ($newManagerWasMember) {
                $team->members()->detach($validated['manager_id']);
            }

            if ($newManager->role !== 'manager') {
                $newManager->role = 'manager';
                $newManager->save();
            }


            $this->notificationController->managerChanged($team, $oldManager, $newManager);
        }



        $team->update($validated);


        if (isset($validated['members']) && is_array($validated['members'])) {
            $memberIds = collect($validated['members'])
                ->pluck('user_id')
                ->diff([$team->manager_id])           // on retire le manager
                ->toArray();

            $team->members()->sync($memberIds);
        }


        if (isset($oldManager) && $oldManager) {
            $stillManager = Team::where('manager_id', $oldManager->id)->exists();

            if (!$stillManager && $oldManager->role === 'manager') {
                $oldManager->role = 'employee';                    // adapte le nom
                $oldManager->save();
            }
        }


        $this->notificationController->teamUpdated($team, $changes);

        return response()->noContent();   // 204
    }

    public function destroy($id)
    {
        $team = Team::find($id);
        if (!$team) {
            return response()->json(['success' => false, 'message' => 'Équipe non trouvée'], 404);
        }

        $managerId = $team->manager_id;

        /* 1) Détacher si PAS de cascade */
        $team->members()->detach();        // inutile si tu as ON DELETE CASCADE

        /* 2) Supprimer l’équipe (soft-delete ou forceDelete) */
        $team->delete();                   // ou ->forceDelete();

        /* 3) Rétrograder le manager si besoin */
        $stillManager = Team::where('manager_id', $managerId)->exists();
        if (!$stillManager) {
            $manager = User::find($managerId);
            if ($manager && $manager->role === 'manager') {
                $manager->role = 'employee';
                $manager->save();
            }
        }

        /* 4) Notification */
        // $this->notificationController->teamDeleted($id);

        return response()->json(['success' => true, 'message' => 'Équipe supprimée avec succès']);
    }


    // Ajouter un membre à l'équipe
    public function addMember($teamId, Request $request)
    {

        $request->validate([
            'user_id' => 'required|exists:users,id'
        ]);



        /** @var \App\Models\Team $team */

        $team = Team::find($teamId);

        if (!$team) {
            return response()->json([
                'success' => false,
                'message' => 'Équipe non trouvée'
            ], 404);
        }

        // Vérifier si l'utilisateur est le manager de l'équipe
        if ($team->manager_id == $request->user_id) {
            return response()->json([
                'success' => false,
                'message' => 'Cet utilisateur est déjà le chef d\'équipe'
            ], 400);
        }

        // Vérifier si le membre existe déjà dans l'équipe
        $memberExists = $team->members()->where('user_id', $request->user_id)->exists();

        if ($memberExists) {
            return response()->json([
                'success' => false,
                'message' => 'Ce membre fait déjà partie de l\'équipe'
            ], 400);
        }
        /** @var \App\Models\User $member*/

        $member = User::find($request->user_id);
        // Ajouter le membre puisqu'il n'existe pas encore dans l'équipe
        $team->members()->attach($request->user_id);

        // Envoyer les notifications d'ajout de membre
        $this->notificationController->memberAdded($team, $member);

        return response()->json([
            'success' => true,
            'message' => 'Membre ajouté avec succès'
        ], 200);
    }
    // Retirer un membre de l'équipe
    public function removeMember($teamId, $userId)
    {

        /** @var \App\Models\Team $team */

        $team = Team::find($teamId);

        if (!$team) {
            return response()->json([
                'success' => false,
                'message' => 'Équipe non trouvée'
            ], 404);
        }

        /** @var \App\Models\User $member*/

        $member = User::find($userId);
        $team->members()->detach($userId);

        // Envoyer les notifications de retrait de membre
        $this->notificationController->memberRemoved($team, $member);

        return response()->json([
            'success' => true,
            'message' => 'Membre retiré avec succès'
        ], 200);
    }

    // Récupérer les projets qui ne sont pas associés à une équipe
    public function getAvailableProjects()
    {
        // Récupérer les IDs des projets qui sont déjà associés à une équipe
        $assignedProjectIds = Team::pluck('project_id')->toArray();

        // Récupérer tous les projets qui ne sont pas dans cette liste
        $availableProjects = Project::whereNotIn('id', $assignedProjectIds)->get();

        return response()->json([
            'success' => true,
            'data' => $availableProjects
        ]);
    }



}