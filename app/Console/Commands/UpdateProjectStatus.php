<?php

namespace App\Console\Commands;

use App\Models\Project;
use Illuminate\Console\Command;
use App\Models\Projet;
use Carbon\Carbon;

class UpdateProjectStatus extends Command
{
    protected $signature = 'projects:update-status';
    protected $description = 'Met à jour automatiquement les projets dont la date de début est atteinte.';

    public function handle()
    {
        $today = Carbon::today();

        $projets = Project::where('status_id', 1) // 1 = En attente
            ->whereDate('start_date', '<=', $today)
            ->get();

        foreach ($projets as $projet) {
            $projet->status_id = 2; // 4 = En cours
            $projet->save();

            $this->info("Projet ID {$projet->id} est maintenant EN COURS");
        }

        return Command::SUCCESS;
    }
}
