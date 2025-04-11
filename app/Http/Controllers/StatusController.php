<?php

namespace App\Http\Controllers;

use App\Http\Resources\StatusResource;
use App\Models\Statuses;
use Illuminate\Http\Request;

class StatusController extends Controller
{

    public function index()
    {
        $statuses = StatusResource::collection(Statuses::all());

        return response()->json([
            'success' => true,
            'data' => $statuses
        ], 200);
    }



}