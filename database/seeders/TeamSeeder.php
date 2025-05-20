<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class TeamSeeder extends Seeder
{
    public function run(): void
    {
        $now = Carbon::now();

        // Exemple : on suppose que tu as au moins 5 users et 5 projets existants
        DB::table('teams')->insert([
            [
                'name' => 'Développement Backend',
                'description' => 'Gestion de la logique serveur et des APIs.',
                'manager_id' => 12,
                'project_id' => 31,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'name' => 'Développement Frontend',
                'description' => 'Création d’interfaces utilisateurs modernes.',
                'manager_id' => 13,
                'project_id' => 32,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'name' => 'UI/UX Design',
                'description' => 'Conception graphique et expérience utilisateur.',
                'manager_id' => 14,
                'project_id' => 33,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'name' => 'Support Technique',
                'description' => 'Assistance aux utilisateurs.',
                'manager_id' => 15,
                'project_id' => 34,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'name' => 'Qualité & Tests',
                'description' => 'Validation des fonctionnalités et détection des bugs.',
                'manager_id' => 16,
                'project_id' => 35,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'name' => 'Infrastructure IT',
                'description' => 'Serveurs, réseaux et déploiement.',
                'manager_id' => 12,
                'project_id' => 36,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'name' => 'Documentation',
                'description' => 'Rédaction des guides et documentations techniques.',
                'manager_id' => 12,
                'project_id' => 37,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'name' => 'Data & Analytics',
                'description' => 'Analyse des données et reporting.',
                'manager_id' => 13,
                'project_id' => 38,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'name' => 'Sécurité',
                'description' => 'Protection des données et des accès.',
                'manager_id' => 14,
                'project_id' => 39,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'name' => 'Gestion de Projet',
                'description' => 'Coordination entre les équipes.',
                'manager_id' => 15,
                'project_id' => 40,
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ]);
    }
}
