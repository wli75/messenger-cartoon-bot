import { injectable } from "inversify";
import { launch } from "puppeteer";
import { Post } from "../model/instagram/Post";
import logger from "../util/logger";

@injectable()
export class InstagramService {
  private BLOGNAME_PLACEHOLDER = "BLOGNAME_PLACEHOLDER";
  private POSTS_URI = "https://www.instagram.com/BLOGNAME_PLACEHOLDER";

  public async getLatestPost(blogName: string): Promise<Post | undefined> {
    logger.info(`[Try] Retreive [${blogName}]'s latest Instagram post`);
    const browser = await launch({ args: ["--no-sandbox"] }); // Must add no-sandbox for glitch to work;
    const page = await browser.newPage();
    await page.goto(
      this.POSTS_URI.replace(this.BLOGNAME_PLACEHOLDER, blogName)
    );

    const post = await page.evaluate((): Post | undefined => {
      const linkElement = document.querySelector("body main article a");
      if (linkElement) {
        const id = linkElement.getAttribute("href");
        const imgElement = linkElement.querySelector("img");
        if (id && imgElement) {
          const uri = imgElement.getAttribute("src");
          if (uri) return { id: id, uri: uri };
        }
      }
      return undefined;
    });

    if (post) {
      logger.info(
        `[Success] Retrieved [${blogName}]'s latest Instagram post [id: ${post.id}, uri: ${post.uri}]`
      );
    } else {
      logger.info(`[Success] No posts found for [${blogName}]`);
    }

    browser.close();
    return post;
  }
}
