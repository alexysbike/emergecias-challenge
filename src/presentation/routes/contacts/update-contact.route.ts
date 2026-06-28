import { HttpRoute } from "../../../infrastructure/http/http-route";
import { HttpMethod } from "../../../infrastructure/http/http-method";
import type { HttpRequest } from "../../../infrastructure/http/http-request";
import type { UpdateContactUseCase } from "../../../application/contacts/update-contact.use-case";
import { idParamSchema } from "../../validators/common.schemas";
import { updateContactSchema } from "../../validators/contact.schemas";
import { toContactResponse } from "../../mappers/contact.mapper";

export class UpdateContactRoute extends HttpRoute {
  readonly path = "/:id";
  readonly methods = [HttpMethod.PATCH];

  constructor(private readonly useCase: UpdateContactUseCase) {
    super();
  }

  protected async patch(req: HttpRequest) {
    const { id } = idParamSchema.parse(req.params);
    const input = updateContactSchema.parse(req.body);
    const contact = await this.useCase.execute(id, input);
    return toContactResponse(contact);
  }
}
