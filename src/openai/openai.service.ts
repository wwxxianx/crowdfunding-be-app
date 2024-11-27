import { Injectable } from '@nestjs/common';
import { OpenAI } from 'openai';
import { CampaignCategory } from '@prisma/client';
import { ConfigService } from '@nestjs/config';

export type CampaignUpdatePostPayload = {
  campaignCategory: CampaignCategory;
  topic: string;
};

@Injectable()
export class OpenAIService {
  private openai: OpenAI;

  constructor(private configService: ConfigService) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
      baseURL: this.configService.get<string>('OPENAI_BASE_URL'),
    });
  }

  async createCampaignUpdatePostRecommendation(
    payload: CampaignUpdatePostPayload,
  ): Promise<Result<{ title: string; description: string }>> {
    try {
      const { campaignCategory, topic } = payload;
      const systemMessage = `You are an AI assistant that helps generate suitable titles and descriptions for fundraising campaign update posts. The update posts should be appropriate and good enough to engage donors and improve campaign performance.`;
      const userMessage = `Generate a suitable title and description for a fundraising campaign update post. 
                            Please include one appropriate emoji in the title and at least one appropraite emoji in the description as well.
                            Campaign's category: ${campaignCategory.title}. 
                            Keywords: Donation, Greeting, Kindness.
                            Update post topic: ${topic}.
                            Please provide the response in the following JSON format:
                            {"title": "Your generated title here", "description": "Your generated description here"}`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: userMessage },
        ],
        temperature: 0.3,
        max_tokens: 80,
      });
      const messageContent = response.choices[0].message.content;
      const jsonResponse = JSON.parse(messageContent);

      return { data: jsonResponse };
    } catch (e) {
      return { data: null, error: `Failed to generate recommendation. ${e}` };
    }
  }
}
