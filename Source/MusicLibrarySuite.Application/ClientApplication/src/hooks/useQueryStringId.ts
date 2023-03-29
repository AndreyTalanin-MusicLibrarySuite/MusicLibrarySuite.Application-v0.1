import React, { Dispatch, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

export default function useQueryStringId(required: boolean): [string | undefined, Dispatch<React.SetStateAction<string | undefined>>] {
  const [searchParams] = useSearchParams();

  const [id, setId] = useState<string>();

  useEffect(() => {
    if (searchParams.has("id")) {
      setId(searchParams.get("id") as string);
    } else {
      setId(undefined);
      if (required) {
        alert("No identifier was specified in the query string. Please, specify one as a value for the 'id' parameter.");
      }
    }
  }, [required, searchParams]);

  return [id, setId];
}
