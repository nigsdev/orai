import { redirect } from "next/navigation"

export default function Home() {
  // Redirect to chat page as it's the default selected item
  redirect("/chat")
}
