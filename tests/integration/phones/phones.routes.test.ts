import request from "supertest";
import { setupTestDb } from "../../helpers/test-db";
import { createTestApp } from "../../helpers/test-app";

describe("Phones routes", () => {
  let cleanup: () => void;
  let disposeApp: () => void;
  let app: Awaited<ReturnType<typeof createTestApp>>["app"];
  let contactId: number;

  beforeAll(async () => {
    const testDb = await setupTestDb();
    cleanup = testDb.cleanup;
    const testApp = await createTestApp(testDb.dbPath);
    app = testApp.app;
    disposeApp = testApp.dispose;

    const contact = await request(app).post("/contacts").send({
      firstName: "Phone",
      lastName: "Owner",
      email: "phone-owner@example.com",
      dateOfBirth: "1990-01-01",
    });
    contactId = contact.body.id;
  });

  afterAll(() => {
    disposeApp();
    cleanup();
  });

  it("POST /contacts/:id/phones creates a phone", async () => {
    const response = await request(app).post(`/contacts/${contactId}/phones`).send({
      number: "+5491198765432",
      phoneTypeId: 2,
    });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      id: expect.any(Number),
      number: "+5491198765432",
      phoneTypeId: 2,
      phoneType: { id: 2, typeName: "Home" },
    });
  });

  it("GET /contacts/:id/phones lists phones", async () => {
    const response = await request(app).get(`/contacts/${contactId}/phones`);
    expect(response.status).toBe(200);
    expect(response.body.length).toBeGreaterThanOrEqual(1);
  });

  it("GET /contacts/:id/phones/:phoneId returns a phone", async () => {
    const created = await request(app).post(`/contacts/${contactId}/phones`).send({
      number: "+5491187654321",
      phoneTypeId: 3,
    });

    const response = await request(app).get(`/contacts/${contactId}/phones/${created.body.id}`);
    expect(response.status).toBe(200);
    expect(response.body.number).toBe("+5491187654321");
  });

  it("PATCH /contacts/:id/phones/:phoneId updates a phone", async () => {
    const created = await request(app).post(`/contacts/${contactId}/phones`).send({
      number: "+5491176543210",
      phoneTypeId: 1,
    });

    const response = await request(app)
      .patch(`/contacts/${contactId}/phones/${created.body.id}`)
      .send({ number: "+5491100000000" });

    expect(response.status).toBe(200);
    expect(response.body.number).toBe("+5491100000000");
  });

  it("DELETE /contacts/:id/phones/:phoneId removes a phone", async () => {
    const created = await request(app).post(`/contacts/${contactId}/phones`).send({
      number: "+5491165432109",
      phoneTypeId: 1,
    });

    const deleteResponse = await request(app).delete(
      `/contacts/${contactId}/phones/${created.body.id}`
    );
    expect(deleteResponse.status).toBe(204);

    const getResponse = await request(app).get(`/contacts/${contactId}/phones/${created.body.id}`);
    expect(getResponse.status).toBe(404);
  });

  it("returns 404 for non-existent contact", async () => {
    const response = await request(app).get("/contacts/99999/phones");
    expect(response.status).toBe(404);
  });

  it("returns 400 for invalid phoneTypeId", async () => {
    const response = await request(app).post(`/contacts/${contactId}/phones`).send({
      number: "+5491111111111",
      phoneTypeId: 999,
    });
    expect(response.status).toBe(400);
  });

  it("returns 404 when phone belongs to another contact", async () => {
    const otherContact = await request(app).post("/contacts").send({
      firstName: "Other",
      lastName: "Contact",
      email: "other-phone@example.com",
      dateOfBirth: "1990-01-01",
    });

    const phone = await request(app).post(`/contacts/${contactId}/phones`).send({
      number: "+5491122222222",
      phoneTypeId: 1,
    });

    const response = await request(app).get(
      `/contacts/${otherContact.body.id}/phones/${phone.body.id}`
    );
    expect(response.status).toBe(404);
  });
});
