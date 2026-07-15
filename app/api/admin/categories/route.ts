import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Category from '@/lib/models/Category';
import { checkAdmin } from '@/lib/utils/adminCheck';

export async function GET(request: Request) {
  const isAdmin = await checkAdmin(request);
  if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    await dbConnect();
    const categories = await Category.find().sort({ _id: -1 });
    return NextResponse.json(categories);
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const isAdmin = await checkAdmin(request);
  if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    await dbConnect();
    const data = await request.json();

    const existing = await Category.findOne({ categoryName: data.categoryName });
    if (existing) {
      return NextResponse.json({ error: 'Category already exists' }, { status: 400 });
    }

    const newCategory = new Category({ categoryName: data.categoryName, isList: true });
    await newCategory.save();
    return NextResponse.json(newCategory, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const isAdmin = await checkAdmin(request);
  if (!isAdmin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    await dbConnect();
    const { _id, categoryName, isList } = await request.json();

    if (categoryName) {
      const existing = await Category.findOne({ categoryName, _id: { $ne: _id } });
      if (existing) {
        return NextResponse.json({ error: 'Category name already exists' }, { status: 400 });
      }
    }

    const updated = await Category.findByIdAndUpdate(_id, { categoryName, isList }, { new: true });
    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 });
  }
}
