/// <reference types="cypress" />

import { faker } from "@faker-js/faker";

beforeEach(() => {
  cy.resetDatabase()
});

describe("create recommendations tests", () => {
  it("should create recommendation", () => {
    const recommendation = {
      name: faker.lorem.words(3),
      youtubeLink: "https://www.youtube.com/watch?v=jfKfPfyJRdk"
    };

    cy.createRecommendation(recommendation)

    cy.contains(`${recommendation.name}`).should("be.visible")
  })

  it("should not create a recommendation with invalid body", () => {
    const recommendation = {
      name: faker.lorem.words(3),
      youtubeLink: "https://github.com/vvictorfonseca"
    };

    cy.createRecommendation(recommendation)

    cy.on("window:alert", (str) => {
      expect(str).to.contains("Error creating recommendation!");
    });
  });
});

describe("upvote tests", () => {
  it("should upvote a recommendation score", () => {
    const recommendation = {
      name: faker.lorem.words(3),
      youtubeLink: "https://www.youtube.com/watch?v=jfKfPfyJRdk"
    };

    cy.createRecommendation(recommendation)

    cy.get("#upvote").click();

    cy.get("#score").should("contain.text", "1")
  });
});

describe("downvote tests", () => {
  it("should downvote a recommendation score", () => {
    const recommendation = {
      name: faker.lorem.words(3),
      youtubeLink: "https://www.youtube.com/watch?v=jfKfPfyJRdk"
    };

    cy.createRecommendation(recommendation)

    cy.get("#downvote").click();

    cy.get("#score").should("contain.text", "-1")
  });

  it("should remove recommendation if score is below -5", () => {
    const recommendation = {
      name: faker.lorem.words(3),
      youtubeLink: "https://www.youtube.com/watch?v=jfKfPfyJRdk"
    };

    cy.createRecommendation(recommendation)

    cy.get("#downvote").click();
    cy.get("#downvote").click();
    cy.get("#downvote").click();
    cy.get("#downvote").click();
    cy.get("#downvote").click();
    cy.get("#downvote").click();

    cy.contains(`No recommendations yet! Create your own :)`).should("be.visible");
  });
});

describe("get recommendations tests", () => {
  it("should return top recommendations", () => {
    const recommendation = {
      name: faker.lorem.words(3),
      youtubeLink: "https://www.youtube.com/watch?v=jfKfPfyJRdk"
    };

    cy.createRecommendation(recommendation)

    cy.contains("Top").click();

    cy.contains(`${recommendation.name}`).should("be.visible")
  })

  it("should return random recommendations", () => {
    const recommendation = {
      name: faker.lorem.words(3),
      youtubeLink: "https://www.youtube.com/watch?v=jfKfPfyJRdk"
    };

    cy.createRecommendation(recommendation)

    cy.contains("Random").click()

    cy.contains(`${recommendation.name}`).should("be.visible")
  })
})

afterEach(() => {
  cy.resetDatabase()
})
