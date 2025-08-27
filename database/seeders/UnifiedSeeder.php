<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Post;
use App\Models\Product;
use App\Models\File;
use App\Models\Fileable;
use App\Models\Metadata;

class UnifiedSeeder extends Seeder
{
    public function run(): void
    {
        // Step 1: Create 1 admin user
        $user = User::factory()->create([
            'role' => 'admin'
        ]);

        // Step 2: Create 5 posts and 5 products
        $posts = Post::factory()->count(5)->create();
        $products = Product::factory()->count(5)->create();

        // Step 3: Create 25 files
        $files = File::factory()->count(25)->create();

        // Step 4: For each file, create 0-5 metadata records
        foreach ($files as $file) {
            $metadataCount = rand(0, 5);

            if ($metadataCount > 0) {
                // Get unique keys for this file to avoid duplicates
                $availableKeys = ['alt', 'author', 'license', 'duration', 'location'];
                $selectedKeys = collect($availableKeys)->random($metadataCount);

                foreach ($selectedKeys as $key) {
                    $value = match ($key) {
                        'alt' => implode(' ', fake()->words(5)),
                        'author' => fake()->name(),
                        'license' => fake()->randomElement(['CC-BY', 'CC0', 'MIT', 'Proprietary']),
                        'duration' => fake()->numberBetween(60, 1200),
                        'location' => fake()->country(),
                    };

                    Metadata::create([
                        'file_id' => $file->id,
                        'key' => $key,
                        'value' => $value,
                    ]);
                }
            }
        }

        // Step 5: For each Post/Product, choose 0-3 roles and attach 1-3 files per role
        $roles = ['thumbnail', 'gallery', 'attachment', 'avatar', 'banner'];
        $models = collect([$posts, $products])->flatten();

        foreach ($models as $model) {
            $roleCount = rand(0, 3);

            if ($roleCount > 0) {
                $selectedRoles = collect($roles)->random($roleCount);

                foreach ($selectedRoles as $role) {
                    $fileCount = rand(1, 3);
                    $selectedFiles = $files->random($fileCount);

                    foreach ($selectedFiles as $file) {
                        Fileable::create([
                            'file_id' => $file->id,
                            'fileable_id' => $model->id,
                            'fileable_type' => get_class($model),
                            'role' => $role,
                        ]);
                    }
                }
            }
        }

        $this->command->info('Database seeded successfully!');
        $this->command->info("Created: 1 user, 5 posts, 5 products, 25 files");
        $this->command->info("Metadata records: " . Metadata::count());
        $this->command->info("File attachments: " . Fileable::count());
    }
}
