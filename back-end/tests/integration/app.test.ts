import app from "../../src/app.js";
import supertest from "supertest";
import { prisma } from "../../src/database.js"

import recommendationFactory from "../factories/recommendationFactory.js";

import { createScenarioWithRecommendationsWith5NegativeScore, createScenarioWithRecommendations } from "../factories/scenarioFactory.js"

const agent = supertest(app);

beforeEach(async () => {
    await prisma.$executeRaw`TRUNCATE table recommendations`
})

describe("POST /recommendations", () => {
    
    it("should return 201 for created recommendation", async () => {
        const body = await recommendationFactory.createBodyRecommendation()

        const response = await agent.post("/recommendations").send(body)

        expect(response.status).toBe(201)

        const savedOnDb = await prisma.recommendation.findFirst({where: {name: body.name}})

        expect(savedOnDb.name).toBe(body.name)
    });

    it("should return 422 for invalid body", async () => {
        const body = await recommendationFactory.createBodyRecommendation()
        delete body.youtubeLink

        const response = await agent.post("/recommendations").send(body)

        expect(response.status).toBe(422)
    })

    it("should return 409 for duplicate recommendation", async () => {
        const body = await recommendationFactory.createBodyRecommendation()
        await recommendationFactory.createRecommendation(body)

        const response = await agent.post("/recommendations").send(body)

        expect(response.status).toBe(409)
    })
})

describe("POST /recommendations/:id/upvote", () => {
    
    it("return 200 for increment vote", async () => {
        const body = await recommendationFactory.createBodyRecommendation()
        const bodyInfo = await recommendationFactory.createRecommendation(body)

        const response = await agent.post(`/recommendations/${bodyInfo.id}/upvote`)

        expect(response.status).toBe(200)

        const savedOnDb = await prisma.recommendation.findFirst({where: {name: body.name }})

        expect(savedOnDb.score).toBe(1)
    })

    it("return 404 for invalid id", async () => {
        const body = await recommendationFactory.createBodyRecommendation()
        await recommendationFactory.createRecommendation(body)

        const response = await agent.post(`/recommendations/${1000}/upvote`)

        expect(response.status).toBe(404)
    })
})

describe("POST /recommendations/:id/downvote", () => {

    it("return 200 for decrement vote", async () => {
        const body = await recommendationFactory.createBodyRecommendation()
        const bodyInfo = await recommendationFactory.createRecommendation(body)

        const response = await agent.post(`/recommendations/${bodyInfo.id}/downvote`)

        expect(response.status).toBe(200)

        const savedOnDb = await prisma.recommendation.findFirst({where: {name: body.name}})

        expect(savedOnDb.score).toBe(-1)
    })

    it("return 404 for invalid id", async () => {
        const body = await recommendationFactory.createBodyRecommendation()
        await recommendationFactory.createRecommendation(body)

        const response = await agent.post(`/recommendations/${1000}/downvote`)

        expect(response.status).toBe(404)
    })

    it("should remove recommendation if score is bellow -5", async () => {
        const bodyInfo = await createScenarioWithRecommendationsWith5NegativeScore()
        const response = await agent.post(`/recommendations/${bodyInfo.id}/downvote`)

        expect(response.status).toBe(200)

        const recommendation = await prisma.recommendation.findFirst({where: {name: bodyInfo.name}})

        expect(recommendation).toBe(null)
    })
})

describe("GET /recommendations", () => {
    it("should return last 10 recommendations", async () => {
        await createScenarioWithRecommendations(15)

        const response = await agent.get("/recommendations")

        expect(response.body.length).toBe(10)
    }) 
})

describe("GET /recommendations/:id", () => {
    it("should return recommendation with valid id", async () => {
        const scenario = await createScenarioWithRecommendations(1)

        const response = await agent.get(`/recommendations/${scenario[0].id}`)

        expect(response.body.id).toBe(scenario[0].id)
    })

    it("should return 404 for invalid id", async () => {
        await createScenarioWithRecommendations(1)

        const response = await agent.get(`/recommendations/0`)

        expect(response.statusCode).toBe(404)
    })
})

describe("GET /recommendations/random", () => {
    it("should return random recommendation", async () => {
        await createScenarioWithRecommendations(10)

        const response = await agent.get(`/recommendations/random`);

        expect(response.body).not.toBeNull()
    })

    it("should return 404 if there is no recommendation", async () => {
        const response = await agent.get(`/recommendations/random`);
        
        expect(response.statusCode).toBe(404)
    })
})

describe("GET /recommendations/top/:amount", () => {
    it("should return top 5 recommendations", async () => {
        await createScenarioWithRecommendations(10)

        const response = await agent.get(`/recommendations/top/5`)

        expect(response.body.length).toBe(5)
        expect(response.body[0].score).toBeGreaterThanOrEqual(response.body[1].score)
    })
})

afterAll(async () => {
    await prisma.$disconnect();
});