import { faker } from "@faker-js/faker";

import recommendationFactory from "./recommendationFactory.js"

export async function createScenarioWithRecommendations(quantity: number) {
    const scenario = []

    for (let i = 0; i < quantity; i++) {
        const recommendation = await recommendationFactory.createRecommendationWithScore(
            faker.datatype.number({ min: -4, max: 25 })
        );
        
        scenario.push(recommendation)
    }

    return scenario
}

export async function createScenarioWithRecommendationsWith5NegativeScore() {
    const recommendation = await recommendationFactory.createRecommendationWithScore(-5)

    return recommendation
}