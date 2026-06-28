import request from "supertest";
import { setupTestDb } from "../../helpers/test-db";
import { createTestApp } from "../../helpers/test-app";

describe("Addresses routes", () => {
  let cleanup: () => void;
  let app: Awaited<ReturnType<typeof createTestApp>>;
  let contactId: number;

  beforeAll(async () => {
    const testDb = await setupTestDb();
    cleanup = testDb.cleanup;
    app = await createTestApp(testDb.dbPath);

    const contact = await request(app).post("/contacts").send({
      firstName: "Address",
      lastName: "Owner",
      email: "address-owner@example.com",
      dateOfBirth: "1990-01-01",
    });
    contactId = contact.body.id;
  });

  afterAll(() => {
    cleanup();
  });

  it("POST /contacts/:id/addresses creates an address", async () => {
    const response = await request(app).post(`/contacts/${contactId}/addresses`).send({
      locality: "Córdoba",
      street: "Av. Colón",
      number: 500,
      notes: "Office",
    });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      id: expect.any(Number),
      locality: "Córdoba",
      street: "Av. Colón",
      number: 500,
      notes: "Office",
    });
  });

  it("GET /contacts/:id/addresses lists addresses", async () => {
    const response = await request(app).get(`/contacts/${contactId}/addresses`);
    expect(response.status).toBe(200);
    expect(response.body.length).toBeGreaterThanOrEqual(1);
  });

  it("GET /contacts/:id/addresses/:addressId returns an address", async () => {
    const created = await request(app).post(`/contacts/${contactId}/addresses`).send({
      locality: "Rosario",
      street: "San Martín",
      number: 100,
    });

    const response = await request(app).get(
      `/contacts/${contactId}/addresses/${created.body.id}`
    );
    expect(response.status).toBe(200);
    expect(response.body.locality).toBe("Rosario");
  });

  it("PATCH /contacts/:id/addresses/:addressId updates an address", async () => {
    const created = await request(app).post(`/contacts/${contactId}/addresses`).send({
      locality: "Mendoza",
      street: "Las Heras",
      number: 200,
    });

    const response = await request(app)
      .patch(`/contacts/${contactId}/addresses/${created.body.id}`)
      .send({ locality: "Mendoza Capital" });

    expect(response.status).toBe(200);
    expect(response.body.locality).toBe("Mendoza Capital");
  });

  it("DELETE /contacts/:id/addresses/:addressId removes an address", async () => {
    const created = await request(app).post(`/contacts/${contactId}/addresses`).send({
      locality: "La Plata",
      street: "Calle 7",
      number: 300,
    });

    const deleteResponse = await request(app).delete(
      `/contacts/${contactId}/addresses/${created.body.id}`
    );
    expect(deleteResponse.status).toBe(204);

    const getResponse = await request(app).get(
      `/contacts/${contactId}/addresses/${created.body.id}`
    );
    expect(getResponse.status).toBe(404);
  });

  it("returns 404 for non-existent contact", async () => {
    const response = await request(app).get("/contacts/99999/addresses");
    expect(response.status).toBe(404);
  });

  it("returns 404 when address belongs to another contact", async () => {
    const otherContact = await request(app).post("/contacts").send({
      firstName: "Other",
      lastName: "Address",
      email: "other-address@example.com",
      dateOfBirth: "1990-01-01",
    });

    const address = await request(app).post(`/contacts/${contactId}/addresses`).send({
      locality: "Mar del Plata",
      street: "Luro",
      number: 400,
    });

    const response = await request(app).get(
      `/contacts/${otherContact.body.id}/addresses/${address.body.id}`
    );
    expect(response.status).toBe(404);
  });
});
