<?php

namespace Database\Factories;

use App\Models\File;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Metadata>
 */
class MetadataFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {

        $keys = ['alt', 'author', 'license', 'duration', 'location'];

        $key = $this->faker->randomElement($keys);

        $value = match ($key) {
            'alt' => $this->faker->words(5),
            'author' => $this->faker->name(),
            'license' => $this->faker->randomElement(['CC-BY', 'CC0', 'MIT', 'Proprietary']),
            'duration' => $this->faker->numberBetween(60, 1200),
            'location' => $this->faker->country(),
        };

        return [
            'file_id' => File::factory(),
            'key' => $key,
            'value' => $value,
        ];
    }
}
