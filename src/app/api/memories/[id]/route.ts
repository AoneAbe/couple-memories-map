import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// PUT メソッドを追加
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'ログインが必要です' },
        { status: 401 }
      );
    }
    
    const id = params.id;
    const body = await req.json();
    
    // 基本的なバリデーション
    if (!body.title || !body.latitude || !body.longitude) {
      return NextResponse.json(
        { error: '必須項目が不足しています' },
        { status: 400 }
      );
    }
    
    // 思い出の所有者確認
    const memory = await prisma.memory.findUnique({
      where: { id },
      select: { userId: true },
    });
    
    if (!memory) {
      return NextResponse.json(
        { error: '指定された思い出が見つかりません' },
        { status: 404 }
      );
    }
    
    if (memory.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'この思い出を編集する権限がありません' },
        { status: 403 }
      );
    }
    
    // Memoryエントリを更新
    const updatedMemory = await prisma.memory.update({
      where: { id },
      data: {
        title: body.title,
        description: body.description,
        date: body.date ? new Date(body.date) : undefined,
        stampType: body.stampType || 'default',
        // 他のフィールドも更新
      },
      include: {
        memoryImages: true
      }
    });
    
    return NextResponse.json(updatedMemory);
  } catch (error) {
    console.error('Error updating memory:', error);
    return NextResponse.json(
      { error: '思い出の更新中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'ログインが必要です' },
        { status: 401 }
      );
    }
    
    const id = params.id;
    
    // 指定されたIDの思い出が存在し、かつ現在のユーザーが所有者であることを確認
    const memory = await prisma.memory.findUnique({
      where: { id },
      select: { userId: true },
    });
    
    if (!memory) {
      return NextResponse.json(
        { error: '指定された思い出が見つかりません' },
        { status: 404 }
      );
    }
    
    if (memory.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'この思い出を削除する権限がありません' },
        { status: 403 }
      );
    }
    
    // 関連する画像を削除
    await prisma.memoryImage.deleteMany({
      where: { memoryId: id },
    });
    
    // 思い出を削除
    await prisma.memory.delete({
      where: { id },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting memory:', error);
    return NextResponse.json(
      { error: '思い出の削除中にエラーが発生しました' },
      { status: 500 }
    );
  }
}