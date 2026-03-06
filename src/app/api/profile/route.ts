import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";

// GET - Get user profile
export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: {
                id: true,
                name: true,
                email: true,
                height: true,
                weight: true,
                age: true,
                gender: true,
                fitnessGoal: true,
                createdAt: true,
            },
        });

        return NextResponse.json(user);
    } catch (error) {
        console.error("Error fetching profile:", error);
        return NextResponse.json(
            { error: "Failed to fetch profile" },
            { status: 500 }
        );
    }
}

// PUT - Update user profile
export async function PUT(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { name, height, weight, age, gender, fitnessGoal } = body;

        const user = await prisma.user.update({
            where: { id: session.user.id },
            data: {
                name: name || undefined,
                height: height !== undefined ? height : undefined,
                weight: weight !== undefined ? weight : undefined,
                age: age !== undefined ? age : undefined,
                gender: gender || undefined,
                fitnessGoal: fitnessGoal || undefined,
            },
            select: {
                id: true,
                name: true,
                email: true,
                height: true,
                weight: true,
                age: true,
                gender: true,
                fitnessGoal: true,
            },
        });

        // If weight was updated, also create a body weight log
        if (weight !== undefined && weight !== null) {
            await prisma.bodyWeightLog.create({
                data: {
                    userId: session.user.id,
                    weight,
                },
            });
        }

        return NextResponse.json(user);
    } catch (error) {
        console.error("Error updating profile:", error);
        return NextResponse.json(
            { error: "Failed to update profile" },
            { status: 500 }
        );
    }
}
