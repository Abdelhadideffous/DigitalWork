<?php

namespace App\Http\Controllers;

use App\Http\Requests\UserRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class UserController extends Controller
{
    // public function index()
    // {
    //     $users = User::all();

    //     return response()->json([
    //         'success' => true,
    //         'data' => UserResource::collection($users)
    //     ], 200);
    // }

    /**
     * Rechercher des utilisateurs par nom ou email
     */



    public function getAllUsers()
    {
        // $user = Auth::user();

        // if ($user->role !== 'admin') {
        //     return response()->json(['message' => 'Accès refusé'], 403);
        // }

        $users = User::all();
        return response()->json([
            'success' => true,
            'data' => UserResource::collection($users)
        ], 200);
    }

    public function searchUsers(Request $request)
    {
        $query = $request->input('query', '');

        $users = User::where('name', 'like', "%{$query}%")
            ->orWhere('email', 'like', "%{$query}%")
            ->get();

        return response()->json([
            'success' => true,
            'data' => UserResource::collection($users)
        ]);
    }



    public function store(UserRequest $request)
    {
        $validate = $request->validated();
        $user = User::create($validate);

        return response()->json([
            'success' => true,
            'message' => 'User créé avec succès',
            'data' => new UserResource($user)
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User non trouvé'
            ], 404);
        }

        $validated = $request->validate(app(UserRequest::class)->rules());

        $user->update($validated);

        return response()->noContent(); // 204
    }

    public function show($id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User non trouvé'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => new UserResource($user)
        ]);
    }

    public function destroy($id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'User non trouvé'
            ], 404);
        }

        $user->delete();

        return response()->json([
            'success' => true,
            'message' => 'User supprimé avec succès'
        ]);
    }




}