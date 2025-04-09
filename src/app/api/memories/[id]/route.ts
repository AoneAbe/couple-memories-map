import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
// import { Route } from 'next';

type ImageDataInput = {
  id?: string;
  url?: string;
  filename: string;
  type: string;
}

// PUT メソッドを追加
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
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
    
    // 画像データを抽出
    const imageData = body.images?.map((img: ImageDataInput) => {
      // 既存の画像はそのまま（idがある場合）
      if (img.id) {
        return {
          id: img.id,
          url: img.url,
          filename: img.filename,
          type: img.type || 'image'
        };
      }
      
      // 新しい画像は作成（idがない場合）
      return {
        url: img.url,
        filename: img.filename,
        type: img.type || 'image'
      };
    }) || [];

    // Memoryエントリを更新
    const updatedMemory = await prisma.memory.update({
      where: { id },
      data: {
        title: body.title,
        description: body.description,
        latitude: body.latitude,
        longitude: body.longitude,
        date: body.date ? new Date(body.date) : undefined,
        stampType: body.stampType || 'default',
        address: body.address,
        placeName: body.placeName,
        placeDetails: body.placeDetails ? {
          formatted_address: body.placeDetails.formatted_address,
          name: body.placeDetails.name,
          geometry: body.placeDetails.geometry,
          photos: body.placeDetails.photos,
          url: body.placeDetails.url,
          place_id: body.placeDetails.place_id,
          types: body.placeDetails.types
        } : undefined,
      },
      include: {
        memoryImages: true
      }
    });

    // 既存の画像IDを取得
    const existingImageIds = updatedMemory.memoryImages.map(img => img.id);
    
    // 送信された画像IDを取得
    const submittedImageIds = imageData
      .filter((img: ImageDataInput) => img.id)
      .map((img: ImageDataInput) => img.id);
    
    // 削除する画像を特定
    const imagesToDelete = existingImageIds.filter(id => !submittedImageIds.includes(id));
    
    // 画像の削除
    if (imagesToDelete.length > 0) {
      await prisma.memoryImage.deleteMany({
        where: {
          id: { in: imagesToDelete }
        }
      });
    }
    
    // 新しい画像を追加
    const newImages = imageData.filter((img: ImageDataInput) => !img.id);
    
    if (newImages.length > 0) {
      await prisma.memoryImage.createMany({
        data: newImages.map((img: ImageDataInput) => ({
          memoryId: id,
          url: img.url,
          filename: img.filename,
          type: img.type,
          createdBy: session.user.id
        }))
      });
    }
    
    // 更新後のメモリを再取得
    const finalMemory = await prisma.memory.findUnique({
      where: { id },
      include: {
        memoryImages: true
      }
    });
    
    return NextResponse.json(finalMemory);
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
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  // ESLint
  console.log(req)
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'ログインが必要です' },
        { status: 401 }
      );
    }
     
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