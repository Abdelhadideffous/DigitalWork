<?php

namespace App\Http\Controllers;

use App\Http\Requests\ProjectRequest;

use App\Http\Resources\ProjectResource;
use App\Http\Resources\TeamResource;
use App\Models\Project;
use App\Models\Team;
use Illuminate\Http\Request;

class ProjectController extends Controller
{

    public function index()
    {
        $projects = Project::all();

        return response()->json([
            'success' => true,
            'data' => ProjectResource::collection($projects)
        ], 200);
    }

    public function store(ProjectRequest $request)
    {

        $validated = $request->validated();


        $project = Project::create($validated);


        return response()->json([
            'success' => true,
            'message' => 'Projet créé avec succès',
            'data' => new ProjectResource($project)
        ], 201);
    }

    public function update($id, Request $request)
    {

        $project = Project::find($id);

        if (!$project) {
            return response()->json([
                'success' => false,
                'message' => 'Projet non trouvé'
            ], 404);
        }


        $validated = $request->validate(app(ProjectRequest::class)->rules());

        $project->update($validated);



        return response()->noContent(); // 204
    }

    // response()->json()->noContent(); //204



    public function show($id)
    {
        $project = Project::find($id);

        if (!$project) {
            return response()->json([
                'success' => false,
                'message' => 'Projet non trouvé'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => new ProjectResource($project)
        ]);
    }

    public function destroy($id)
    {
        $project = Project::find($id);

        if (!$project) {
            return response()->json([
                'success' => false,
                'message' => 'Projet non trouvé'
            ], 404);
        }


        // // Récupérer toutes les équipes associées à ce projet
        // $teams = Team::where('project_id', $id)->get();

        // // Supprimer toutes les équipes associées à ce projet
        // foreach ($teams as $team) {

        //     $team->delete();
        // }



        $project->delete();

        return response()->json([
            'success' => true,
            'message' => 'Projet supprimé avec succès'
        ]);
    }




    public function getProjectTeams($id)
    {
        $project = Project::find($id);

        if (!$project) {
            return response()->json([
                'success' => false,
                'message' => 'Projet non trouvé'
            ], 404);
        }

        $teams = Team::with(['manager', 'members'])
            ->where('project_id', $id)
            ->get();

        return response()->json([
            'success' => true,
            'data' => TeamResource::collection($teams)
        ]);
    }


    public function projetterminer($id)
    {
        $projet = Project::findOrFail($id);
        $projet->status_id = 3; // ID du statut "approuvé"
        $projet->save();

        return response()->json([
            'success' => true,
            'message' => 'projet teminer'
        ], 200); // OK - Ajouté
    }


    public function projetanuule($id)
    {
        $projet = Project::findOrFail($id);
        $projet->status_id = 4; // ID du statut "approuvé"
        $projet->save();

        return response()->json([
            'success' => true,
            'message' => 'projet teminer'
        ], 200); // OK - Ajouté
    }





}