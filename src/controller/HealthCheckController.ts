import { Request } from "express";
import {
  BaseHttpController,
  controller,
  httpGet,
  interfaces,
} from "inversify-express-utils";
import logger from "../util/logger";

@controller("/healthcheck")
export class HealthCheckController extends BaseHttpController {

  @httpGet("/")
  public healthCheck(req: Request): interfaces.IHttpActionResult {
    logger.info("Received health check message");
    return this.ok();
  }
}
