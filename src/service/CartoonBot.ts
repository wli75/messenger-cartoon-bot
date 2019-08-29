import { inject, injectable } from "inversify";
import { InstagramDao } from "../dao/InstagramDao";
import { Blog } from "../model/dao/Blog";
import { Post } from "../model/dao/Post";
import { Subscription } from "../model/dao/Subscription";
import { Post as InstagramPost } from "../model/instagram/Post";
import { MessagingType } from "../model/messenger/MessagingType";
import TYPES from "../types";
import { compareDate } from "../util/dateUtils";
import { InstagramService } from "./InstagramService";
import { MessengerSender } from "./MessengerSender";
import { User } from "../model/dao/User";
import { Tag } from "../model/messenger/Tag";
import logger from "../util/logger";

@injectable()
export class CartoonBot {
  // Glitch projects will sleep after 5 min (https://glitch.com/help/restrictions/)
  private CARTOON_UPDATE_HOUR_INTERVAL = 1;
  private LINE_BREAK = "\n";
  private DEFAULT_INSTAGRAM_ACCOUNTS = ["safely_endangered", "dami_lee"];
  private COMMANDS = [
    "help - display a list of things you can ask me.",
    "show subscription - display Instagram accounts you're subscribed to.",
    "subscribe [account] - subscribe to an Instagram account.",
    "unsubscribe [account] - unsubscribe from an Instagram account.",
    "notification [on/off] - enable/disable cartoon update notifications.",
    "update - send cartoon update.",
  ];

  private messengerSender: MessengerSender;
  private instagramService: InstagramService;
  private instagramDao: InstagramDao;

  public constructor(
    @inject(TYPES.MessengerSender) messengerSender: MessengerSender,
    @inject(TYPES.InstagramService) instagramService: InstagramService,
    @inject(TYPES.InstagramDao) instagramDao: InstagramDao
  ) {
    this.messengerSender = messengerSender;
    this.instagramService = instagramService;
    this.instagramDao = instagramDao;
    this.setCartoonUpdateSchedule();
  }

  /**
   * Register user, subscribe to default instagram accounts and send welcome message.
   * @param psid Messenger psid of the user
   */
  public getStarted(psid: string): void {
    this.instagramDao.insertUser(psid, true);
    this.DEFAULT_INSTAGRAM_ACCOUNTS.forEach((blogName: string): void => {
      this.subscribe(psid, blogName);
    });
    this.sendWelcomeMessage(psid);
  }

  private sendWelcomeMessage(psid: string): void {
    const msgs = [
      "Welcome! Enjoy the cartoons on Instagram.",
      'Type "help" for more info.',
    ];
    this.messengerSender.sendText(
      psid,
      msgs.join(this.LINE_BREAK),
      MessagingType.Response
    );
  }

  /**
   * List all Instagram accounts that the user is subscribed to.
   * @param psid Messenger psid of the user
   */
  public sendSubscriptionsMessage(psid: string): void {
    const subscriptions = this.instagramDao
      .getSubscriptionsByPsid(psid)
      .map((subscription: Subscription): string => subscription.blogName);
    if (subscriptions && subscriptions.length) {
      const msg = "You are subscribed to: " + subscriptions.join(", ");
      this.messengerSender.sendText(psid, msg, MessagingType.Response);
    } else {
      const msg = "You have no subscriptions.";
      this.messengerSender.sendText(psid, msg, MessagingType.Response);
    }
  }

  /**
   * Send help message with a list of things users can ask the bot.
   * @param psid Messenger psid of the user
   */
  public sendHelpMessage(psid: string): void {
    const msgs = ["You can ask me these things..."].concat(this.COMMANDS);
    this.messengerSender.sendText(
      psid,
      msgs.join(this.LINE_BREAK + this.LINE_BREAK),
      MessagingType.Response
    );
  }

  /**
   * Send a "I don't understand" message (used when the bot does not recognize a user input).
   * @param psid Messenger psid of the user
   */
  public sendUnknownMessage(psid: string): void {
    const msg = 'Sorry I don\'t understand. Type "help" for more info.';
    this.messengerSender.sendText(psid, msg, MessagingType.Response);
  }

  /**
   * Subscribe a user to an Instagram account.
   * @param psid Messenger psid of the user
   * @param blogName Instagram blog name
   */
  public subscribeAndSendMessage(psid: string, blogName: string): void {
    this.subscribe(psid, blogName);
    const msg = `You\'ve subscribed to ${blogName}`;
    this.messengerSender.sendText(psid, msg, MessagingType.Response);
  }

  private subscribe(psid: string, blogName: string): void {
    const blog = this.instagramDao.getOrInsertBlog(blogName);
    this.instagramDao.insertSubscription(psid, blog.id);
  }

  /**
   * Unsubscribe a user from an Instagram account.
   * @param psid Messenger psid of the user
   * @param blogName Instagram blog name
   */
  public unsubscribeAndSendMessage(psid: string, blogName: string): void {
    const blog = this.instagramDao.getBlog(blogName);
    if (blog) {
      // Delete subscription
      this.instagramDao.deleteSubscription(psid, blog.id);
      // Delete blog
      const subscriptions = this.instagramDao.getSubscriptionsByBlogId(blog.id);
      if (!subscriptions || !subscriptions.length) {
        this.instagramDao.deleteBlog(blog.id);
      }
      // Send message
      const msg = `You\'ve unsubscribed from ${blogName}`;
      this.messengerSender.sendText(psid, msg, MessagingType.Response);
    } else {
      const msg = `You\'re not subscribed to ${blogName}`;
      this.messengerSender.sendText(psid, msg, MessagingType.Response);
    }
  }

  /**
   * Enable/disable notification.
   * @param psid Messenger psid of the user
   * @param enableNotification Enable notification flag
   */
  public setNotificationFlagAndSendMessage(
    psid: string,
    enableNotification: boolean
  ): void {
    this.instagramDao.updateNotificationFlag(psid, enableNotification);
    const msg = enableNotification
      ? "Notification is now enabled."
      : "Notification is now disabled.";
    this.messengerSender.sendText(psid, msg, MessagingType.Response);
  }

  private setCartoonUpdateSchedule(): void {
    logger.info("Setting up cartoon update schedule");
    this.sendCartoonUpdateForAllUsers();
    setInterval((): void => {
      this.sendCartoonUpdateForAllUsers();
    }, this.CARTOON_UPDATE_HOUR_INTERVAL * 60 * 60 * 1000);
  }

  private sendCartoonUpdateForAllUsers(): void {
    const updateTs = this.instagramDao.getLastCartoonUpdateTs();

    if (!updateTs || !this.tsWithinRangeFromNow(updateTs)) {
      logger.info("Sending cartoon updates to all users");
      const users = this.instagramDao
        .getUsers()
        .filter((user: User): boolean => {
          return user.enableNotification;
        });
      users.forEach((user: User): void => {
        this.sendCartoonUpdate(user.psid, MessagingType.MessageTag);
      });
      this.instagramDao.insertOrUpdateLastCartoonUpdateTs();
    }
  }

  private tsWithinRangeFromNow(ts: Date): boolean {
    const now = new Date().getTime();
    return (
      now - ts.getTime() < this.CARTOON_UPDATE_HOUR_INTERVAL * 60 * 60 * 1000
    );
  }

  /**
   * Randomly pick a cartoon update from the Instagram accounts the user is subscribed to, and send it.
   * @param psid Messenger psid of the user
   */
  public async sendCartoonUpdate(
    psid: string,
    msgType: MessagingType
  ): Promise<void> {
    const blogWithPost = await this.createUpdatePost(psid);
    if (blogWithPost) {
      const blog = blogWithPost[0];
      const instagramPost = blogWithPost[1];
      const tag =
        msgType === MessagingType.Response
          ? undefined
          : Tag.NonPromotionalSubscription;
      // Send post
      this.messengerSender.sendImage(psid, instagramPost.uri, msgType, tag);
      // Save post
      this.instagramDao.insertPost(psid, blog.id, instagramPost.id);
    } else if (msgType === MessagingType.Response) {
      const msg = "No cartoon updates.";
      this.messengerSender.sendText(psid, msg, msgType);
    }
  }

  private async createUpdatePost(
    psid: string
  ): Promise<[Blog, InstagramPost] | undefined> {
    const subscriptions = this.instagramDao.getSubscriptionsByPsid(psid);
    const posts = this.instagramDao.getLatestSentPosts(psid);
    const subscriptionWithPosts = this.createSubscriptionWithPosts(
      subscriptions,
      posts
    ).sort(this.compareSubscriptionWithPost);
    for (const subscriptionWithPost of subscriptionWithPosts) {
      const subscription = subscriptionWithPost[0];
      const sentPost = subscriptionWithPost[1];
      const instagramPost = await this.instagramService.getLatestPost(
        subscription.blogName
      );
      if (instagramPost) {
        if (!sentPost || sentPost.postId !== instagramPost.id) {
          const blog: Blog = {
            id: subscription.blogId,
            name: subscription.blogName,
          };
          return [blog, instagramPost];
        }
      }
    }
    return undefined;
  }

  private createSubscriptionWithPosts(
    subscriptions: Subscription[],
    posts: Post[]
  ): [Subscription, Post | undefined][] {
    return subscriptions.map((subscription: Subscription): [
      Subscription,
      Post | undefined
    ] => {
      const post = posts.find((post: Post): boolean => {
        return post.blogId === subscription.blogId;
      });
      return [subscription, post];
    });
  }

  private compareSubscriptionWithPost(
    a: [Subscription, Post | undefined],
    b: [Subscription, Post | undefined]
  ): number {
    if (!a[1]) return -1;
    else if (!b[1]) return 1;
    else return compareDate(a[1].transactFromTs, b[1].transactFromTs);
  }
}
