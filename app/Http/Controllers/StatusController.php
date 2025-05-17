<?php

namespace App\Http\Controllers;

use App\Http\Resources\StatusResource;
use App\Models\Statuses;
use Illuminate\Http\Request;

class StatusController extends Controller
{

    public function index()
    {
        $statuses = StatusResource::collection(Statuses::query()->take(5)->get()); // Récupère les 5 premiers

        return response()->json([
            'success' => true,
            'data' => $statuses
        ], 200);
    }

    public function getStatusProjetetTask()
    {
        $statuses = StatusResource::collection(Statuses::query()->take(5)->get()); // Récupère les 5 premiers

        return response()->json($statuses);
    }

    public function gettedbstatus()
    {
        $statuses = Statuses::whereIn('id', [6, 7])->get();

        return response()->json([
            'data' => $statuses
        ]);


    }

}