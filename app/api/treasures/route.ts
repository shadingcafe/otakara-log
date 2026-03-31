import { createClient } from "@supabase/supabase-js";

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const userId = searchParams.get("user_id");
    const supabase = getSupabase();

    if (id) {
      const { data, error } = await supabase
        .from("treasures")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return Response.json({ success: true, data });
    }

    if (!userId) {
      return Response.json(
        { success: false, error: "user_id is required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("treasures")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return Response.json({ success: true, data: data || [] });
  } catch (error) {
    console.error("Treasures GET error:", error);
    return Response.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "データ取得に失敗しました",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const supabase = getSupabase();

    const { data, error } = await supabase
      .from("treasures")
      .insert({
        user_id: body.user_id,
        name: body.name,
        scientific_name: body.scientific_name,
        weight: body.weight,
        energy: body.energy,
        description: body.description,
        image: body.image,
        rotation: body.rotation,
        raw_response: body.raw_response,
      })
      .select()
      .single();

    if (error) throw error;
    return Response.json({ success: true, data });
  } catch (error) {
    console.error("Treasures POST error:", error);
    return Response.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "保存に失敗しました",
      },
      { status: 500 }
    );
  }
}
