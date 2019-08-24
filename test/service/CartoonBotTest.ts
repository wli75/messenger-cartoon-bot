import "reflect-metadata";

import { InstagramDao } from "../../src/dao/InstagramDao";
import { Blog } from "../../src/model/dao/Blog";
import { Post } from "../../src/model/dao/Post";
import { Subscription } from "../../src/model/dao/Subscription";
import { Post as InstagramPost } from "../../src/model/instagram/Post";
import { MessagingType } from "../../src/model/messenger/MessagingType";
import { CartoonBot } from "../../src/service/CartoonBot";
import { InstagramService } from "../../src/service/InstagramService";
import { MessengerSender } from "../../src/service/MessengerSender";
import { Tag } from "../../src/model/messenger/Tag";

jest.mock("../../src/service/MessengerSender");
jest.mock("../../src/service/InstagramService");
jest.mock("../../src/dao/InstagramDao");
jest.useFakeTimers();

describe("CartoonBot", (): void => {
  let messengerSender: jest.Mocked<MessengerSender>;
  let instagramService: jest.Mocked<InstagramService>;
  let instagramDao: jest.Mocked<InstagramDao>;
  let cartoonBot: CartoonBot;

  beforeEach((): void => {
    messengerSender = new MessengerSender() as jest.Mocked<MessengerSender>;
    instagramService = new InstagramService() as jest.Mocked<InstagramService>;
    instagramDao = new InstagramDao() as jest.Mocked<InstagramDao>;
    cartoonBot = new CartoonBot(
      messengerSender,
      instagramService,
      instagramDao
    );
  });

  describe("setCartoonUpdateSchedule", (): void => {
    test("should set interval", async (): Promise<void> => {
      expect(setInterval).toHaveBeenCalledTimes(1);
    });
  });

  describe("getStarted", (): void => {
    test("should subscribe to default instagram accounts, and send welcome message", (): void => {
      instagramDao.getOrInsertBlog.mockImplementation(
        (blogName: string): Blog => {
          return { id: 1, name: "blogName" };
        }
      );

      cartoonBot.getStarted("psid");

      expect(instagramDao.insertUser).toBeCalledWith("psid", true);
      expect(instagramDao.getOrInsertBlog).toBeCalledTimes(2);
      expect(instagramDao.insertSubscription).toBeCalledTimes(2);
      expect(messengerSender.sendText).toBeCalledWith(
        "psid",
        'Welcome! Enjoy the cartoons on Instagram.\nType "help" for more info.',
        MessagingType.Response
      );
    });
  });

  describe("sendSubscriptionsMessage", (): void => {
    test("should send all Instagram subscriptions", (): void => {
      instagramDao.getSubscriptionsByPsid.mockImplementation(
        (psid: string): Subscription[] => {
          return [
            { psid: "psid", blogId: 1, blogName: "blogName1" },
            { psid: "psid", blogId: 2, blogName: "blogName2" },
          ];
        }
      );

      cartoonBot.sendSubscriptionsMessage("psid");

      expect(messengerSender.sendText).toBeCalledWith(
        "psid",
        "You are subscribed to: blogName1, blogName2",
        MessagingType.Response
      );
    });

    test("should send a message if there are no subscriptions", (): void => {
      instagramDao.getSubscriptionsByPsid.mockImplementation(
        (psid: string): Subscription[] => {
          return [];
        }
      );

      cartoonBot.sendSubscriptionsMessage("psid");

      expect(messengerSender.sendText).toBeCalledWith(
        "psid",
        "You have no subscriptions.",
        MessagingType.Response
      );
    });
  });

  describe("sendHelpMessage", (): void => {
    test("should send a list of things the user can ask the bot", (): void => {
      cartoonBot.sendHelpMessage("psid");

      expect(messengerSender.sendText).toBeCalledWith(
        "psid",
        "You can ask me these things...\n\n" +
          "help - display a list of things you can ask me.\n\n" +
          "show subscription - display Instagram accounts you're subscribed to.\n\n" +
          "subscribe [account] - subscribe to an Instagram account.\n\n" +
          "unsubscribe [account] - unsubscribe from an Instagram account.\n\n" +
          "notification [on/off] - enable/disable cartoon update notifications.\n\n" +
          "update - send cartoon update.",
        MessagingType.Response
      );
    });
  });

  describe("sendUnknownMessage", (): void => {
    test("should send a I don't understand message", (): void => {
      cartoonBot.sendUnknownMessage("psid");

      expect(messengerSender.sendText).toBeCalledWith(
        "psid",
        'Sorry I don\'t understand. Type "help" for more info.',
        MessagingType.Response
      );
    });
  });

  describe("subscribeAndSendMessage", (): void => {
    test("should subscribe to the Instagram account, and send a message", (): void => {
      instagramDao.getOrInsertBlog.mockImplementation(
        (blogName: string): Blog => {
          return { id: 1, name: "blogName" };
        }
      );

      cartoonBot.subscribeAndSendMessage("psid", "blogName");

      expect(instagramDao.getOrInsertBlog).toBeCalledWith("blogName");
      expect(instagramDao.insertSubscription).toBeCalledWith("psid", 1);
      expect(messengerSender.sendText).toBeCalledWith(
        "psid",
        "You've subscribed to blogName",
        MessagingType.Response
      );
    });
  });

  describe("unsubscribeAndSendMessage", (): void => {
    test("should delete subscription, and send a message", (): void => {
      instagramDao.getBlog.mockImplementation(
        (blogName: string): Blog => {
          return { id: 1, name: "blogName" };
        }
      );
      instagramDao.getSubscriptionsByBlogId.mockImplementation(
        (blogId: number): Subscription[] => {
          return [{ psid: "psid2", blogId: 1, blogName: "blogName" }];
        }
      );

      cartoonBot.unsubscribeAndSendMessage("psid", "blogName");

      expect(instagramDao.deleteSubscription).toBeCalledWith("psid", 1);
      expect(instagramDao.deleteBlog).toBeCalledTimes(0);
      expect(messengerSender.sendText).toBeCalledWith(
        "psid",
        "You've unsubscribed from blogName",
        MessagingType.Response
      );
    });

    test("should delete subscription, delete blog, and send a message if the Instagram account does not have any subscriptions", (): void => {
      instagramDao.getBlog.mockImplementation(
        (blogName: string): Blog => {
          return { id: 1, name: "blogName" };
        }
      );
      instagramDao.getSubscriptionsByBlogId.mockImplementation(
        (blogId: number): Subscription[] => {
          return [];
        }
      );

      cartoonBot.unsubscribeAndSendMessage("psid", "blogName");

      expect(instagramDao.deleteSubscription).toBeCalledWith("psid", 1);
      expect(instagramDao.deleteBlog).toBeCalledWith(1);
      expect(messengerSender.sendText).toBeCalledWith(
        "psid",
        "You've unsubscribed from blogName",
        MessagingType.Response
      );
    });

    test("should send a message if the user is not subscribed to the Instagram account", (): void => {
      cartoonBot.unsubscribeAndSendMessage("psid", "blogName");

      expect(messengerSender.sendText).toBeCalledWith(
        "psid",
        "You're not subscribed to blogName",
        MessagingType.Response
      );
    });
  });

  describe("handleEnableNotificationMessage", (): void => {
    test("should enable notification, and send a message", (): void => {
      cartoonBot.setNotificationFlagAndSendMessage("psid", true);

      expect(instagramDao.updateNotificationFlag).toBeCalledWith("psid", true);
      expect(messengerSender.sendText).toBeCalledWith(
        "psid",
        "Notification is now enabled.",
        MessagingType.Response
      );
    });

    test("should disable notification, and send a message", (): void => {
      cartoonBot.setNotificationFlagAndSendMessage("psid", false);

      expect(instagramDao.updateNotificationFlag).toBeCalledWith("psid", false);
      expect(messengerSender.sendText).toBeCalledWith(
        "psid",
        "Notification is now disabled.",
        MessagingType.Response
      );
    });
  });

  describe("sendCartoonUpdate", (): void => {
    test("should send cartoon update from the Instagram account with the oldest sent post", async (): Promise<
      void
    > => {
      instagramDao.getSubscriptionsByPsid.mockImplementation(
        (psid: string): Subscription[] => {
          return [
            { psid: "psid", blogId: 1, blogName: "blogName1" },
            { psid: "psid", blogId: 2, blogName: "blogName2" },
          ];
        }
      );
      instagramDao.getLatestSentPosts.mockImplementation(
        (psid: string): Post[] => {
          return [
            {
              psid: "psid",
              blogId: 1,
              postId: "postId1",
              transactFromTs: "2019-08-25 00:00:00",
            },
            {
              psid: "psid",
              blogId: 2,
              postId: "postId1",
              transactFromTs: "2019-08-24 00:00:00",
            },
          ];
        }
      );
      instagramService.getLatestPost.mockImplementation(
        (blogName: string): Promise<InstagramPost> => {
          return Promise.resolve({ id: "postId2", uri: "uri" });
        }
      );

      await cartoonBot.sendCartoonUpdate("psid", MessagingType.Response);

      expect(messengerSender.sendImage).toBeCalledWith(
        "psid",
        "uri",
        MessagingType.Response,
        undefined
      );
      expect(instagramDao.insertPost).toBeCalledWith("psid", 2, "postId2");
    });

    test("should send a message if there are no cartoon updates", async (): Promise<
      void
    > => {
      instagramDao.getSubscriptionsByPsid.mockImplementation(
        (psid: string): Subscription[] => {
          return [{ psid: "psid", blogId: 1, blogName: "blogName" }];
        }
      );
      instagramDao.getLatestSentPosts.mockImplementation(
        (psid: string): Post[] => {
          return [
            {
              psid: "psid",
              blogId: 1,
              postId: "postId1",
              transactFromTs: "2019-08-24 00:00:00",
            },
          ];
        }
      );
      instagramService.getLatestPost.mockImplementation(
        (blogName: string): Promise<InstagramPost> => {
          return Promise.resolve({ id: "postId1", uri: "uri" });
        }
      );

      await cartoonBot.sendCartoonUpdate("psid", MessagingType.Response);

      expect(messengerSender.sendText).toBeCalledWith(
        "psid",
        "No cartoon updates.",
        MessagingType.Response
      );
    });

    test("should send a message if there are no Instagram posts", async (): Promise<
      void
    > => {
      instagramDao.getSubscriptionsByPsid.mockImplementation(
        (psid: string): Subscription[] => {
          return [{ psid: "psid", blogId: 1, blogName: "blogName" }];
        }
      );
      instagramDao.getLatestSentPosts.mockImplementation(
        (psid: string): Post[] => {
          return [];
        }
      );
      instagramService.getLatestPost.mockImplementation(
        (blogName: string): Promise<undefined> => {
          return Promise.resolve(undefined);
        }
      );

      await cartoonBot.sendCartoonUpdate("psid", MessagingType.Response);

      expect(messengerSender.sendText).toBeCalledWith(
        "psid",
        "No cartoon updates.",
        MessagingType.Response
      );
    });

    test("should send a message if there are no subscriptions", async (): Promise<
      void
    > => {
      instagramDao.getSubscriptionsByPsid.mockImplementation(
        (psid: string): Subscription[] => {
          return [];
        }
      );

      await cartoonBot.sendCartoonUpdate("psid", MessagingType.Response);

      expect(messengerSender.sendText).toBeCalledWith(
        "psid",
        "No cartoon updates.",
        MessagingType.Response
      );
    });

    test("should send cartoon update triggered by update interval from the Instagram account with no sent posts", async (): Promise<
      void
    > => {
      instagramDao.getSubscriptionsByPsid.mockImplementation(
        (psid: string): Subscription[] => {
          return [
            { psid: "psid", blogId: 1, blogName: "blogName1" },
            { psid: "psid", blogId: 2, blogName: "blogName2" },
          ];
        }
      );
      instagramDao.getLatestSentPosts.mockImplementation(
        (psid: string): Post[] => {
          return [
            {
              psid: "psid",
              blogId: 1,
              postId: "postId1",
              transactFromTs: "2019-08-25 00:00:00",
            },
          ];
        }
      );
      instagramService.getLatestPost.mockImplementation(
        (blogName: string): Promise<InstagramPost> => {
          return Promise.resolve({ id: "postId1", uri: "uri" });
        }
      );

      await cartoonBot.sendCartoonUpdate("psid", MessagingType.MessageTag);

      expect(messengerSender.sendImage).toBeCalledWith(
        "psid",
        "uri",
        MessagingType.MessageTag,
        Tag.NonPromotionalSubscription
      );
      expect(instagramDao.insertPost).toBeCalledWith("psid", 2, "postId1");
    });

    test("should do nothing if there are no cartoon updates triggered by the update interval", async (): Promise<
      void
    > => {
      instagramDao.getSubscriptionsByPsid.mockImplementation(
        (psid: string): Subscription[] => {
          return [{ psid: "psid", blogId: 1, blogName: "blogName" }];
        }
      );
      instagramDao.getLatestSentPosts.mockImplementation(
        (psid: string): Post[] => {
          return [
            {
              psid: "psid",
              blogId: 1,
              postId: "postId1",
              transactFromTs: "2019-08-24 00:00:00",
            },
          ];
        }
      );
      instagramService.getLatestPost.mockImplementation(
        (blogName: string): Promise<InstagramPost> => {
          return Promise.resolve({ id: "postId1", uri: "uri" });
        }
      );

      await cartoonBot.sendCartoonUpdate("psid", MessagingType.MessageTag);

      expect(messengerSender.sendImage).toBeCalledTimes(0);
      expect(messengerSender.sendText).toBeCalledTimes(0);
    });
  });
});
