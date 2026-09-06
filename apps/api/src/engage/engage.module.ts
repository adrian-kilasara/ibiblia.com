import { Module } from "@nestjs/common";
import { EngageController } from "./engage.controller";

@Module({
  controllers: [EngageController],
})
export class EngageModule {}
