import { HttpRouter } from "../../../infrastructure/http/http-router";
import type { CreateActivityUseCase } from "../../../application/activities/create-activity.use-case";
import type { ListActivitiesUseCase } from "../../../application/activities/list-activities.use-case";
import { CreateActivityRoute } from "./create-activity.route";
import { ListActivitiesRoute } from "./list-activities.route";

export interface ActivityDeps {
  createActivity: CreateActivityUseCase;
  listActivities: ListActivitiesUseCase;
}

export class ActivitiesRouter extends HttpRouter {
  readonly path = "/:id/activities";

  static create(deps: ActivityDeps): ActivitiesRouter {
    return new ActivitiesRouter().register(
      new CreateActivityRoute(deps.createActivity),
      new ListActivitiesRoute(deps.listActivities)
    );
  }
}
