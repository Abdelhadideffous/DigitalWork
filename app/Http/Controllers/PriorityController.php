<?php

namespace App\Http\Controllers;

use App\Http\Resources\PriorityResource;
use App\Models\Priority;
use Illuminate\Http\Request;

class PriorityController extends Controller
{

    public function index()
    {
        $priorities = PriorityResource::collection(Priority::all());


        return response()->json([
            'success' => true,
            'data' => $priorities,
        ], 200);
    }



}
