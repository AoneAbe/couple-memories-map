import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'ログインが必要です' },
        { status: 401 }
      );
    }
    
    const memories = await prisma.memory.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        memoryImages: true,
      },
      orderBy: {
        date: 'desc',
      },
    });
    
    return NextResponse.json(memories);
  } catch (error) {
    console.error('Error fetching memories:', error);
    return NextResponse.json(
      { error: '思い出の取得中にエラーが発生しました' },
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
    
    // 画像データを抽出
    const imageData = body.uploadedImages?.map((img: {url?: string, filename: string, type: string}) => ({
      url: img.url,
      filename: img.filename,
      type: img.type || 'image'
    })) || [];
    
    // Memoryエントリを作成
    const memory = await prisma.memory.create({
      data: {
        title: body.title,
        description: body.description,
        latitude: body.latitude,
        longitude: body.longitude,
        date: body.date ? new Date(body.date) : new Date(),
        stampType: body.stampType || 'default',
        address: body.address,
        placeName: body.placeName,
        placeDetails: body.placeDetails ? body.placeDetails : undefined,
        userId: session.user.id,
        memoryImages: {
          create: imageData
        }
      },
      include: {
        memoryImages: true
      }
    });
    
    return NextResponse.json(memory);
  } catch (error) {
    console.error('Error creating memory:', error);
    return NextResponse.json(
      { error: '思い出の作成中にエラーが発生しました' },
      { status: 500 }
    );
  }
}