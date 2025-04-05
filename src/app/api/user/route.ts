import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { name, email, supabaseId } = await req.json();
    
    // 基本的なバリデーション
    if (!name || !email) {
      return NextResponse.json(
        { error: '必須項目が不足しています' },
        { status: 400 }
      );
    }
    
    // メールアドレスの重複チェック
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    
    if (existingUser) {
      // 既に存在する場合は成功として返す（登録済みとみなす）
      return NextResponse.json({
        success: true,
        user: {
          id: existingUser.id,
          name: existingUser.name,
          email: existingUser.email,
        }
      });
    }
    
    // PrismaでDBにユーザーを作成
    const user = await prisma.user.create({
      data: {
        name,
        email,
        // supabaseIdを保存する場合
        // supabaseId: supabaseId,
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
    console.error('User creation error:', error);
    return NextResponse.json(
      { error: 'ユーザー登録中にエラーが発生しました' },
      { status: 500 }
    );
  }
}