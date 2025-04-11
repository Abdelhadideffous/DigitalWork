<?php

namespace App\Http\Controllers;

use App\Http\Requests\LoginRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User;

class AuthController extends Controller
{
   
    public function login(LoginRequest $request)
    {
        // Validation manuelle (en attendant que LoginRequest fonctionne)
        $golf = $request->validated();
        
        
        // Vérification des identifiants
        if (!Auth::attempt($golf)) {
            return response()->json([
                'success' => false,
                'message' => 'Email ou mot de passe incorrect'
            ], 401);
        }

        // Récupération de l'utilisateur
        $user = User::where('email', $golf['email'])->first();
        
        // Création d'un token simple
        $token = $user->createToken('auth_token')->plainTextToken; //avec temps d'expiration 4 heures
        // $token = $user->createToken('auth_token', ['*'], now()->addHours(4))->plainTextToken; //avec temps d'expiration 4 heures

        // Réponse avec le token
        return response()->json([
            'success' => true,
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,]
        
        ],200
        );
    }

   
    public function logout(Request $request)
    {
        // Supprimer tous les tokens de l'utilisateur
        $request->user()->tokens()->delete();
        
        return response()->noContent(); // Renvoie un 204

    }
}