import { HttpRoute } from "../../../infrastructure/http/http-route";
import { HttpMethod } from "../../../infrastructure/http/http-method";
import type { HttpRequest } from "../../../infrastructure/http/http-request";
import type { DeleteContactUseCase } from "../../../application/contacts/delete-contact.use-case";
import { idParamSchema } from "../../validators/common.schemas";

export class DeleteContactRoute extends HttpRoute {
  readonly path = "/:id";
  readonly methods = [HttpMethod.DELETE];

  constructor(private readonly useCase: DeleteContactUseCase) {
    super();
  }

  protected async delete(req: HttpRequest): Promise<void> {
    const { id } = idParamSchema.parse(req.params);
    await this.useCase.execute(id);
  }
}
