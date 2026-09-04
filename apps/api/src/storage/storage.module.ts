import { Global, Module } from "@nestjs/common";
import { StorageService } from "./storage.service";
import { UploadsController, PublicUploadsController } from "./uploads.controller";

@Global()
@Module({
  controllers: [UploadsController, PublicUploadsController],
  providers: [StorageService],
  exports: [StorageService],
})
export class StorageModule {}
