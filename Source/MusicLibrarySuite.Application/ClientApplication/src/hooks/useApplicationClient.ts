import { useState } from "react";
import { ApplicationClient } from "../api/ApplicationClient";

const useApplicationClient = (baseUrl?: string | undefined) => {
  const [applicationClient] = useState<ApplicationClient>(new ApplicationClient(baseUrl));

  return applicationClient;
};

export default useApplicationClient;
