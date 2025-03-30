// app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';
import { supabaseAdmin } from '@/lib/supabase';

// 許可するファイルタイプ
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(req: NextRequest) {
  try {
    // セッションチェック
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'ログインが必要です' },
        { status: 401 }
      );
    }

    // フォームデータを取得
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: 'ファイルが見つかりません' },
        { status: 400 }
      );
    }

    // ファイルタイプをチェック
    const isImage = ALLOWED_IMAGE_TYPES.includes(file.type);
    const isVideo = ALLOWED_VIDEO_TYPES.includes(file.type);

    if (!isImage && !isVideo) {
      return NextResponse.json(
        { error: '画像（JPG、PNG、GIF、WebP）または動画（MP4、WebM、QuickTime）のみアップロードできます' },
        { status: 400 }
      );
    }

    // ファイルサイズをチェック
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'ファイルサイズは10MB以下にしてください' },
        { status: 400 }
      );
    }

    // ユーザーIDを取得
    const userId = session.user.id;

    // ファイル名を生成
    const fileExtension = file.name.split('.').pop();
    const fileName = `${uuidv4()}.${fileExtension}`;
    const folderPath = isVideo ? `videos/${userId}` : `images/${userId}`;
    const filePath = `${folderPath}/${fileName}`;
    
    // ファイルの内容を取得
    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);
    
    // Supabase Storageにアップロード
    const supabase = supabaseAdmin();
    const { error } = await supabase
      .storage
      .from('memory-media') // バケット名（事前に作成しておく必要あり）
      .upload(filePath, fileBuffer, {
        contentType: file.type,
        cacheControl: '3600'
      });
    
    if (error) {
      console.error('Storage upload error:', error);
      return NextResponse.json(
        { error: 'ファイルのアップロードに失敗しました' },
        { status: 500 }
      );
    }
    
    // 公開URLを取得
    const { data: { publicUrl } } = supabase
      .storage
      .from('memory-media')
      .getPublicUrl(filePath);
    
    return NextResponse.json({
      url: publicUrl,
      filename: file.name,
      id: fileName,
      type: isVideo ? 'video' : 'image'
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'ファイルのアップロード中にエラーが発生しました' },
      { status: 500 }
    );
  }
}