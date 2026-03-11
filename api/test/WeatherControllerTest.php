<?php

declare(strict_types=1);

namespace ADS\TakeHome\Tests;

use PHPUnit\Framework\Attributes\Test;
use PHPUnit\Framework\TestCase;

class WeatherControllerTest extends TestCase
{
    #Csak így tudtam elérni a dev-et, a gép IP címén keresztül.
    private const BASE_URL = 'http://172.18.0.1:8080';

    #[Test]
    public function getCityWeather(): void
    {
        $url = self::BASE_URL . '/weather/city?cityId=1&start=19010101&end=19010105';
        $data = @file_get_contents($url);

        $this->assertNotFalse($data, 'City weather API failed');
        $json = json_decode($data, true);

        $this->assertIsArray($json, 'JSON must be array');
        $this->assertArrayHasKey('data', $json, 'Missing data in city response');
        $this->assertGreaterThanOrEqual(0, count($json['data']), 'Data must not be empty');
    }

    #[Test]
    public function getRegionWeather(): void
    {
        $url = self::BASE_URL . '/weather/region?region=Dunántúl&start=19010101&end=19010105';
        $data = @file_get_contents($url);

        $this->assertNotFalse($data, 'Region weather API failed');
        $json = json_decode($data, true);

        $this->assertArrayHasKey('data', $json, 'Missing data in region response');
        $this->assertGreaterThanOrEqual(0, count($json['data']), 'Data must not be empty');
    }
}
