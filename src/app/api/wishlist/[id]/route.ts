// /app/api/wishlist/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

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
    
    // 指定されたIDの行きたい場所が存在し、かつ現在のユーザーが所有者であることを確認
    const wishlistPlace = await prisma.wishlistPlace.findUnique({
      where: { id },
      select: { userId: true },
    });
    
    if (!wishlistPlace) {
      return NextResponse.json(
        { error: '指定された行きたい場所が見つかりません' },
        { status: 404 }
      );
    }
    
    if (wishlistPlace.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'この行きたい場所を削除する権限がありません' },
        { status: 403 }
      );
    }
    
    // 行きたい場所を削除
    await prisma.wishlistPlace.delete({
      where: { id },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting wishlist place:', error);
    return NextResponse.json(
      { error: '行きたい場所の削除中にエラーが発生しました' },
      { status: 500 }
    );
  }
}