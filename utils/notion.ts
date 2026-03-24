import { Client } from '@notionhq/client';

const notion = new Client({ auth: process.env.NOTION_TOKEN });

export interface Project {
  id: string;
  title: string;
  desc: string;
  link: string;
  github: string;
  image?: string;
}

export async function getProjectsFromNotion(): Promise<Project[]> {
  const dataSourceId = process.env.NOTION_PROJECTS_DB_ID;
  if (!dataSourceId || !process.env.NOTION_TOKEN) return [];

  // Disable ts complaints for dynamically-injected latest endpoints
  try {
    // @ts-ignore
    const response = await notion.dataSources.query({
      data_source_id: dataSourceId,
    });

    return response.results.map((page: any) => {
      const p = page.properties;
      return {
        id: page.id,
        title: p.Title?.title?.[0]?.plain_text || "Untitled",
        desc: p.Description?.rich_text?.[0]?.plain_text || "",
        link: p.Link?.url || p.Link?.rich_text?.[0]?.plain_text || p.Link?.title?.[0]?.plain_text || "",
        github: p.GitHub?.url || p.GitHub?.rich_text?.[0]?.plain_text || p.GitHub?.title?.[0]?.plain_text || "",
        image: p.Image?.files?.[0]?.file?.url || p.Image?.files?.[0]?.external?.url || "",
      };
    });
  } catch (error) {
    console.error("Error fetching Notion projects:", error);
    return [];
  }
}

export async function addContactToNotion(name: string, email: string, subject: string, message: string) {
  const dataSourceId = process.env.NOTION_CONTACT_DB_ID;
  if (!dataSourceId || !process.env.NOTION_TOKEN) {
    console.warn("Notion Contact DB not configured. Missing NOTION_TOKEN or NOTION_CONTACT_DB_ID.");
    return;
  }

  try {
    // @ts-ignore - latest SDK requires data_source_id for multiple data sources DBs
    await notion.pages.create({
      parent: { data_source_id: dataSourceId },
      properties: {
        Name: {
          title: [
            {
              text: { content: name }
            }
          ]
        },
        Email: {
          email: email
        },
        Subject: {
          rich_text: [
            {
              text: { content: subject }
            }
          ]
        },
        Message: {
          rich_text: [
            {
              text: { content: message }
            }
          ]
        },
        Date: {
          date: {
            start: new Date().toISOString()
          }
        }
      }
    });
  } catch (error) {
    console.error("Error saving contact to Notion:", error);
    throw error;
  }
}
