import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import prisma from '@/lib/prisma';

// Supabaseクライアントの初期化
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();
    
    // 基本的なバリデーション
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: '必須項目が不足しています' },
        { status: 400 }
      );
    }
    
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'パスワードは6文字以上で入力してください' },
        { status: 400 }
      );
    }
    
    // メールアドレスの重複チェック
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    
    if (existingUser) {
      return NextResponse.json(
        { error: 'このメールアドレスは既に登録されています' },
        { status: 400 }
      );
    }
    
    // Supabaseで認証ユーザーを作成
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // メール認証を自動的に完了する
      user_metadata: { name }
    });
    
    if (authError) {
      console.error('Supabase auth error:', authError);
      return NextResponse.json(
        { error: '認証ユーザーの作成に失敗しました' },
        { status: 500 }
      );
    }
    
    // PrismaでDBにユーザーを作成
    const user = await prisma.user.create({
      data: {
        name,
        email,
        // supabase_uidとしてSupabase側のUIDを関連付ける場合は追加する
        // supabase_uid: authData.user.id,
      },
    });
    
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'ユーザー登録中にエラーが発生しました' },
      { status: 500 }
    );
  }
}