import "reflect-metadata";

import { InstagramService } from "../../src/service/InstagramService";

describe("InstagramService", (): void => {
  let instagramService: InstagramService;

  beforeEach((): void => {
    instagramService = new InstagramService();
  });

  describe("getLatestPost", (): void => {
    test("should return an Instagram post from a valid Instagram account", async (): Promise<
      void
    > => {
      const post = await instagramService.getLatestPost("dami_lee");
      expect(post).toBeDefined();
    });

    test("should return undefined from an invalid Instagram account", async (): Promise<
      void
    > => {
      const post = await instagramService.getLatestPost("123456789  0");
      expect(post).toBeUndefined();
    });
  });
});
