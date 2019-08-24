import { injectable } from "inversify";
import { Blog } from "../model/dao/Blog";
import { Post } from "../model/dao/Post";
import { Subscription } from "../model/dao/Subscription";
import Database = require("better-sqlite3");
import { User } from "../model/dao/User";

@injectable()
export class InstagramDao {
  private DB_FILE = "./.data/sqlite.db";
  private db: Database.Database;

  public constructor() {
    this.db = new Database(this.DB_FILE);
    this.createTables();
  }

  /*eslint-disable */
  private createTables(): void {
    this.db.transaction((): void => {
      this.db.prepare(`CREATE TABLE IF NOT EXISTS MessengerUser (
        psid TEXT PRIMARY KEY,
        enableNotification INTEGER
      )`).run();
      this.db.prepare(`CREATE TABLE IF NOT EXISTS InstagramBlog (
        id INTEGER PRIMARY KEY, 
        name TEXT NOT NULL,
        UNIQUE(name)
      )`).run();
      this.db.prepare(`CREATE TABLE IF NOT EXISTS MessengerInstagramSubscription (
        psid TEXT,
        blogId INTEGER,
        PRIMARY KEY(psid, blogId),
        FOREIGN KEY(psid) REFERENCES MessengerUser(psid),
        FOREIGN KEY(blogId) REFERENCES InstagramBlog(id)
      )`).run();
      this.db.prepare(`CREATE TABLE IF NOT EXISTS SentInstagramPost (
        psid TEXT,
        blogId INTEGER,
        postId TEXT,
        transactToTs TEXT NOT NULL,
        transactFromTs TEXT NOT NULL,
        PRIMARY KEY(psid, blogId, postId),
        FOREIGN KEY(psid, blogId) REFERENCES MessengerInstagramSubscription(psid, blogId) ON DELETE CASCADE
      )`).run();
    })();
  }
  /*eslint-enable */

  public insertUser(psid: string, enableNotification: boolean): void {
    const stmt = this.db.prepare(
      "INSERT OR IGNORE INTO MessengerUser(psid, enableNotification) VALUES (?, ?)"
    );
    stmt.run(psid, enableNotification ? 1 : 0);
  }

  public getUsers(): User[] {
    const stmt = this.db.prepare(
      "SELECT psid, enableNotification FROM MessengerUser"
    );
    const users = stmt.all().map(
      (row: any): User => {
        return {
          psid: row.psid,
          enableNotification: row.enableNotification === 1 ? true : false,
        };
      }
    );
    return users;
  }

  public updateNotificationFlag(
    psid: string,
    enableNotification: boolean
  ): void {
    const stmt = this.db.prepare(
      "UPDATE MessengerUser SET enableNotification = ? WHERE psid = ?"
    );
    stmt.run(enableNotification ? 1 : 0, psid);
  }

  public getOrInsertBlog(blogName: string): Blog {
    const stmt = this.db.prepare(
      "INSERT OR IGNORE INTO InstagramBlog(name) VALUES (?)"
    );
    stmt.run(blogName);
    const blog = this.getBlog(blogName);
    if (blog) return blog;
    else throw new Error(`Failed to retrieve blog ${blogName}`);
  }

  public insertSubscription(psid: string, blogId: number): void {
    const stmt = this.db.prepare(
      "INSERT OR IGNORE INTO MessengerInstagramSubscription(psid, blogId) VALUES (?, ?)"
    );
    stmt.run(psid, blogId);
  }

  public insertPost(psid: string, blogId: number, postId: string): void {
    this.db.transaction((): void => {
      const updateStmt = this.db.prepare(
        "UPDATE SentInstagramPost SET transactToTs = datetime('now') WHERE psid = ? AND blogId = ?"
      );
      updateStmt.run(psid, blogId);
      const insertStmt = this.db.prepare(
        "INSERT INTO SentInstagramPost(psid, blogId, postId, transactToTs, transactFromTs) VALUES (?, ?, ?, datetime('9999-12-31 00:00:00'), datetime('now'))"
      );
      insertStmt.run(psid, blogId, postId);
    })();
  }

  public getBlog(blogName: string): Blog | undefined {
    const stmt = this.db.prepare(
      "SELECT id, name FROM InstagramBlog WHERE name = ?"
    );
    return stmt.get(blogName);
  }

  public getSubscriptionsByPsid(psid: string): Subscription[] {
    const stmt = this.db.prepare(
      `SELECT s.psid, s.blogId, b.name AS blogName 
       FROM MessengerInstagramSubscription s
       INNER JOIN InstagramBlog b
       ON s.blogId = b.id
       WHERE s.psid = ?`
    );
    return stmt.all(psid);
  }

  public getSubscriptionsByBlogId(blogId: number): Subscription[] {
    const stmt = this.db.prepare(
      `SELECT s.psid, s.blogId, b.name AS blogName 
       FROM MessengerInstagramSubscription s
       INNER JOIN InstagramBlog b
       ON s.blogId = b.id
       WHERE s.blogId = ?`
    );
    return stmt.all(blogId);
  }

  public getLatestSentPosts(psid: string): Post[] {
    const stmt = this.db.prepare(
      "SELECT psid, blogId, postId, transactFromTs FROM SentInstagramPost WHERE psid = ? AND transactToTs = datetime('9999-12-31 00:00:00.000')"
    );
    return stmt.all(psid);
  }

  public deleteBlog(blogId: number): void {
    const stmt = this.db.prepare("DELETE FROM InstagramBlog WHERE id = ?");
    stmt.run(blogId);
  }

  public deleteSubscription(psid: string, blogId: number): void {
    const stmt = this.db.prepare(
      "DELETE FROM MessengerInstagramSubscription WHERE psid = ? AND blogId = ?"
    );
    stmt.run(psid, blogId);
  }
}
