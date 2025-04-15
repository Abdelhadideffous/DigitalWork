<?php

namespace App\Http\Controllers;

use App\Http\Requests\CommentsProjectRequest;
use App\Http\Resources\CommentsProjectResource;
use App\Models\Comment;
use App\Models\CommentsProject;
use App\Models\Project;
use App\Utils\TeamUtils;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class CommentsProjetController extends Controller
{


    public function index(int $projectId): JsonResponse
    {
        $project = Project::find($projectId);

        if (!$project) {
            return response()->json(['message' => 'Le projet n\'existe pas.'], 404);
        }

        $comments = CommentsProject::with('user')
            ->where('project_id', $projectId)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'success' => true,
            'data' => CommentsProjectResource::collection($comments),
        ], 200);
    }



    public function store(CommentsProjectRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $comment = CommentsProject::create($validated);

        $comment->load('user');

        return response()->json([
            'success' => true,
            'message' => 'Commentaire ajouté avec succès',
            'data' => new CommentsProjectResource($comment)
        ], 201);
    }





    public function show(int $id): JsonResponse
    {
        $comment = CommentsProject::with('user')->findOrFail($id);


        return response()->json([
            'success' => true,
            'data' => CommentsProjectResource::make($comment)
        ], 200);
    }





    public function update(Request $request, int $id)
    {
        $comment = CommentsProject::findOrFail($id);

        $validated = $request->validate([
            'content' => 'required|string',
        ]);

        $comment->update([
            'content' => $validated['content'],
        ]);

        $comment->load('user');

        return response()->noContent();
    }




    public function destroy(int $id): JsonResponse
    {
        $comment = CommentsProject::findOrFail($id);


        $comment->delete();

        return response()->json([
            'success' => true,
            'message' => 'Commentaire supprimé avec succès'
        ]);
    }
}