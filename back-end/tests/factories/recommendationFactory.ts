import { faker } from "@faker-js/faker";
import { prisma } from "../../src/database.js";

async function createBodyRecommendation() {
    return {
        name: faker.music.songName(),
        youtubeLink: "https://www.youtube.com/watch?v=bd5DCefoRbY"
    }
}

interface body {
    name: string,
    youtubeLink: string
}

async function createRecommendation(body: body) {
    
    const bodyInfo = await prisma.recommendation.create({
        data: {
            name: body.name,
            youtubeLink: body.youtubeLink
        }
    })

    return bodyInfo
}

async function createRecommendationWithScore(score: number) {
    const body = await createBodyRecommendation()
    const recommendation = await prisma.recommendation.create({
        data: {...body, score: score}
    });

    return recommendation
}


const recommendationFactory = {
    createBodyRecommendation,
    createRecommendation,
    createRecommendationWithScore
}

export default recommendationFactory