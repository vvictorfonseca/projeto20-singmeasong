import app from "../src/app.js";
import supertest from "supertest";

import recommendationFactory from "./factories/recommendationFactory.js";

const agent = supertest(app);

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
        const bodyInfo = await recommendationFactory.createRecommendation(body)

        const response = await agent.post(`/recommendations/${1000}/upvote`)

        expect(response.status).toBe(404)
    })
})