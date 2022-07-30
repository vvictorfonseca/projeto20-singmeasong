import { jest } from "@jest/globals"

import { CreateRecommendationData } from "../../src/services/recommendationsService.js";
import { Recommendation } from "@prisma/client";

import { recommendationService } from "../../src/services/recommendationsService"
import { recommendationRepository } from "../../src/repositories/recommendationRepository"

import { notFoundError } from "../../src/utils/errorUtils.js"
import exp from "constants";

describe("recommendation service test for create recommendation", () => {
    it("should create recommendation", async () => {
        const recommendation = { name: "Victor Hugo Fonseca da Silva", youtubeLink: "https://www.youtube.com/watch?v=Al2EOC1eRUw" }

        jest.spyOn(recommendationRepository, "findByName").mockImplementationOnce((): any => { });
        jest.spyOn(recommendationRepository, "create").mockImplementation((): any => { });

        await recommendationService.insert(recommendation)
        expect(recommendationRepository.findByName).toBeCalled()
        expect(recommendationRepository.create).toBeCalled()
    })

    it("should not create duplicated recommendations", async () => {
        const recommendation: CreateRecommendationData = {
            name: "Fulano",
            youtubeLink: "https://www.youtube.com/watch?v=bd5DCefoRbY",
        };

        jest
            .spyOn(recommendationRepository, "findByName")
            .mockImplementationOnce((): any => {
                return {
                    name: recommendation.name,
                    youtubeLink: recommendation.youtubeLink,
                };
            });

        const promise = recommendationService.insert(recommendation);
        expect(promise).rejects.toEqual({
            message: "Recommendations names must be unique",
            type: "conflict",
        });
    });
});

describe("tests to increment score of the recommendation", () => {
    it("should increment a score to the recommendation", async () => {
        const recommendation = {
            id: 1,
            name: "Victor Hugo",
            youtubeLink: "https://www.youtube.com/watch?v=bd5DCefoRbY",
            score: 0
        };

        jest
            .spyOn(recommendationRepository, "find")
            .mockImplementationOnce((): any => {
                return recommendation
            });

        jest
            .spyOn(recommendationRepository, "updateScore")
            .mockImplementationOnce((): any => {
                return { ...recommendation, score: 1 }
            })

        await recommendationService.upvote(recommendation.id)

        expect(recommendationRepository.updateScore).toBeCalled()
    })

    it("should not increment score if recommendation doesn't exist", async () => {
        jest
            .spyOn(recommendationRepository, "find")
            .mockImplementationOnce((): any => { });


        expect(recommendationService.upvote(1)).rejects.toEqual(notFoundError())
    })
})

describe("tests to decrement score of the recommendation", () => {
    it("should decrement the score and delete if score is below than minus 5", async () => {
        const recommendation = {
            id: 1,
            name: "Victor Hugo",
            youtubeLink: "https://www.youtube.com/watch?v=bd5DCefoRbY",
            score: -5
        };

        jest
            .spyOn(recommendationRepository, "find")
            .mockImplementationOnce((): any => {
                return recommendation
            })

        jest
            .spyOn(recommendationRepository, "updateScore")
            .mockImplementationOnce((): any => {
                return { ...recommendation, score: -6 }
            })

        jest
            .spyOn(recommendationRepository, "remove")
            .mockImplementationOnce((): any => { })

        await recommendationService.downvote(recommendation.id)

        expect(recommendationRepository.updateScore).toBeCalled()
        expect(recommendationRepository.remove).toBeCalled()
    })

    it("should not decrement score if recommendation doesn't exist", async () => {
        jest
            .spyOn(recommendationRepository, "find")
            .mockImplementationOnce((): any => { });

        expect(recommendationService.downvote(1)).rejects.toEqual(notFoundError())
    })
})

describe("tests to return recommendations", () => {
    it("should return last 10 recommendations", async () => {

        jest
            .spyOn(recommendationRepository, "findAll")
            .mockImplementationOnce((): any => { })

        await recommendationService.get();
        expect(recommendationRepository.findAll).toBeCalled();
    });

    it("should return recommendation by Id", async () => {
        const recommendation = {
            id: 1,
            name: "Victor Hugo",
            youtubeLink: "https://www.youtube.com/watch?v=bd5DCefoRbY",
            score: 1
        };

        jest
            .spyOn(recommendationRepository, "find")
            .mockImplementationOnce((): any => {
                return {
                    id: 1,
                    name: "Victor Hugo",
                    youtubeLink: "https://www.youtube.com/watch?v=bd5DCefoRbY",
                    score: 1
                }
            })

        await recommendationService.getById(recommendation.id)

        expect(recommendationRepository.find).toBeCalled()
    })

    it("should return top recommendations", async () => {
        const recommendations = [
            {
                id: 1,
                name: "Victor Hugo",
                youtubeLink: "https://www.youtube.com/watch?v=bd5DCefoRbY",
                score: 1
            },

            {
                id: 2,
                name: "Matheus Tassi",
                youtubeLink: "https://www.youtube.com/watch?v=bd5DCefoRbY",
                score: 3
            },

            {
                id: 3,
                name: "Vittorio Fassano",
                youtubeLink: "https://www.youtube.com/watch?v=bd5DCefoRbY",
                score: 5
            }
        ]

        jest
            .spyOn(recommendationRepository, "getAmountByScore")
            .mockImplementationOnce((): any => {
                return { ...recommendations }
            })

        await recommendationService.getTop(2)

        expect(recommendationRepository.getAmountByScore).toBeCalled()
    })

    it("should return a random recommendation - 30%", async () => {
        const recommendations = [
            {
                id: 1,
                name: "Victor Hugo",
                youtubeLink: "https://www.youtube.com/watch?v=bd5DCefoRbY",
                score: 100
            },

            {
                id: 2,
                name: "Matheus Tassi",
                youtubeLink: "https://www.youtube.com/watch?v=bd5DCefoRbY",
                score: 30
            },

            {
                id: 3,
                name: "Vittorio Fassano",
                youtubeLink: "https://www.youtube.com/watch?v=bd5DCefoRbY",
                score: 5
            }
        ]

        jest
            .spyOn(Math, "random")
            .mockReturnValueOnce(0.9)

        jest
            .spyOn(recommendationRepository, "findAll")
            .mockResolvedValueOnce([recommendations[2]])

        const result = await recommendationService.getRandom()

        expect(result.score).toBe(recommendations[2].score)
    })

    it("should return a random recommendation - 70%", async () => {
        const recommendations = [
            {
                id: 1,
                name: "Victor Hugo",
                youtubeLink: "https://www.youtube.com/watch?v=bd5DCefoRbY",
                score: 100
            },

            {
                id: 2,
                name: "Matheus Tassi",
                youtubeLink: "https://www.youtube.com/watch?v=bd5DCefoRbY",
                score: 30
            },

            {
                id: 3,
                name: "Vittorio Fassano",
                youtubeLink: "https://www.youtube.com/watch?v=bd5DCefoRbY",
                score: 5
            }
        ]

        jest
            .spyOn(Math, "random")
            .mockReturnValueOnce(0.5)

        jest
            .spyOn(recommendationRepository, "findAll")
            .mockResolvedValueOnce([recommendations[1]])

        const result = await recommendationService.getRandom()

        expect(result.score).toBe(recommendations[1].score)
    })

    it("should return any recommendation if we have only songs above 10 scores or under 10 scores", async () => {
        const recommendations = [
            {
                id: 1,
                name: "Victor Hugo",
                youtubeLink: "https://www.youtube.com/watch?v=bd5DCefoRbY",
                score: 100
            },

            {
                id: 2,
                name: "Matheus Tassi",
                youtubeLink: "https://www.youtube.com/watch?v=bd5DCefoRbY",
                score: 30
            },

            {
                id: 3,
                name: "Vittorio Fassano",
                youtubeLink: "https://www.youtube.com/watch?v=bd5DCefoRbY",
                score: 10
            }
        ]

        jest
        .spyOn(Math, "random")
        .mockReturnValueOnce(0.5)

        jest
            .spyOn(recommendationRepository, "findAll")
            .mockResolvedValueOnce([recommendations[1]])

        const result = await recommendationService.getRandom()

        expect(result.score).toBe(recommendations[1].score)
    })

    it("should return not found error, if there is no recommended songs", async () => {
        const recommendation = [];
        
        jest
        .spyOn(Math, "random")
        .mockReturnValueOnce(0.5)

        jest
            .spyOn(recommendationRepository, "findAll")
            .mockResolvedValue(recommendation);

        expect(recommendationService.getRandom).rejects.toEqual({
            "message": "",
            "type": "not_found",
        })
    })
});