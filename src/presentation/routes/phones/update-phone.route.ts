import { HttpRoute } from "../../../infrastructure/http/http-route";
import { HttpMethod } from "../../../infrastructure/http/http-method";
import type { HttpRequest } from "../../../infrastructure/http/http-request";
import type { UpdatePhoneUseCase } from "../../../application/phones/update-phone.use-case";
import { phoneParamsSchema } from "../../validators/common.schemas";
import { updatePhoneSchema } from "../../validators/phone.schemas";
import { toPhoneResponse } from "../../mappers/phone.mapper";

export class UpdatePhoneRoute extends HttpRoute {
  readonly path = "/:phoneId";
  readonly methods = [HttpMethod.PATCH];

  constructor(private readonly useCase: UpdatePhoneUseCase) {
    super();
  }

  protected async patch(req: HttpRequest) {
    const { id, phoneId } = phoneParamsSchema.parse(req.params);
    const input = updatePhoneSchema.parse(req.body);
    const phone = await this.useCase.execute(id, phoneId, input);
    return toPhoneResponse(phone);
  }
}
