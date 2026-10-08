import "server-only";
import { unstable_cache } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";

const getCachedInformation = unstable_cache(
  async (table: "office_information" | "district_information") => {
    const supabase = createAdminClient();
    const { data, error } = await supabase.from(table).select("*").limit(1).maybeSingle();

    if (error) {
      console.error(`Load ${table} error:`, error);
      return null;
    }

    return data;
  },
  ["public-information-v1"],
  { revalidate: 300, tags: ["public-information"] },
);

export function getPublicInformation(table: "office_information" | "district_information") {
  return getCachedInformation(table);
}
