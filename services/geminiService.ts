
import { GoogleGenAI, Type } from "@google/genai";
import type { AttractivenessOutput } from '../types';

const GEMINI_MODEL_NAME = "gemini-2.5-flash";

function buildPrompt(fact: string): string {
  return `
You are an expert in transforming company facts into compelling recruitment narratives.
Your goal is to take a given {FACT} about a company and generate "Attractiveness Points" to be used in recruitment.
These points should be categorized into "Rational Viewpoint" (合理的魅力) and "Emotional Viewpoint" (情理的魅力).
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
    *   Example Transformation:
        *   Fact: "Our sales consultants can do demand design and target design."
        *   Data (Illustrative): "Out of 10,000 sales consultant roles, only 500 require both demand and target design."
        *   Attractiveness (Scarcity): "Only 5% of sales consultant roles require both demand and target design, making our consultants possess a rare and valuable skillset."
6.  **Combine Rational and Emotional Appeals:**
    *   **Rational (Logic):** Focus on tangible benefits, data, efficiency, market position.
        *   Example: "Our company is #1 in the XX industry, with revenues twice that of the #2 company. This provides stability and market leadership."
    *   **Emotional (Feeling):** Focus on mission, impact, culture, pride, sense of belonging, personal growth narrative.
        *   Example: "Being #1 by such a margin isn't just a number; it's a testament to our team's dedication. It instills a sense of pride and responsibility, like leading your class in a subject, knowing you set the standard and inspire others. We're not just building a company; we're shaping the industry for the better, ensuring everyone involved thrives. This brings immense job satisfaction."

## Input Fact:
${fact}

## Instructions for Output
Ensure titles and descriptions are in Japanese, suitable for a Japanese audience.
Ensure each description incorporates the principles of width, depth, numerical perspective, scarcity (where applicable), and the rational/emotional appeal as appropriate for its category. Use the examples provided in the user's original request to guide your tone and content. Titles should be concise and impactful. Descriptions should be comprehensive but clear.

Specifically, use the following examples as a guide for quality and structure of your generated points.

### Example User Input Fact (Japanese):
"当社のインフラエンジニアは優秀です。"

### Desired Example Output Structure (internal thought process, you will provide JSON in Japanese):

**合理的観点 (Rational Viewpoint)**
1.  **高い専門性:** (データを用いて説明。「手術領域は医療業界でも特に高度な専門性が求められる分野の一つです。外科医は全医師の10%未満しかおらず、この希少性が手術領域の重要性を際立たせています。また、手術の成功率は、経験豊富な外科医により10年間で約15%向上しています。この向上率は、内科の治療成功率が同期間で約5%の向上に留まるのに比べて、非常に高い数字です。」など)
2.  **影響の大きさ:** (データを用いて説明。「手術領域での成功は患者の生命に直結します。例えば、手術が成功した場合、患者の5年生存率が40%以上向上することが多くの研究で示されています。他の医療分野、例えば内科的治療では5年生存率の向上は平均で10-15%に留まります。」など)
3.  **限られたイノベーションだが高い影響力:** (データを用いて説明。「手術領域では、新しい技術や方法が導入される頻度が他の分野に比べて低く、進化が慎重に進められます。しかし、一度導入された新技術は大きな影響をもたらします。」など)


**情理的観点 (Emotional Viewpoint)**
1.  **使命感:** (データや物語を交えて説明。「手術は患者の命を救う最前線で行われる作業であり、その重要性はデータでも裏付けられています。外科医の強い使命感を物語っています。」など)
2.  **希少なスキルセット:** (データや物語を交えて説明。「手術領域に携わる外科医は、他の医師にはない独自のスキルと知識を持っています。平均トレーニング時間は他の専門分野を大きく上回ります。」など)
3.  **患者への影響:** (物語やデータを用いて説明。「一人ひとりの患者にとって、手術は人生を左右する大きな出来事です。手術成功による患者の生活の質（QOL）向上率は他の治療法と比較して圧倒的に高い数字です。」など)

Remember to define:
- Fact (事実): Information without relative comparison or scarcity.
- Attractiveness (魅力): Fact + relative comparison + scarcity.
- Importance (重要性): Why the fact/attractiveness matters to the job seeker. (Implicitly cover this in your descriptions).

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
      rationalPoints: {
        type: Type.ARRAY,
        description: "合理的観点からの魅力ポイント",
        items: {
          type: Type.OBJECT,
          properties: {
            title: {
              type: Type.STRING,
              description: "魅力ポイントの簡潔なタイトル",
            },
            description: {
              type: Type.STRING,
              description: "データや比較を交えた詳細な説明",
            },
          },
          required: ["title", "description"],
        },
      },
      emotionalPoints: {
        type: Type.ARRAY,
        description: "情理的観点からの魅力ポイント",
        items: {
          type: Type.OBJECT,
          properties: {
            title: {
              type: Type.STRING,
              description: "魅力ポイントの簡潔なタイトル",
            },
            description: {
              type: Type.STRING,
              description: "感情に訴えかけるようなフレームでの詳細な説明",
            },
          },
          required: ["title", "description"],
        },
      },
    },
    required: ["rationalPoints", "emotionalPoints"],
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
