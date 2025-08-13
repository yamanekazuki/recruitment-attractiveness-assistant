
import { GoogleGenAI, Type } from "@google/genai";
import type { AttractivenessOutput } from '../types';

const GEMINI_MODEL_NAME = "gemini-2.5-flash";

function buildPrompt(fact: string): string {
  return `
You are an expert in transforming company facts into compelling recruitment narratives.
Your goal is to take a given {FACT} about a company and generate "Attractiveness Points" to be used in recruitment.
These points should combine both rational and emotional appeal to create compelling narratives.
Your response must be in Japanese.

Follow these precise instructions:

## Overall Process:
When a user provides a {FACT}, you must:

1.  **Analyze the {FACT}:** Identify key elements and keywords.
2.  **Develop Attractiveness - Width:**
    *   **Industry Comparison:** Highlight advantages over competitors or industry standards.
    *   **Global Perspective:** Compare with national/international trends if relevant.
    *   **Targeted Appeal:** Consider how this fact appeals to different job seeker profiles (e.g., experienced, entry-level).
    *   **Specific Examples:** Illustrate with hypothetical or plausible concrete examples/stories if the fact allows.
3.  **Develop Attractiveness - Depth:**
    *   **Data & Numbers:** Back up claims with specific (even if illustrative, clearly marked as such) numbers or data. For example, "improves X by Y%" or "ranks in the top Z%".
    *   **Quantitative Evaluation:** Use KPIs or performance metrics if applicable.
    *   **Significance to Job Seekers:** Explain how this fact translates to career growth, learning opportunities, or company vision alignment for a potential employee.
4.  **Incorporate Numerical Perspective:**
    *   **Comparative Numbers:** Use numbers to show superiority (e.g., "2x larger than competitor," "5% higher success rate").
    *   **Growth/Change Rates:** Show progress or future potential with rates (e.g., "grown by 20% annually," "reduced error rates by 10%").
    *   **Statistical Data:** Cite general market statistics to highlight relative advantages if possible.
5.  **Emphasize Scarcity Value:**
    *   Clearly state the fact.
    *   Gather or estimate relevant industry data for comparison.
    *   Quantify the scarcity (e.g., "only X% of companies offer this," "one of the few firms with Y capability").
    *   Highlight market demand for this scarce attribute.
6.  **Combine Rational and Emotional Appeals:**
    *   **Rational (Logic):** Focus on tangible benefits, data, efficiency, market position.
    *   **Emotional (Feeling):** Focus on mission, impact, culture, pride, sense of belonging, personal growth narrative.

## Input Fact:
${fact}

## Instructions for Output
Generate 3-5 compelling attractiveness points that combine rational and emotional appeal.
Each point should incorporate the principles of width, depth, numerical perspective, and scarcity where applicable.
Provide a summary that ties all points together.

Ensure titles and descriptions are in Japanese, suitable for a Japanese audience.
Titles should be concise and impactful. Descriptions should be comprehensive but clear.

Remember to define:
- Fact (事実): Information without relative comparison or scarcity.
- Attractiveness (魅力): Fact + relative comparison + scarcity.
- Importance (重要性): Why the fact/attractiveness matters to the job seeker.

Focus on transforming the input {FACT} into these structured, compelling points.
`;
}


export const generateAttractivenessPoints = async (fact: string): Promise<AttractivenessOutput> => {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("APIキーが設定されていません。");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const prompt = buildPrompt(fact);

  const attractivenessSchema = {
    type: Type.OBJECT,
    properties: {
      points: {
        type: Type.ARRAY,
        description: "魅力ポイントの配列",
        items: {
          type: Type.OBJECT,
          properties: {
            title: {
              type: Type.STRING,
              description: "魅力ポイントのタイトル"
            },
            description: {
              type: Type.STRING,
              description: "魅力ポイントの詳細説明"
            }
          },
          required: ["title", "description"]
        }
      },
      summary: {
        type: Type.STRING,
        description: "魅力ポイントの総合評価・まとめ"
      }
    },
    required: ["points"]
  };

  try {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: attractivenessSchema,
      },
    });
    
    try {
      const parsedData = JSON.parse(response.text) as AttractivenessOutput;
      return parsedData;
    } catch (e) {
      console.error("JSONの解析に失敗しました。", e);
      console.error("受け取ったテキスト:", response.text);
      throw new Error(`AIからの応答の解析に失敗しました。有効なJSON形式ではありません。詳細: ${(e as Error).message}`);
    }

  } catch (error) {
    console.error("Gemini APIとの通信中にエラーが発生しました:", error);
    if (error instanceof Error) {
        if (error.message.includes("API key not valid")) {
             throw new Error("APIキーが無効です。正しいAPIキーが設定されているか確認してください。");
        }
    }
    throw new Error(`AIとの通信に失敗しました: ${(error as Error).message}`);
  }
};
