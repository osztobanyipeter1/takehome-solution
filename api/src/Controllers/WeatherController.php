<?php

declare(strict_types=1);

namespace ADS\TakeHome\Controllers;

use ADS\TakeHome\Framework\HttpRequest;
use ADS\TakeHome\Framework\HttpResponseInterface;
use ADS\TakeHome\Framework\JsonHttpResponse;
use ADS\TakeHome\Framework\MySQL;
use DateTimeImmutable;
use Exception;

/**
 * Egy minta controller osztály, a keretrendszer funkcióinak bemutatásához.
 */
class WeatherController
{
    public function __construct(
        private readonly MySQL $db,
    ) {
    }

    public function getCityWeather(HttpRequest $request): HttpResponseInterface
    {
        $cityId = $request->query["cityId"] ?? null;
        $startDate = $request->query["start"] ?? null;
        $endDate = $request->query["end"] ?? null;

        if (!is_numeric($cityId) || !ctype_digit($cityId)) {
            return new JsonHttpResponse(["error" => "'cityId' query paraméter kötelező"], 400);
        }
        $cityId = (int)$cityId;

        if (!is_string($startDate) || !is_string($endDate) || !preg_match('/^\d{8}$/', $startDate) || !preg_match('/^\d{8}$/', $endDate)) {
            return new JsonHttpResponse(["error" => "'start/end': YYYYMMDD formátum kötelező"], 400);
        }

        try {
            $startTimestamp = $this->parseDateToTimestamp($startDate);
            $endTimestamp = $this->parseDateToTimestamp($endDate);
            if ($startTimestamp > $endTimestamp) {
                return new JsonHttpResponse(["error" => "'start' dátum nem lehet későbbi mint 'end'"], 400);
            }
        } catch (Exception $e) {
            return new JsonHttpResponse(["error" => "Érvénytelen dátum: " . $e->getMessage()], 400);
        }

        $rows = $this->db->queryAssoc(
            "SELECT
                mt.date,
                mt.max_temp AS maxTempCelsius,
                nt.min_temp AS minTempCelsius,
                (mt.max_temp + nt.min_temp) / 2 AS avgTempCelsius,
                p.precipitation AS precipitationMm
            FROM maximum_temperatures mt
            JOIN minimum_temperatures nt ON mt.city_id = nt.city_id AND mt.date = nt.date
            LEFT JOIN precipitation p ON mt.city_id = p.city_id AND mt.date = p.date
            WHERE mt.city_id = :cityId
                AND mt.date BETWEEN :start AND :end
            ORDER BY mt.date ASC",
            [
                ':cityId' => $cityId,
                ':start' => $startTimestamp,
                ':end' => $endTimestamp,
            ]
        );

        if (empty($rows)) {
            return new JsonHttpResponse([
                "message" => "Nincs adat a megadott város/dátumtartományban",
                "params" => [
                    "cityId" => $cityId,
                    "start" => $startDate,
                    "end" => $endDate
                ]
            ], 200);
        }

        return new JsonHttpResponse([
            "cityId" => $cityId,
            "start" => $startDate,
            "end" => $endDate,
            "data" => $rows,
            "unit" => [
                "temperature" => "°C",
                "precipitation" => "mm"
            ]
        ]);
    }

    public function getRegionWeather(HttpRequest $request): HttpResponseInterface
    {
        $region = $request->query["region"] ?? null;
        $startDate = $request->query["start"] ?? null;
        $endDate = $request->query["end"] ?? null;

        $validRegions = ['Dunántúl', 'Közép-Magyarország', 'Észak és Alföld'];
        if (!is_string($region) || !in_array($region, $validRegions, true)) {
            return new JsonHttpResponse([
                "error" => "region: érvénytelen érték",
                "valid" => $validRegions
            ], 400);
        }

        if (!is_string($startDate) || !is_string($endDate) || !preg_match('/^\d{8}$/', $startDate) || !preg_match('/^\d{8}$/', $endDate)) {
            return new JsonHttpResponse(["error" => "'start/end': YYYYMMDD formátum kötelező"], 400);
        }

        try {
            $startTimestamp = $this->parseDateToTimestamp($startDate);
            $endTimestamp = $this->parseDateToTimestamp($endDate);
            if ($startTimestamp > $endTimestamp) {
                return new JsonHttpResponse(["error" => "'start' dátum nem lehet későbbi mint 'end'"], 400);
            }
        } catch (Exception $e) {
            return new JsonHttpResponse(["error" => "Érvénytelen dátum: " . $e->getMessage()], 400);
        }

        $rows = $this->db->queryAssoc(
            "SELECT
                mt.date,
                AVG(mt.max_temp) AS maxTempCelsius,
                AVG(nt.min_temp) AS minTempCelsius,
                AVG((mt.max_temp + nt.min_temp) / 2) AS avgTempCelsius,
                AVG(p.precipitation) AS precipitationMm
            FROM maximum_temperatures mt
            JOIN minimum_temperatures nt ON mt.city_id = nt.city_id AND mt.date = nt.date
            LEFT JOIN precipitation p ON mt.city_id = p.city_id AND mt.date = p.date
            JOIN cities c ON mt.city_id = c.id
            WHERE c.region = :region
                AND mt.date BETWEEN :start AND :end
            GROUP BY mt.date
            ORDER BY mt.date ASC",
            [
                ':region' => $region,
                ':start' => $startTimestamp,
                ':end' => $endTimestamp,
            ]
        );

        if (empty($rows)) {
            return new JsonHttpResponse([
                "message" => "Nincs adat a megadott régió/dátumtartományban",
                "params" => [
                    "region" => $region,
                    "start" => $startDate,
                    "end" => $endDate
                ]
            ], 200);
        }

        return new JsonHttpResponse([
            "region" => $region,
            "start" => $startDate,
            "end" => $endDate,
            "data" => $rows,
            "unit" => [
                "temperature" => "°C",
                "precipitation" => "mm"
            ]
        ]);
    }

    private function parseDateToTimestamp(string $dateStr): int
    {
        return (int)$dateStr;
    }
}
