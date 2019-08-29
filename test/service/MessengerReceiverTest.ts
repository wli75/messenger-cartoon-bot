import "reflect-metadata";

import { InstagramDao } from "../../src/dao/InstagramDao";
import { Event } from "../../src/model/messenger/Event";
import { ReceiveMessaging } from "../../src/model/messenger/ReceiveMessaging";
import { CartoonBot } from "../../src/service/CartoonBot";
import { InstagramService } from "../../src/service/InstagramService";
import { MessengerReceiver } from "../../src/service/MessengerReceiver";
import { MessengerSender } from "../../src/service/MessengerSender";
import { MessagingType } from "../../src/model/messenger/MessagingType";

jest.mock("../../src/service/MessengerSender");
jest.mock("../../src/service/InstagramService");
jest.mock("../../src/dao/InstagramDao");
jest.mock("../../src/service/CartoonBot");

function createEvent(messaging: ReceiveMessaging[]): Event {
  return {
    object: "page",
    entry: [
      {
        id: "pageId",
        time: 1,
        messaging: messaging,
      },
    ],
  };
}

function createMessageMessaging(text: string): ReceiveMessaging {
  return {
    sender: { id: "senderId" },
    recipient: { id: "recipientId" },
    message: {
      mid: "mid",
      text: text,
    },
  };
}

function createGetStartedPostbackMessaging(): ReceiveMessaging {
  return {
    sender: { id: "senderId" },
    recipient: { id: "recipientId" },
    postback: {
      title: "Get Started",
      payload: '{"action":"start_action"}',
    },
  };
}

describe("MessengerReceiver", (): void => {
  let cartoonBot: jest.Mocked<CartoonBot>;
  let messengerReceiver: MessengerReceiver;

  beforeEach((): void => {
    cartoonBot = new CartoonBot(
      new MessengerSender() as jest.Mocked<MessengerSender>,
      new InstagramService() as jest.Mocked<InstagramService>,
      new InstagramDao() as jest.Mocked<InstagramDao>
    ) as jest.Mocked<CartoonBot>;
    messengerReceiver = new MessengerReceiver(cartoonBot);
  });

  describe("handlePageEvent", (): void => {
    test("should handle start action postback", async (): Promise<void> => {
      const event = createEvent([createGetStartedPostbackMessaging()]);
      await messengerReceiver.handlePageEvent(event);

      expect(cartoonBot.getStarted).toBeCalledWith("senderId");
    });

    test("should handle help message", async (): Promise<void> => {
      const event = createEvent([createMessageMessaging("Help")]);
      await messengerReceiver.handlePageEvent(event);

      expect(cartoonBot.sendHelpMessage).toBeCalledWith("senderId");
    });

    test("should handle show subscription message", async (): Promise<void> => {
      const event = createEvent([createMessageMessaging("show subscriptions")]);
      await messengerReceiver.handlePageEvent(event);

      expect(cartoonBot.sendSubscriptionsMessage).toBeCalledWith("senderId");
    });

    test("should handle unsubscribe message", async (): Promise<void> => {
      const event = createEvent([
        createMessageMessaging("unsubscribe  blogName"),
      ]);
      await messengerReceiver.handlePageEvent(event);

      expect(cartoonBot.unsubscribeAndSendMessage).toBeCalledWith(
        "senderId",
        "blogName"
      );
    });

    test("should handle unsubscribe message with unknown blog name", async (): Promise<
      void
    > => {
      const event = createEvent([createMessageMessaging("unsubscribe")]);
      await messengerReceiver.handlePageEvent(event);

      expect(cartoonBot.sendUnknownMessage).toBeCalledWith("senderId");
    });

    test("should handle subscribe message", async (): Promise<void> => {
      const event = createEvent([
        createMessageMessaging("subscribe   blogName  "),
      ]);
      await messengerReceiver.handlePageEvent(event);

      expect(cartoonBot.subscribeAndSendMessage).toBeCalledWith(
        "senderId",
        "blogName"
      );
    });

    test("should handle subscribe message with an unknown blog name", async (): Promise<
      void
    > => {
      const event = createEvent([createMessageMessaging("  subscribe   ")]);
      await messengerReceiver.handlePageEvent(event);

      expect(cartoonBot.sendUnknownMessage).toBeCalledWith("senderId");
    });

    test("should handle enable notification message", async (): Promise<
      void
    > => {
      const event = createEvent([createMessageMessaging("notification   ON ")]);
      await messengerReceiver.handlePageEvent(event);

      expect(cartoonBot.setNotificationFlagAndSendMessage).toBeCalledWith(
        "senderId",
        true
      );
    });

    test("should handle disable notification message", async (): Promise<
      void
    > => {
      const event = createEvent([createMessageMessaging("  NOTIFICATION OFF")]);
      await messengerReceiver.handlePageEvent(event);

      expect(cartoonBot.setNotificationFlagAndSendMessage).toBeCalledWith(
        "senderId",
        false
      );
    });

    test("should handle notification message with an unknown flag", async (): Promise<
      void
    > => {
      const event = createEvent([createMessageMessaging("  NOTIFICATION")]);
      await messengerReceiver.handlePageEvent(event);

      expect(cartoonBot.sendUnknownMessage).toBeCalledWith("senderId");
    });

    test("should handle update message", async (): Promise<void> => {
      const event = createEvent([createMessageMessaging("  UpdAte  ")]);
      await messengerReceiver.handlePageEvent(event);

      expect(cartoonBot.sendCartoonUpdate).toBeCalledWith(
        "senderId",
        MessagingType.Response
      );
    });

    test("should handle unknown message", async (): Promise<void> => {
      const event = createEvent([createMessageMessaging("   ")]);
      await messengerReceiver.handlePageEvent(event);

      expect(cartoonBot.sendUnknownMessage).toBeCalledWith("senderId");
    });
  });
});
