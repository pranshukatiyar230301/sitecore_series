import { useMutation } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { type InsertContact } from "@shared/schema";

export function useSubmitContact() {
  return useMutation({
    mutationFn: async (data: InsertContact) => {
      const res = await fetch(api.contact.submit.path, {
        method: api.contact.submit.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (!res.ok) {
        const errorData = await res.json();
        // Try to parse as the expected error format
        const error = api.contact.submit.responses[400].safeParse(errorData);
        if (error.success) {
          throw new Error(error.data.message);
        }
        throw new Error("Failed to submit message");
      }

      return api.contact.submit.responses[201].parse(await res.json());
    },
  });
}
