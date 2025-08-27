<?php

namespace Database\Factories;

use App\Models\File;
use App\Models\Post;
use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Fileable>
 */
class FileableFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {

        $models = [
            Post::class,
            Product::class,
            User::class
        ];

        $fileable_type = $this->faker->randomElement($models);
        $fileable_id = $fileable_type::factory()->create();

        $roles = ['thumbnail', 'gallery', 'attachment', 'avatar', 'banner'];

        return [
            'file_id' => File::factory(),
            'fileable_id' => $fileable_id,
            'fileable_type' => $fileable_type,
            'role' => $this->faker->randomElement($roles),
        ];
    }
}
