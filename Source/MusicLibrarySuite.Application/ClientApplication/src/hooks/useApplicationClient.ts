import { useState } from "react";
import { ApplicationClient } from "../api/ApplicationClient";

export default function useApplicationClient(baseUrl?: string | undefined): ApplicationClient {
  const [applicationClient] = useState<ApplicationClient>(new ApplicationClient(baseUrl));

  return applicationClient;
}
