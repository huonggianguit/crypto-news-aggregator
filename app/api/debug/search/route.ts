import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const { message, searchType, searchValue } = await req.json();

    const results: Record<string, any> = {
      message,
      searchType,
      searchValue,
      tests: {}
    };

    // Test 1: Direct keyword search
    const keywordSearch = await prisma.post.findMany({
      where: {
        OR: [
          { title: { contains: searchValue || message, mode: Prisma.QueryMode.insensitive } },
          { description: { contains: searchValue || message, mode: Prisma.QueryMode.insensitive } }
        ]
      },
      take: 5,
      select: { id: true, title: true, slug: true }
    });
    results.tests.keywordSearch = { 
      count: keywordSearch.length, 
      items: keywordSearch.map(p => p.title) 
    };

    // Test 2: Search for "xã hội"
    const xaHoiSearch = await prisma.post.findMany({
      where: {
        OR: [
          { title: { contains: "xã hội", mode: Prisma.QueryMode.insensitive } },
          { description: { contains: "xã hội", mode: Prisma.QueryMode.insensitive } }
        ]
      },
      take: 5,
      select: { id: true, title: true, slug: true }
    });
    results.tests.xaHoiSearch = { 
      count: xaHoiSearch.length, 
      items: xaHoiSearch.map(p => p.title) 
    };

    // Test 3: Search for "bắt buộc"
    const batBuocSearch = await prisma.post.findMany({
      where: {
        OR: [
          { title: { contains: "bắt buộc", mode: Prisma.QueryMode.insensitive } },
          { description: { contains: "bắt buộc", mode: Prisma.QueryMode.insensitive } }
        ]
      },
      take: 5,
      select: { id: true, title: true, slug: true }
    });
    results.tests.batBuocSearch = { 
      count: batBuocSearch.length, 
      items: batBuocSearch.map(p => p.title) 
    };

    // Test 4: Search for "đóng"
    const dongSearch = await prisma.post.findMany({
      where: {
        OR: [
          { title: { contains: "đóng", mode: Prisma.QueryMode.insensitive } },
          { description: { contains: "đóng", mode: Prisma.QueryMode.insensitive } }
        ]
      },
      take: 5,
      select: { id: true, title: true, slug: true }
    });
    results.tests.dongSearch = { 
      count: dongSearch.length, 
      items: dongSearch.map(p => p.title) 
    };

    // Test 5: Check bhxh-bhyt category
    const bhxhCategory = await prisma.category.findUnique({
      where: { slug: "bhxh-bhyt" },
      include: { posts: { take: 10, select: { id: true, title: true } } }
    });
    results.tests.bhxhCategory = {
      found: !!bhxhCategory,
      posts: bhxhCategory?.posts.map(p => p.title) || []
    };

    return NextResponse.json(results);
  } catch (error) {
    console.error("Debug error:", error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
