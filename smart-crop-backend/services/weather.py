import random

def get_weather(lat: float, lon: float):
    temperature = round(random.uniform(20, 40), 1)
    humidity = round(random.uniform(30, 80), 1)

    return {
        "temperature": temperature,
        "humidity": humidity
    }