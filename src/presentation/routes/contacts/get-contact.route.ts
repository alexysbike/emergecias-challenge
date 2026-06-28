import { HttpRoute } from "../../../infrastructure/http/http-route";
import { HttpMethod } from "../../../infrastructure/http/http-method";
import type { HttpRequest } from "../../../infrastructure/http/http-request";
import type { GetContactUseCase } from "../../../application/contacts/get-contact.use-case";
import { idParamSchema } from "../../validators/common.schemas";
import { toContactResponse } from "../../mappers/contact.mapper";

export class GetContactRoute extends HttpRoute {
  readonly path = "/:id";
  readonly methods = [HttpMethod.GET];

  constructor(private readonly useCase: GetContactUseCase) {
    super();
  }

  protected async get(req: HttpRequest) {
    const { id } = idParamSchema.parse(req.params);
    const contact = await this.useCase.execute(id);
    return toContactResponse(contact);
  }
}
