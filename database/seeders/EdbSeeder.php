<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Edb;

class EdbSeeder extends Seeder
{
    public function run()
    {
        $edbs = [
            [
                'title' => 'EDB Infrastructure IT',
                'description' => 'Remplacement des serveurs obsolètes par une nouvelle infrastructure plus performante et sécurisée.',
                'objectif' => 'Assurer la continuité de service et améliorer la performance des systèmes.',
                'status_id' => 1,
                'priority_id' => 2,
                'user_id' => 1,
            ],
            [
                'title' => 'EDB Marketing Digital',
                'description' => 'Lancement d’une campagne marketing sur les réseaux sociaux pour augmenter la visibilité.',
                'objectif' => 'Attirer de nouveaux clients et renforcer la notoriété de l’entreprise.',
                'status_id' => 4,
                'priority_id' => 1,
                'user_id' => 2,
            ],
            [
                'title' => 'EDB Ressources Humaines',
                'description' => 'Recrutement d’un développeur backend expérimenté pour renforcer l’équipe IT.',
                'objectif' => 'Réduire la charge de travail de l’équipe actuelle et accélérer le développement des projets.',
                'status_id' => 5,
                'priority_id' => 3,
                'user_id' => 3,
            ],
        ];

        foreach ($edbs as $edb) {
            Edb::create($edb);
        }
    }
}
