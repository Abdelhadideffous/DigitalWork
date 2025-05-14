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
use App\Services\NotificationService;
use Illuminate\Support\Facades\Validator;

class TeamController extends Controller
{
    protected $notificationService;

    public function __construct(NotificationService $notificationService)
    {
        $this->notificationService = $notificationService;
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

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'project_id' => 'required|exists:projects,id',
            'manager_id' => 'required|exists:users,id',
            'members' => 'array',
            'members.*' => 'exists:users,id'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            DB::beginTransaction();

            $team = Team::create([
                'name' => $request->name,
                'project_id' => $request->project_id,
                'manager_id' => $request->manager_id
            ]);

            if ($request->has('members')) {
                $team->members()->attach($request->members);
            }

            // Envoyer les notifications
            $this->notificationService->teamCreated($team);

            DB::commit();
            return response()->json($team->load(['manager', 'members', 'project']), 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Erreur lors de la création de l\'équipe'], 500);
        }
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

    public function update(Request $request, Team $team)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'string|max:255',
            'project_id' => 'exists:projects,id',
            'manager_id' => 'exists:users,id'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            DB::beginTransaction();

            $oldManagerId = $team->manager_id;
            $team->update($request->only(['name', 'project_id', 'manager_id']));

            // Envoyer les notifications si le manager a changé
            if ($oldManagerId !== $team->manager_id) {
                $this->notificationService->teamUpdated($team, $oldManagerId);
            }

            DB::commit();
            return response()->json($team->load(['manager', 'members', 'project']));
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Erreur lors de la mise à jour de l\'équipe'], 500);
        }
    }

    public function destroy(Team $team)
    {
        try {
            DB::beginTransaction();
            
            // Supprimer les membres de l'équipe
            $team->members()->detach();
            
            // Supprimer l'équipe
            $team->delete();

            DB::commit();
            return response()->json(['message' => 'Équipe supprimée avec succès']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Erreur lors de la suppression de l\'équipe'], 500);
        }
    }

    public function addMember(Request $request, Team $team)
    {
        $validator = Validator::make($request->all(), [
            'user_id' => 'required|exists:users,id'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            DB::beginTransaction();

            $member = User::findOrFail($request->user_id);
            
            if ($team->members()->where('user_id', $member->id)->exists()) {
                return response()->json(['message' => 'L\'utilisateur est déjà membre de l\'équipe'], 400);
            }

            $team->members()->attach($member->id);

            // Envoyer les notifications
            $this->notificationService->memberAdded($team, $member);

            DB::commit();
            return response()->json(['message' => 'Membre ajouté avec succès']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Erreur lors de l\'ajout du membre'], 500);
        }
    }

    public function removeMember(Request $request, Team $team)
    {
        $validator = Validator::make($request->all(), [
            'user_id' => 'required|exists:users,id'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            DB::beginTransaction();

            $member = User::findOrFail($request->user_id);
            
            if (!$team->members()->where('user_id', $member->id)->exists()) {
                return response()->json(['message' => 'L\'utilisateur n\'est pas membre de l\'équipe'], 400);
            }

            $team->members()->detach($member->id);

            // Envoyer les notifications
            $this->notificationService->memberRemoved($team, $member);

            DB::commit();
            return response()->json(['message' => 'Membre retiré avec succès']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Erreur lors du retrait du membre'], 500);
        }
    }

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