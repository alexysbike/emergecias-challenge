import { HttpMethod } from "../../../src/infrastructure/http/http-method";
import { HttpRoute } from "../../../src/infrastructure/http/http-route";
import { HttpRouter } from "../../../src/infrastructure/http/http-router";
import { flattenRouters } from "../../../src/infrastructure/http/path-utils";

class TestRoute extends HttpRoute {
  constructor(
    readonly path: string,
    readonly methods = [HttpMethod.GET]
  ) {
    super();
  }
}

class TestRouter extends HttpRouter {
  constructor(readonly path: string) {
    super();
  }
}

describe("flattenRouters", () => {
  it("joins router and route paths", () => {
    const router = new TestRouter("/contacts").register(new TestRoute("/"));

    expect(flattenRouters([router])).toEqual([{ path: "/contacts", route: expect.any(TestRoute) }]);
  });

  it("flattens nested routers recursively", () => {
    const activities = new TestRouter("/:id/activities").register(new TestRoute("/"));
    const contacts = new TestRouter("/contacts").register(new TestRoute("/:id")).mount(activities);

    expect(flattenRouters([contacts]).map(({ path }) => path)).toEqual([
      "/contacts/:id",
      "/contacts/:id/activities",
    ]);
  });

  it("flattens multiple top-level routers", () => {
    const health = new TestRouter("/health").register(new TestRoute("/"));
    const contacts = new TestRouter("/contacts").register(new TestRoute("/"));

    expect(flattenRouters([health, contacts]).map(({ path }) => path)).toEqual([
      "/health",
      "/contacts",
    ]);
  });
});
