import { HttpRoute } from "../../../infrastructure/http/http-route";
import { HttpMethod } from "../../../infrastructure/http/http-method";
import type { HttpRequest } from "../../../infrastructure/http/http-request";
import type { ListContactsUseCase } from "../../../application/contacts/list-contacts.use-case";
import { listContactsQuerySchema } from "../../validators/contact.schemas";
import { toListContactsFilters, toPaginatedContactsResponse } from "../../mappers/contact.mapper";

export class ListContactsRoute extends HttpRoute {
  readonly path = "/";
  readonly methods = [HttpMethod.GET];

  constructor(private readonly useCase: ListContactsUseCase) {
    super();
  }

  protected async get(req: HttpRequest) {
    const query = listContactsQuerySchema.parse(req.query);
    const filters = toListContactsFilters(query);
    const result = await this.useCase.execute(filters);
    return toPaginatedContactsResponse(result);
  }
}
