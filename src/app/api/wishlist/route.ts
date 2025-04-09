// /app/api/wishlist/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    // ESLint
    console.log(req)
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'ログインが必要です' },
        { status: 401 }
      );
    }
    
    const wishlistPlaces = await prisma.wishlistPlace.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' }
      ],
    });
    
    return NextResponse.json(wishlistPlaces);
  } catch (error) {
    console.error('Error fetching wishlist places:', error);
    return NextResponse.json(
      { error: '行きたい場所の取得中にエラーが発生しました' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'ログインが必要です' },
        { status: 401 }
      );
    }
    
    const body = await req.json();
    
    // 基本的なバリデーション
    if (!body.title || !body.latitude || !body.longitude) {
      return NextResponse.json(
        { error: '必須項目が不足しています' },
        { status: 400 }
      );
    }
    
    // 優先度のバリデーション
    const priority = Number(body.priority) || 3;
    if (priority < 1 || priority > 5) {
      return NextResponse.json(
        { error: '優先度は1から5の間で指定してください' },
        { status: 400 }
      );
    }
    
    // WishlistPlaceエントリを作成
    const wishlistPlace = await prisma.wishlistPlace.create({
      data: {
        title: body.title,
        description: body.description,
        latitude: body.latitude,
        longitude: body.longitude,
        priority: priority,
        address: body.address,
        placeName: body.placeName,
        placeDetails: body.placeDetails ? body.placeDetails : undefined,
        userId: session.user.id,
      }
    });
    
    return NextResponse.json(wishlistPlace);
  } catch (error) {
    console.error('Error creating wishlist place:', error);
    return NextResponse.json(
      { error: '行きたい場所の作成中にエラーが発生しました' },
      { status: 500 }
    );
  }
}