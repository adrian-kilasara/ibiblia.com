import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { AdminService } from "./admin.service";

/** Guarded CRUD over every registered content resource, e.g. /api/admin/projects. */
@ApiTags("admin")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("admin")
export class AdminController {
  constructor(private readonly admin: AdminService) {}

  @Get("counts")
  counts() {
    return this.admin.counts();
  }

  @Get(":resource")
  list(@Param("resource") resource: string) {
    return this.admin.list(resource);
  }

  @Get(":resource/:id")
  get(@Param("resource") resource: string, @Param("id") id: string) {
    return this.admin.get(resource, id);
  }

  @Post(":resource")
  create(@Param("resource") resource: string, @Body() body: Record<string, unknown>) {
    return this.admin.create(resource, body);
  }

  @Patch(":resource/:id")
  update(
    @Param("resource") resource: string,
    @Param("id") id: string,
    @Body() body: Record<string, unknown>
  ) {
    return this.admin.update(resource, id, body);
  }

  @Delete(":resource/:id")
  remove(@Param("resource") resource: string, @Param("id") id: string) {
    return this.admin.remove(resource, id);
  }
}
