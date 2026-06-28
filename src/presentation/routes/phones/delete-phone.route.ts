import { HttpRoute } from "../../../infrastructure/http/http-route";
import { HttpMethod } from "../../../infrastructure/http/http-method";
import type { HttpRequest } from "../../../infrastructure/http/http-request";
import type { DeletePhoneUseCase } from "../../../application/phones/delete-phone.use-case";
import { phoneParamsSchema } from "../../validators/common.schemas";

export class DeletePhoneRoute extends HttpRoute {
  readonly path = "/:phoneId";
  readonly methods = [HttpMethod.DELETE];

  constructor(private readonly useCase: DeletePhoneUseCase) {
    super();
  }

  protected async delete(req: HttpRequest): Promise<void> {
    const { id, phoneId } = phoneParamsSchema.parse(req.params);
    await this.useCase.execute(id, phoneId);
  }
}
