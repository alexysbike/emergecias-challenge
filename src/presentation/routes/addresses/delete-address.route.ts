import { HttpRoute } from "../../../infrastructure/http/http-route";
import { HttpMethod } from "../../../infrastructure/http/http-method";
import type { HttpRequest } from "../../../infrastructure/http/http-request";
import type { DeleteAddressUseCase } from "../../../application/addresses/delete-address.use-case";
import { addressParamsSchema } from "../../validators/common.schemas";

export class DeleteAddressRoute extends HttpRoute {
  readonly path = "/:addressId";
  readonly methods = [HttpMethod.DELETE];

  constructor(private readonly useCase: DeleteAddressUseCase) {
    super();
  }

  protected async delete(req: HttpRequest): Promise<void> {
    const { id, addressId } = addressParamsSchema.parse(req.params);
    await this.useCase.execute(id, addressId);
  }
}
