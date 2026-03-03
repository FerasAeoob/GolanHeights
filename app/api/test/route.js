import connectDB from "@/lib/mongodb";

export async function GET() {
    try {
        const mongoose = await connectDB();
        await mongoose.connection.db.command({ ping: 1 });

        return Response.json({ message: "MongoDB connected successfully ✅" });
    } catch (error) {
        console.error(error);
        return Response.json({ error: "Connection failed ❌" });
    }
}