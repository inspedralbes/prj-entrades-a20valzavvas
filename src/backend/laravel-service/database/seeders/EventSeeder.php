<?php

namespace Database\Seeders;

use App\Models\Event;
use App\Models\PriceCategory;
use App\Models\Seat;
use Illuminate\Database\Seeder;

class EventSeeder extends Seeder
{
    public function run(): void
    {
        $events = [
            [
                'slug'                   => 'dune-4k-dolby-2026',
                'name'                   => 'Dune: Projecció Especial 4K Dolby Atmos',
                'description'            => 'Projecció especial de Dune en format 4K amb so Dolby Atmos a la Sala Onirica.',
                'image_url'              => 'https://image.tmdb.org/t/p/w500/d5NXSklXo0qyIYkgV94XAgMIckC.jpg',
                'date'                   => '2026-06-15 21:00:00',
                'venue'                  => 'Sala Onirica',
                'total_capacity'         => 200,
                'max_seients_per_usuari' => 4,
                'vip_price'              => 50.00,
                'general_price'          => 25.00,
            ],
            [
                'slug'                   => 'oppenheimer-directors-cut-2026',
                'name'                   => 'Oppenheimer: Edició Director\'s Cut',
                'description'            => 'La versió estesa del film guardonat amb l\'Oscar. Tres hores d\'historia que canvien la mirada sobre la bomba atòmica.',
                'image_url'              => 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
                'date'                   => '2026-06-22 19:30:00',
                'venue'                  => 'Sala Gran',
                'total_capacity'         => 200,
                'max_seients_per_usuari' => 6,
                'vip_price'              => 45.00,
                'general_price'          => 22.00,
            ],
            [
                'slug'                   => 'interstellar-nit-ciencia-ficcio-2026',
                'name'                   => 'Interstellar: Nit de Ciència-Ficció',
                'description'            => 'Sessió de mitjanit amb Interstellar en 70mm. Viatge als confins de l\'univers en la sala més gran del cinema.',
                'image_url'              => 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
                'date'                   => '2026-07-04 00:00:00',
                'venue'                  => 'Sala IMAX',
                'total_capacity'         => 200,
                'max_seients_per_usuari' => 4,
                'vip_price'              => 55.00,
                'general_price'          => 30.00,
            ],
            [
                'slug'                   => 'the-batman-marato-2026',
                'name'                   => 'The Batman: Marató de Superherois',
                'description'            => 'Una nit fosca a Gotham. Sessió especial de The Batman seguida d\'un col·loqui amb experts en còmics.',
                'image_url'              => 'https://image.tmdb.org/t/p/w500/74xTEgt7R36Fpooo50r9T25onhq.jpg',
                'date'                   => '2026-07-11 20:00:00',
                'venue'                  => 'Sala Gotham',
                'total_capacity'         => 200,
                'max_seients_per_usuari' => 5,
                'vip_price'              => 40.00,
                'general_price'          => 20.00,
            ],
            [
                'slug'                   => 'avatar-camí-de-laigua-gala-2026',
                'name'                   => 'Avatar: El Camí de l\'Aigua — Gala Especial',
                'description'            => 'Gala de reestrena en 3D HFR. Submergeix-te de nou en el món de Pandora amb la millor tecnologia audiovisual.',
                'image_url'              => 'https://image.tmdb.org/t/p/w500/t6HIqrRAclMCA60NsSmeqe9RmNV.jpg',
                'date'                   => '2026-07-18 20:30:00',
                'venue'                  => 'Sala IMAX',
                'total_capacity'         => 200,
                'max_seients_per_usuari' => 4,
                'vip_price'              => 60.00,
                'general_price'          => 35.00,
            ],
            [
                'slug'                   => 'spiderman-a-traves-del-spidervers-2026',
                'name'                   => 'Spider-Man: A Través del Spider-Vers',
                'description'            => 'Sessió familiar en versió original subtitulada. La pel·lícula d\'animació més aclamada dels últims anys torna a la gran pantalla.',
                'image_url'              => 'https://image.tmdb.org/t/p/w500/8Vt6mWEReuy4Of61Lnj5Xj704m8.jpg',
                'date'                   => '2026-08-01 17:00:00',
                'venue'                  => 'Sala Familiar',
                'total_capacity'         => 200,
                'max_seients_per_usuari' => 8,
                'vip_price'              => 35.00,
                'general_price'          => 18.00,
            ],
        ];

        foreach ($events as $eventData) {
            $event = Event::updateOrCreate(
                ['slug' => $eventData['slug']],
                [
                    'name'                   => $eventData['name'],
                    'description'            => $eventData['description'],
                    'image_url'              => $eventData['image_url'],
                    'date'                   => $eventData['date'],
                    'venue'                  => $eventData['venue'],
                    'total_capacity'         => $eventData['total_capacity'],
                    'max_seients_per_usuari' => $eventData['max_seients_per_usuari'],
                    'published'              => true,
                ]
            );

            $vip = PriceCategory::updateOrCreate(
                ['event_id' => $event->id, 'name' => 'VIP'],
                ['price' => $eventData['vip_price']]
            );

            $general = PriceCategory::updateOrCreate(
                ['event_id' => $event->id, 'name' => 'General'],
                ['price' => $eventData['general_price']]
            );

            // Files A-B → VIP, files C-J → General
            $categoryByRow = [];
            foreach (range('A', 'B') as $row) {
                $categoryByRow[$row] = $vip->id;
            }
            foreach (range('C', 'J') as $row) {
                $categoryByRow[$row] = $general->id;
            }

            foreach ($categoryByRow as $row => $categoryId) {
                for ($number = 1; $number <= 20; $number++) {
                    Seat::updateOrCreate(
                        [
                            'event_id' => $event->id,
                            'row'      => $row,
                            'number'   => $number,
                        ],
                        [
                            'price_category_id' => $categoryId,
                            'estat'             => 'DISPONIBLE',
                        ]
                    );
                }
            }
        }
    }
}
