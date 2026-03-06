"""Generate realistic landslide training dataset."""
import csv
import random
import os

random.seed(42)

HEADERS = [
    'rainfall_mm', 'humidity_pct', 'temperature_c', 'soil_moisture',
    'slope_angle', 'elevation_m', 'rainfall_3h', 'rainfall_trend',
    'wind_speed', 'landslide'
]

def generate_row():
    """Generate one training sample with realistic correlations."""
    # Randomly decide if this is a landslide event (~30% positive)
    is_landslide = random.random() < 0.30

    if is_landslide:
        # Landslide conditions: heavy rain, high moisture, steep slopes
        rainfall = round(random.gauss(140, 50), 1)
        rainfall = max(40, min(350, rainfall))
        humidity = round(random.gauss(88, 8), 1)
        humidity = max(60, min(100, humidity))
        temperature = round(random.gauss(14, 6), 1)
        temperature = max(-2, min(40, temperature))
        soil_moisture = round(random.gauss(1400, 300), 0)
        soil_moisture = max(600, min(2000, soil_moisture))
        slope_angle = round(random.gauss(40, 8), 1)
        slope_angle = max(20, min(60, slope_angle))
        elevation = round(random.gauss(1900, 400), 0)
        elevation = max(800, min(3500, elevation))
        rainfall_3h = round(rainfall * random.uniform(2.0, 4.0), 1)
        rainfall_trend = round(random.uniform(0.3, 1.0), 2)  # increasing
        wind_speed = round(random.gauss(18, 8), 1)
        wind_speed = max(0, min(50, wind_speed))
        label = 1
    else:
        # Normal conditions
        rainfall = round(random.gauss(30, 35), 1)
        rainfall = max(0, min(200, rainfall))
        humidity = round(random.gauss(60, 18), 1)
        humidity = max(20, min(98, humidity))
        temperature = round(random.gauss(22, 8), 1)
        temperature = max(-5, min(45, temperature))
        soil_moisture = round(random.gauss(700, 300), 0)
        soil_moisture = max(100, min(1800, soil_moisture))
        slope_angle = round(random.gauss(25, 10), 1)
        slope_angle = max(5, min(55, slope_angle))
        elevation = round(random.gauss(1600, 500), 0)
        elevation = max(500, min(3500, elevation))
        rainfall_3h = round(rainfall * random.uniform(1.0, 3.0), 1)
        rainfall_trend = round(random.uniform(-0.5, 0.5), 2)
        wind_speed = round(random.gauss(10, 6), 1)
        wind_speed = max(0, min(40, wind_speed))

        # Some edge cases: high values occasionally can still be no-landslide
        # (model should learn the combination matters)
        if rainfall > 100 and slope_angle > 35 and soil_moisture > 1200:
            # Flip to landslide with 70% chance
            if random.random() < 0.7:
                label = 1
            else:
                label = 0
        else:
            label = 0

    return [
        rainfall, humidity, temperature, int(soil_moisture),
        slope_angle, int(elevation), rainfall_3h, rainfall_trend,
        wind_speed, label
    ]

def main():
    output_path = os.path.join(os.path.dirname(__file__), '..', '..', 'dataset', 'landslide_training_data.csv')
    output_path = os.path.abspath(output_path)

    rows = [generate_row() for _ in range(1000)]

    positives = sum(1 for r in rows if r[-1] == 1)
    print(f"Generated {len(rows)} samples: {positives} landslide ({positives/len(rows)*100:.1f}%), "
          f"{len(rows)-positives} no-landslide ({(len(rows)-positives)/len(rows)*100:.1f}%)")

    with open(output_path, 'w', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(HEADERS)
        writer.writerows(rows)

    print(f"Saved to {output_path}")

if __name__ == '__main__':
    main()
