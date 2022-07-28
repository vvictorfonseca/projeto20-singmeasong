import app from "../src/app.js";
import supertest from "supertest";
import { prisma } from "../src/database.js"

import recommendationFactory from "./factories/recommendationFactory.js";

const agent = supertest(app);

beforeEach(async () => {
    await prisma.$executeRaw`TRUNCATE table recommendations`
})

describe("POST /recommendations", () => {
    
    it("return 201 for created recommendation", async () => {
        const body = await recommendationFactory.createBodyRecommendation()

        const response = await agent.post("/recommendations").send(body)

        expect(response.status).toBe(201)
    })

    it("return 422 for invalid body", async () => {
        const body = await recommendationFactory.createBodyRecommendation()
        delete body.youtubeLink

        const response = await agent.post("/recommendations").send(body)

        expect(response.status).toBe(422)
    })
})

describe("POST /recommendations/:id/upvote", () => {
    
    it("return 200 for increment vote", async () => {
        const body = await recommendationFactory.createBodyRecommendation()
        const bodyInfo = await recommendationFactory.createRecommendation(body)

        const response = await agent.post(`/recommendations/${bodyInfo.id}/upvote`)

        expect(response.status).toBe(200)
    })

    it("return 404 for invalid id", async () => {
        const body = await recommendationFactory.createBodyRecommendation()
        await recommendationFactory.createRecommendation(body)

        const response = await agent.post(`/recommendations/${1000}/upvote`)

        expect(response.status).toBe(404)
    })
})

describe("POST //recommendations/:id/downvote", () => {

    it("return 200 for decrement vote", async () => {
        const body = await recommendationFactory.createBodyRecommendation()
        const bodyInfo = await recommendationFactory.createRecommendation(body)

        const response = await agent.post(`/recommendations/${bodyInfo.id}/downvote`)

        expect(response.status).toBe(200)
    })

    it("return 404 for invalid id", async () => {
        const body = await recommendationFactory.createBodyRecommendation()
        await recommendationFactory.createRecommendation(body)

        const response = await agent.post(`/recommendations/${1000}/downvote`)

        expect(response.status).toBe(404)
    })

    it("should remove recommendation if -6 votes", async () => {
        const body = await recommendationFactory.createBodyRecommendation()
        const bodyInfo = await recommendationFactory.createRecommendation(body)

        await agent.post(`/recommendations/${bodyInfo.id}/downvote`)
        await agent.post(`/recommendations/${bodyInfo.id}/downvote`)
        await agent.post(`/recommendations/${bodyInfo.id}/downvote`)
        await agent.post(`/recommendations/${bodyInfo.id}/downvote`)
        await agent.post(`/recommendations/${bodyInfo.id}/downvote`)
        await agent.post(`/recommendations/${bodyInfo.id}/downvote`)

        const info = await recommendationFactory.getRecommendations()

        console.log("info", info)

        expect(info).toEqual([])
    })
})

afterAll(async () => {
    await prisma.$disconnect();
})