import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // POSTメソッドのみ許可
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userEmail, userPassword, adminEmail } = req.body;

    // 必須パラメータのチェック
    if (!userEmail || !userPassword || !adminEmail) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    // メール送信の処理
    const emailContent = `
採用魅力発見アシスタント - アカウント発行のお知らせ

管理者からアカウントが発行されました。

【アカウント情報】
メールアドレス: ${userEmail}
パスワード: ${userPassword}

【ログイン方法】
以下のURLからログインしてください：
https://recruitment-attractiveness-assistan-theta.vercel.app

【注意事項】
・このパスワードは安全に管理してください
・アカウントに関するお問い合わせは管理者までお願いします

---
採用魅力発見アシスタント
管理者: ${adminEmail}
    `;

    // 実際のメール送信処理
    // ここではコンソールに出力（本格的な実装では外部メールサービスを使用）
    console.log('=== アカウント発行メール ===');
    console.log(`送信先: ${userEmail}`);
    console.log(`内容: ${emailContent}`);
    console.log('========================');

    // 成功レスポンス
    res.status(200).json({ 
      success: true, 
      message: 'アカウント通知メールが送信されました',
      userEmail: userEmail
    });

  } catch (error) {
    console.error('メール送信エラー:', error);
    res.status(500).json({ 
      error: 'メール送信に失敗しました',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
