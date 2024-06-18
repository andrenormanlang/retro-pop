import { Box } from "@chakra-ui/react";
import { createServerClient} from "../../lib/supabase-server";
import PasswordForm from "./password-form";

export default async function UpdatePassword() {
  const supabase = createServerClient();

  const {
    data: { session },
  } = await supabase.auth.getSession();

  return(
  <Box display="flex" alignItems="center" justifyContent="center">
  <PasswordForm user={session?.user} />
  </Box>)
}
